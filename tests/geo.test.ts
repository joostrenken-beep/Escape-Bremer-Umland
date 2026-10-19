import { describe, expect, it } from 'vitest';
import { bearingDeg, compassName, distanceM, formatDistance, routeLengthM } from '../src/geo/geo';

describe('Geo', () => {
  const bremen = { lat: 53.0793, lng: 8.8017 };
  const worpswede = { lat: 53.2203, lng: 8.9311 };

  it('Entfernung Bremen–Worpswede ≈ 18 km', () => {
    expect(distanceM(bremen, worpswede)).toBeGreaterThan(17_500);
    expect(distanceM(bremen, worpswede)).toBeLessThan(18_500);
  });

  it('Richtung: Norden, Osten, Süden', () => {
    expect(bearingDeg({ lat: 53, lng: 9 }, { lat: 53.01, lng: 9 })).toBeCloseTo(0, 0);
    expect(bearingDeg({ lat: 53, lng: 9 }, { lat: 53, lng: 9.01 })).toBeCloseTo(90, 0);
    expect(bearingDeg({ lat: 53, lng: 9 }, { lat: 52.99, lng: 9 })).toBeCloseTo(180, 0);
    expect(compassName(bearingDeg(bremen, worpswede))).toBe('Nordosten');
  });

  it('formatiert Entfernungen', () => {
    expect(formatDistance(123)).toBe('120 m');
    expect(formatDistance(1430)).toBe('1,4 km');
  });

  it('Routenlänge = Summe der Teilstrecken', () => {
    const a = { lat: 53, lng: 9 };
    const b = { lat: 53.01, lng: 9 };
    expect(routeLengthM([a, b, a])).toBeCloseTo(2 * distanceM(a, b), 3);
  });
});

describe('Kompass-Abweichung', () => {
  it('kleinster Winkel mit Vorzeichen', async () => {
    const { angleDiff } = await import('../src/puzzles/CompassPuzzle');
    expect(angleDiff(10, 350)).toBe(20);
    expect(angleDiff(350, 10)).toBe(-20);
    expect(angleDiff(225, 225)).toBe(0);
    expect(Math.abs(angleDiff(0, 180))).toBe(180);
  });
});
