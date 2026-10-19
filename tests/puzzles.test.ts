import { describe, expect, it } from 'vitest';
import { finaleBonus } from '../src/game/scoring';
import { morseSchedule, toMorse } from '../src/puzzles/morse';
import { seededRandom } from '../src/puzzles/random';
import { isSolved, move, shuffle, solved } from '../src/puzzles/slider';

describe('Morse', () => {
  it('übersetzt Text', () => {
    expect(toMorse('NULL')).toBe('-. ..- .-.. .-..');
    expect(toMorse('SOS 1')).toBe('... --- ... / .----');
  });
  it('Zeitplan: Punkt 1, Strich 3, Abstände 1/3/7', () => {
    expect(morseSchedule('E')).toEqual([{ on: 1, off: 0 }]);
    expect(morseSchedule('NE')).toEqual([
      { on: 3, off: 1 },
      { on: 1, off: 3 },
      { on: 1, off: 0 },
    ]);
    expect(morseSchedule('E E')).toEqual([
      { on: 1, off: 7 },
      { on: 1, off: 0 },
    ]);
  });
});

describe('Schiebepuzzle', () => {
  it('nur Nachbarn des leeren Feldes lassen sich schieben', () => {
    const t = solved(3); // leeres Feld = Position 8 (unten rechts)
    expect(move(t, 0, 3)).toBe(t);
    expect(move(t, 7, 3)).toEqual([0, 1, 2, 3, 4, 5, 6, 8, 7]);
    expect(move(t, 5, 3)).toEqual([0, 1, 2, 3, 4, 8, 6, 7, 5]);
  });

  it('Mischen ist reproduzierbar, nie schon gelöst und immer lösbar', () => {
    for (const n of [3, 4]) {
      const a = shuffle(n, 'seed-x');
      expect(shuffle(n, 'seed-x')).toEqual(a);
      expect(isSolved(a)).toBe(false);
      expect([...a].sort((x, y) => x - y)).toEqual(solved(n));
      expect(isSolvable(a, n)).toBe(true);
    }
  });
});

/** Klassische Lösbarkeitsregel für Schiebepuzzles (Inversionen + Zeile des leeren Feldes). */
function isSolvable(tiles: number[], n: number): boolean {
  const blank = n * n - 1;
  const seq = tiles.filter((t) => t !== blank);
  let inv = 0;
  for (let i = 0; i < seq.length; i++) for (let j = i + 1; j < seq.length; j++) if (seq[i] > seq[j]) inv++;
  if (n % 2 === 1) return inv % 2 === 0;
  const rowFromBottom = n - Math.floor(tiles.indexOf(blank) / n);
  return (inv + rowFromBottom) % 2 === 1;
}

describe('Zufall', () => {
  it('gleicher Startwert → gleiche Folge', () => {
    const a = seededRandom('abc');
    const b = seededRandom('abc');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('Finale-Bonus', () => {
  const base = { hintsUsed: 0, revealed: false, skipped: false, solved: true, attempts: 1 };
  it('100 beim ersten Versuch ohne Hilfe, 50 sonst, 0 bei Auflösung', () => {
    expect(finaleBonus(base)).toBe(100);
    expect(finaleBonus({ ...base, attempts: 2 })).toBe(50);
    expect(finaleBonus({ ...base, hintsUsed: 1 })).toBe(50);
    expect(finaleBonus({ ...base, revealed: true })).toBe(0);
    expect(finaleBonus({ ...base, solved: false })).toBe(0);
  });
});
