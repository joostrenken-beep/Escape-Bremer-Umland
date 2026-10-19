import type { Difficulty, Lang, LeveledText, LocalizedText } from '../content/types';

/**
 * „[PLATZHALTER]“ markiert im Content Texte, die noch vor Ort geprüft werden
 * müssen. Spieler sehen den Vermerk nicht – im Testmodus schon.
 */
let showPlaceholders = false;
export const setShowPlaceholders = (show: boolean) => (showPlaceholders = show);
const PLACEHOLDER = /\[PLATZHALTER\]\s*/g;

/** Text in der gewünschten Sprache, sonst Deutsch. */
export function localize(text: LocalizedText | undefined, lang: Lang = 'de'): string {
  if (!text) return '';
  const s = text[lang] ?? text.de;
  return showPlaceholders ? s : s.replace(PLACEHOLDER, '');
}

/** Text für Stufe + Sprache: eigene Stufe → "all" → leer. */
export function leveled(text: LeveledText | undefined, level: Difficulty, lang: Lang = 'de'): string {
  if (!text) return '';
  return localize(text[level] ?? text.all, lang);
}
