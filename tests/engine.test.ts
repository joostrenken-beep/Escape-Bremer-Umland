import { beforeAll, describe, expect, it } from 'vitest';
import { buildContent } from '../scripts/build-content';
import type { BuiltTour } from '../src/content/types';
import { elapsedMs, isPaused, reconcile, reduce, scoreOf, type GameAction } from '../src/game/engine';
import { stationScore, stepPenalty } from '../src/game/scoring';
import { migrateSession, newSession, type GameSession } from '../src/game/session';

let tour: BuiltTour;
beforeAll(async () => {
  const { tours, errors } = await buildContent({ dryRun: true });
  expect(errors).toEqual([]);
  tour = tours.find((t) => t.id === 'worpswede')!;
});

const T0 = 1_000_000;
function play(actions: GameAction[], start = newSession('worpswede', '0.1.0', 'medium', T0)): GameSession {
  return actions.reduce((s, a, i) => reduce(s, tour, a, T0 + (i + 1) * 1000), start);
}

describe('Punkte', () => {
  it('Abzüge je Schritt', () => {
    expect(stepPenalty({ hintsUsed: 0, revealed: false, skipped: false })).toBe(0);
    expect(stepPenalty({ hintsUsed: 2, revealed: false, skipped: false })).toBe(30);
    expect(stepPenalty({ hintsUsed: 3, revealed: true, skipped: false })).toBe(120);
    expect(stepPenalty({ hintsUsed: 0, revealed: false, skipped: true })).toBe(50);
  });
  it('Station fällt nie unter 0', () => {
    expect(stationScore([{ hintsUsed: 3, revealed: true, skipped: false }])).toBe(0);
    expect(stationScore([{ hintsUsed: 1, revealed: false, skipped: false }])).toBe(90);
  });
});

describe('Spielablauf', () => {
  it('kompletter Durchlauf ohne Hilfe = volle Punktzahl', () => {
    const s = play([
      { type: 'begin' },
      { type: 'arrive' },
      { type: 'solve', answer: '0000' },
      { type: 'next' },
      { type: 'arrive' },
      { type: 'solve', answer: '0000' },
      { type: 'next' },
    ]);
    expect(s.phase).toBe('finished');
    expect(scoreOf(tour, s)).toBe(200);
    expect(s.finishedAt).toBeDefined();
    expect(isPaused(s)).toBe(true); // Uhr steht nach dem Ende
  });

  it('Hinweise, Auflösung und Überspringen kosten Punkte', () => {
    const s = play([
      { type: 'begin' },
      { type: 'arrive' },
      { type: 'hint' },
      { type: 'hint' },
      { type: 'hint' },
      { type: 'hint' }, // mehr als 3 → keine Wirkung
      { type: 'reveal' },
      { type: 'acceptReveal' },
      { type: 'next' },
      { type: 'arrive' },
      { type: 'skip' },
    ]);
    expect(s.steps['01-kaffee-worpswede/unlock']).toMatchObject({ hintsUsed: 3, revealed: true, solved: true });
    expect(s.phase).toBe('debrief');
    expect(scoreOf(tour, s)).toBe(0 + 50);
  });

  it('Ersatzfrage („Hier stimmt etwas nicht“) kostet nichts', () => {
    const s = play([{ type: 'begin' }, { type: 'arrive' }, { type: 'useFallback' }, { type: 'solve', answer: 'test' }]);
    expect(s.steps['01-kaffee-worpswede/unlock'].fallback).toBe(true);
    expect(scoreOf(tour, s)).toBe(200);
  });

  it('startet mit vollem Punktekonto, Hinweise ziehen sofort ab', () => {
    let s = play([{ type: 'begin' }, { type: 'arrive' }]);
    expect(scoreOf(tour, s)).toBe(200);
    s = reduce(s, tour, { type: 'hint' }, T0 + 10_000);
    expect(scoreOf(tour, s)).toBe(190);
  });

  it('Notizbuch sammelt Station-Einträge und Codes', () => {
    const s = play([{ type: 'begin' }, { type: 'arrive' }, { type: 'wrong' }, { type: 'solve', answer: ' 0000 ' }]);
    expect(s.notebook).toEqual([
      expect.objectContaining({ type: 'code', stationId: '01-kaffee-worpswede', value: '0000' }),
      expect.objectContaining({ type: 'entry', entryId: 'suspect-greta' }),
    ]);
    expect(s.steps['01-kaffee-worpswede/unlock'].attempts).toBe(2);
  });

  it('Aktionen in der falschen Phase ändern nichts', () => {
    const s = play([{ type: 'begin' }]);
    expect(reduce(s, tour, { type: 'solve', answer: 'x' }, T0)).toBe(s);
    expect(reduce(s, tour, { type: 'next' }, T0)).toBe(s);
  });

  it('Testmodus: lösen und springen wird vermerkt', () => {
    const s = play([{ type: 'testJump', stationIndex: 1 }, { type: 'arrive' }, { type: 'testSolve' }]);
    expect(s.stationIndex).toBe(1);
    expect(s.phase).toBe('debrief');
    expect(s.usedTestMode).toBe(true);
  });
});

describe('Zeit & Pause', () => {
  it('Pause hält die Uhr an, Weiter startet sie wieder', () => {
    let s = newSession('worpswede', '0.1.0', 'easy', 0);
    s = reduce(s, tour, { type: 'pause' }, 10_000);
    expect(elapsedMs(s, 500_000)).toBe(10_000);
    s = reduce(s, tour, { type: 'resume' }, 500_000);
    expect(elapsedMs(s, 505_000)).toBe(15_000);
  });

  it('eine Spielaktion beendet die Pause automatisch', () => {
    let s = reduce(newSession('worpswede', '0.1.0', 'easy', 0), tour, { type: 'pause' }, 1000);
    s = reduce(s, tour, { type: 'begin' }, 9000);
    expect(isPaused(s)).toBe(false);
  });
});

describe('Spielstand speichern & laden', () => {
  it('übersteht JSON-Rundreise (wie im localStorage)', () => {
    const s = play([{ type: 'begin' }, { type: 'arrive' }, { type: 'hint' }]);
    expect(migrateSession(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it('migriert Spielstände aus Meilenstein 1', () => {
    const old = { schemaVersion: 1, tourId: 'worpswede', tourVersion: '0.1.0', difficulty: 'hard', startedAt: '2026-10-19T10:00:00.000Z' };
    const s = migrateSession(old)!;
    expect(s).toMatchObject({ schemaVersion: 2, phase: 'intro', difficulty: 'hard', startedAt: old.startedAt });
  });

  it('verwirft Unbrauchbares', () => {
    expect(migrateSession(null)).toBeNull();
    expect(migrateSession({ schemaVersion: 99 })).toBeNull();
  });

  it('passt sich an eine verkürzte Tour an', () => {
    const s = { ...play([{ type: 'begin' }]), stationIndex: 7, stepIndex: 3 };
    const fixed = reconcile(s, tour);
    expect(fixed.stationIndex).toBe(tour.stations.length - 1);
    expect(fixed.stepIndex).toBe(0);
  });
});
