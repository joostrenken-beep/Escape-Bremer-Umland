import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildContent } from '../scripts/build-content';
import { createCity } from '../scripts/new-city';
import { ApiAccessAdapter, ApiScoreAdapter } from '../src/adapters/api';
import { LocalAccessAdapter } from '../src/adapters/LocalAccessAdapter';
import { LocalScoreAdapter } from '../src/adapters/LocalScoreAdapter';
import { LocalStorageAdapter, MemoryStore } from '../src/adapters/LocalStorageAdapter';
import type { GameResult } from '../src/adapters/types';

const result = (score: number, finishedAt: string): GameResult => ({
  tourId: 't',
  tourVersion: '1',
  difficulty: 'medium',
  score,
  maxScore: 1100,
  timeMs: 1000,
  finishedAt,
  usedTestMode: false,
});

describe('Neue Stadt aus Vorlage', () => {
  it('ist sofort gültig (Schema + Zusammenhänge) und unveröffentlicht', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'stadt-'));
    await createCity('lilienthal', 'Lilienthal', dir);
    const { tours, errors } = await buildContent({ contentDir: dir, dryRun: true, codesOverride: {} });
    expect(errors).toEqual([]);
    expect(tours[0]).toMatchObject({ id: 'lilienthal', published: false, town: { de: 'Lilienthal' } });
    expect(tours[0].codeSalt).toMatch(/^[0-9a-f]{24}$/);
  });

  it('lehnt ungültige IDs und doppelte Städte ab', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'stadt-'));
    await expect(createCity('Fischer Hude', 'x', dir)).rejects.toThrow(/Kleinbuchstaben/);
    await createCity('fischerhude', 'Fischerhude', dir);
    await expect(createCity('fischerhude', 'Fischerhude', dir)).rejects.toThrow(/gibt es schon/);
  });
});

describe('Freischaltcode-Modul', () => {
  async function tourWithAccess(codes?: string[]) {
    const dir = await mkdtemp(join(tmpdir(), 'stadt-'));
    const city = await createCity('testort', 'Testort', dir);
    const tour = JSON.parse(await readFile(join(city, 'tour.json'), 'utf8'));
    tour.access.requireUnlockCode = true;
    await writeFile(join(city, 'tour.json'), JSON.stringify(tour));
    const ex = JSON.parse(await readFile(join(city, 'codes.example.json'), 'utf8'));
    if (codes) ex.access = { codes };
    await writeFile(join(city, 'codes.example.json'), JSON.stringify(ex));
    return buildContent({ contentDir: dir, dryRun: true, codesOverride: {} });
  }

  it('ohne Codes: Build-Fehler', async () => {
    expect((await tourWithAccess()).errors.join()).toMatch(/access\.codes/);
  });

  it('gültiger Code schaltet frei (tolerant), ungültiger nicht; Klartext nicht im Paket', async () => {
    const { tours, errors } = await tourWithAccess(['MOOR-2026']);
    expect(errors).toEqual([]);
    const tour = tours[0];
    expect(JSON.stringify(tour)).not.toMatch(/MOOR-2026/i);
    const adapter = new LocalAccessAdapter(new LocalStorageAdapter(new MemoryStore()));
    expect(await adapter.isUnlocked(tour)).toBe(false);
    expect(await adapter.unlock(tour, 'falsch')).toBe(false);
    expect(await adapter.unlock(tour, ' moor 2026 ')).toBe(true);
    expect(await adapter.isUnlocked(tour)).toBe(true);
  });

  it('Standard aus: Tour ist ohne Code spielbar', async () => {
    const { tours } = await buildContent({ dryRun: true });
    const adapter = new LocalAccessAdapter(new LocalStorageAdapter(new MemoryStore()));
    expect(await adapter.isUnlocked(tours.find((t) => t.id === 'worpswede')!)).toBe(true);
  });
});

describe('Bestenliste', () => {
  it('lokal: sortiert, ohne Doppelte', async () => {
    const s = new LocalScoreAdapter(new LocalStorageAdapter(new MemoryStore()));
    await s.submit(result(500, 'a'));
    await s.submit(result(900, 'b'));
    await s.submit(result(900, 'b'));
    expect((await s.list('t')).map((r) => r.score)).toEqual([900, 500]);
  });

  it('Server: sendet Ergebnis, fällt offline auf lokal zurück', async () => {
    const local = new LocalScoreAdapter(new LocalStorageAdapter(new MemoryStore()));
    const calls: string[] = [];
    const ok = (async (url: string) => {
      calls.push(url);
      return new Response(JSON.stringify([result(1, 'srv')]), { status: 200 });
    }) as unknown as typeof fetch;
    const api = new ApiScoreAdapter('https://api.example', local, ok);
    await api.submit(result(700, 'x'));
    expect(calls).toEqual(['https://api.example/scores']);
    expect((await api.list('t'))[0].finishedAt).toBe('srv');

    const offline = (async () => {
      throw new TypeError('offline');
    }) as unknown as typeof fetch;
    const api2 = new ApiScoreAdapter('https://api.example', local, offline);
    await api2.submit(result(800, 'y'));
    expect((await api2.list('t')).map((r) => r.score)).toEqual([800, 700]);
  });

  it('Server-Freischaltung fragt /access/verify', async () => {
    const f = (async (_url: string, init?: RequestInit) =>
      new Response(JSON.stringify({ valid: JSON.parse(String(init?.body)).code === 'OK' }))) as unknown as typeof fetch;
    const api = new ApiAccessAdapter('https://api.example', new LocalStorageAdapter(new MemoryStore()), f);
    const tour = { id: 't', access: { requireUnlockCode: true } } as never;
    expect(await api.unlock(tour, 'NEIN')).toBe(false);
    expect(await api.unlock(tour, 'OK')).toBe(true);
    expect(await api.isUnlocked(tour)).toBe(true);
  });
});
