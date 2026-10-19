import { mkdtemp, mkdir, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildContent } from '../scripts/build-content';
import { collectUnverified } from '../src/content/verification';

describe('Content im Repo', () => {
  it('besteht Schema- und Zusammenhangsprüfung', async () => {
    const result = await buildContent({ dryRun: true });
    expect(result.errors).toEqual([]);
    expect(result.tours.map((t) => t.id)).toContain('worpswede');
  });

  it('enthält keine Klartext-Antworten im gebauten Paket', async () => {
    const { tours } = await buildContent({
      dryRun: true,
      codesOverride: {
        worpswede: {
          codes: Object.fromEntries(
            Object.keys((await buildContent({ dryRun: true })).tours.find((t) => t.id === 'worpswede')!.codes).map((id) => [
              id,
              { answers: ['QXZ4711GEHEIM'], reveal: { de: 'QXZ4711GEHEIM' } },
            ]),
          ),
        },
      },
    });
    expect(JSON.stringify(tours)).not.toMatch(/qxz4711geheim/i);
  });
});

describe('Content-Prüfung findet Fehler', () => {
  async function fixture(mutate: (tour: any, station: any, codes: any) => void) {
    const dir = await mkdtemp(join(tmpdir(), 'content-'));
    await cp(join(__dirname, '../content/worpswede'), join(dir, 'worpswede'), { recursive: true });
    const read = async (f: string) => JSON.parse(await (await import('node:fs/promises')).readFile(join(dir, 'worpswede', f), 'utf8'));
    const tour = await read('tour.json');
    const station = await read('stations/01-kaffee-worpswede.json');
    const codes = await read('codes.example.json');
    mutate(tour, station, codes);
    await writeFile(join(dir, 'worpswede/tour.json'), JSON.stringify(tour));
    await writeFile(join(dir, 'worpswede/stations/01-kaffee-worpswede.json'), JSON.stringify(station));
    await writeFile(join(dir, 'worpswede/codes.example.json'), JSON.stringify(codes));
    await mkdir(join(dir, 'worpswede/media'), { recursive: true });
    return (await buildContent({ contentDir: dir, dryRun: true, codesOverride: {} })).errors.join('\n');
  }

  it('fehlende Station', async () => {
    expect(await fixture((t) => t.stations.push('99-gibt-es-nicht'))).toMatch(/99-gibt-es-nicht/);
  });
  it('fehlender Code', async () => {
    expect(await fixture((_t, _s, c) => delete c.codes['s01-unlock'])).toMatch(/s01-unlock/);
  });
  it('fehlender Text für eine Stufe', async () => {
    expect(await fixture((_t, s) => (s.story = { easy: { de: 'nur leicht' } }))).toMatch(/kein Text für Stufe medium, hard/);
  });
  it('nicht genau 3 Hinweise', async () => {
    expect(await fixture((_t, s) => s.steps[0].hints.pop())).toMatch(/hints/);
  });
  it('unbekannter Rätseltyp', async () => {
    expect(await fixture((_t, s) => (s.steps[0].type = 'zauberei'))).toMatch(/steps\/0/);
  });
  it('fehlende Mediendatei', async () => {
    expect(await fixture((t) => (t.cover = 'media/fehlt.jpg'))).toMatch(/media\/fehlt\.jpg/);
  });
});

describe('collectUnverified', () => {
  it('findet alle Angaben mit verified: false samt Pfad', () => {
    const items = collectUnverified({ a: { verified: true }, b: [{ verified: false, verifyNote: 'prüfen' }] });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ path: 'b[0]', note: 'prüfen' });
  });
});

describe('collectPlaceholders', () => {
  it('findet [PLATZHALTER]-Texte samt Pfad', async () => {
    const { collectPlaceholders } = await import('../src/content/verification');
    expect(collectPlaceholders({ a: [{ de: '[PLATZHALTER] Weg' }, { de: 'fertig' }] })).toEqual([{ path: 'a[0].de', text: '[PLATZHALTER] Weg' }]);
  });
});
