import { describe, expect, it } from 'vitest';
import { checkAnswer, hashAnswer, normalizeAnswer, obscureReveal, revealSolution } from '../src/game/codes';
import type { BuiltCode } from '../src/content/types';

describe('normalizeAnswer', () => {
  it.each([
    ['  Paula Modersohn-Becker ', 'paulamodersohnbecker'],
    ['STRASSE', 'strasse'],
    ['Straße', 'strasse'],
    ['Mühle', 'muehle'],
    ['Muehle', 'muehle'],
    ['Café', 'cafe'],
    ['19 05', '1905'],
    ['„Weyerberg“!', 'weyerberg'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });
});

describe('checkAnswer', () => {
  const salt = 'test-salt-123';
  const build = async (answers: Record<string, string[]>): Promise<BuiltCode> => {
    const hashes: Record<string, string[]> = {};
    for (const [level, list] of Object.entries(answers)) {
      hashes[level] = await Promise.all(list.map((a) => hashAnswer(salt, 'c1', a)));
    }
    return { hashes, reveal: await obscureReveal(salt, 'c1', { de: 'x' }) };
  };

  it('akzeptiert tolerante Schreibweisen und mehrere Antworten', async () => {
    const code = await build({ all: ['Barkenhoff', 'Barkenhof'] });
    expect(await checkAnswer(salt, 'c1', code, 'medium', ' barkenHOFF ')).toBe(true);
    expect(await checkAnswer(salt, 'c1', code, 'medium', 'Barken-hof')).toBe(true);
    expect(await checkAnswer(salt, 'c1', code, 'medium', 'Barkenhaus')).toBe(false);
  });

  it('lehnt leere Eingaben ab', async () => {
    const code = await build({ all: ['x'] });
    expect(await checkAnswer(salt, 'c1', code, 'easy', '  - ')).toBe(false);
  });

  it('nutzt stufenspezifische Antworten, sonst "all"', async () => {
    const code = await build({ all: ['1905'], easy: ['5'] });
    expect(await checkAnswer(salt, 'c1', code, 'easy', '5')).toBe(true);
    expect(await checkAnswer(salt, 'c1', code, 'easy', '1905')).toBe(false);
    expect(await checkAnswer(salt, 'c1', code, 'hard', '1905')).toBe(true);
  });

  it('Hash hängt von Salz und codeId ab', async () => {
    const a = await hashAnswer(salt, 'c1', 'x');
    expect(await hashAnswer(salt, 'c2', 'x')).not.toBe(a);
    expect(await hashAnswer('other-salt', 'c1', 'x')).not.toBe(a);
  });
});

describe('Auflösungstexte', () => {
  it('lassen sich verschleiern und wieder lesen', async () => {
    const hidden = await obscureReveal('s', 'c1', { de: 'Die Antwort ist 1905.' });
    expect(JSON.stringify(hidden)).not.toContain('1905');
    expect(await revealSolution('s', 'c1', hidden)).toEqual({ de: 'Die Antwort ist 1905.' });
  });
});

describe('Platzhalter-Vermerke', () => {
  it('sind für Spieler unsichtbar, im Testmodus sichtbar', async () => {
    const { localize, setShowPlaceholders } = await import('../src/i18n/text');
    const t = { de: '[PLATZHALTER] Geht die Lindenallee entlang.' };
    setShowPlaceholders(false);
    expect(localize(t)).toBe('Geht die Lindenallee entlang.');
    setShowPlaceholders(true);
    expect(localize(t)).toBe('[PLATZHALTER] Geht die Lindenallee entlang.');
    setShowPlaceholders(false);
  });
});
