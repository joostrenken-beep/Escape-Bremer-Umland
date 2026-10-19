/** Morse-Alphabet und Zeitplan (reine Funktionen, getestet). */

export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};

export function toMorse(text: string): string {
  return text
    .toUpperCase()
    .split(' ')
    .map((w) => [...w].map((c) => MORSE[c] ?? '').filter(Boolean).join(' '))
    .join(' / ');
}

/**
 * Zeitplan der Signale in „Einheiten“: Punkt = 1, Strich = 3, Pause im
 * Zeichen = 1, zwischen Buchstaben = 3, zwischen Wörtern = 7.
 */
export function morseSchedule(text: string): { on: number; off: number }[] {
  const out: { on: number; off: number }[] = [];
  const words = text.toUpperCase().split(' ').filter(Boolean);
  words.forEach((word, wi) => {
    [...word].forEach((ch, ci) => {
      const code = MORSE[ch] ?? '';
      [...code].forEach((sym, si) => {
        const lastInLetter = si === code.length - 1;
        const lastLetter = ci === word.length - 1;
        const lastWord = wi === words.length - 1;
        const off = !lastInLetter ? 1 : !lastLetter ? 3 : !lastWord ? 7 : 0;
        out.push({ on: sym === '.' ? 1 : 3, off });
      });
    });
  });
  return out;
}
