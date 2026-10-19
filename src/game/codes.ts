/**
 * Prüfen von Lösungscodes.
 *
 * Wird sowohl im Browser (App) als auch in Node (Build-Skript) benutzt –
 * beide haben die Web-Crypto-API (`crypto.subtle`).
 *
 * Ehrlicher Hinweis: Hashes im Browser verhindern nur, dass jemand die
 * Lösung einfach im Quelltext nachliest. Wer sich Mühe gibt, kann kurze
 * Codes (z. B. Jahreszahlen) durchprobieren. Für ein Freizeitspiel reicht das.
 */

import type { BuiltCode, Difficulty, Leveled, LocalizedText } from '../content/types.ts';

/**
 * Macht Eingaben vergleichbar:
 *  "  Paula Modersohn-Becker " → "paulamodersohnbecker"
 *  "Straße" → "strasse", "Mühle" / "Muehle" → "muehle", "Café" → "cafe"
 */
export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // übrige Akzente (é → e)
    .replace(/[^a-z0-9]/g, ''); // Leerzeichen, Bindestriche, Satzzeichen
}

const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

export async function hashAnswer(salt: string, codeId: string, answer: string): Promise<string> {
  const data = encoder.encode(`${salt}:${codeId}:${normalizeAnswer(answer)}`);
  return toHex(await crypto.subtle.digest('SHA-256', data));
}

/** Liefert die für eine Stufe gültigen Werte (eigene Stufe, sonst "all"). */
export function forLevel<T>(value: Leveled<T>, level: Difficulty): T | undefined {
  return value[level] ?? value.all;
}

/** Freischaltcodes (Geschäftsmodell): gleiche Normalisierung, eigene „codeId“. */
export const ACCESS_CODE_ID = '__access__';

export async function checkAccessCode(salt: string, hashes: string[], input: string): Promise<boolean> {
  if (normalizeAnswer(input) === '') return false;
  return hashes.includes(await hashAnswer(salt, ACCESS_CODE_ID, input));
}

export async function checkAnswer(
  salt: string,
  codeId: string,
  code: BuiltCode,
  level: Difficulty,
  input: string,
): Promise<boolean> {
  if (normalizeAnswer(input) === '') return false;
  const valid = forLevel(code.hashes, level) ?? [];
  const hash = await hashAnswer(salt, codeId, input);
  return valid.includes(hash);
}

// --- Auflösungstexte verschleiern ----------------------------------------
// Die Auflösung verrät die Antwort, darf also auch nicht im Klartext im Paket
// stehen. Sie wird mit AES-GCM verschlüsselt; der Schlüssel ergibt sich aus
// Salz + codeId. Das ist Verschleierung, keine echte Sicherheit.

async function revealKey(salt: string, codeId: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', encoder.encode(`reveal:${salt}:${codeId}`));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function obscureReveal(
  salt: string,
  codeId: string,
  text: LocalizedText,
): Promise<BuiltCode['reveal']> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await revealKey(salt, codeId);
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(text)),
  );
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(data)) };
}

export async function revealSolution(
  salt: string,
  codeId: string,
  reveal: BuiltCode['reveal'],
): Promise<LocalizedText> {
  const key = await revealKey(salt, codeId);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(reveal.iv) },
    key,
    fromBase64(reveal.data),
  );
  return JSON.parse(new TextDecoder().decode(plain)) as LocalizedText;
}
