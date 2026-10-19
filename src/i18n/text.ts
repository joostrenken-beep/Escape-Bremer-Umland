import type { Difficulty, Lang, LeveledText, LocalizedText } from '../content/types.ts';

/** Text in der gewünschten Sprache, sonst Deutsch. */
export function localize(text: LocalizedText | undefined, lang: Lang = 'de'): string {
  if (!text) return '';
  return text[lang] ?? text.de;
}

/** Text für Stufe + Sprache: eigene Stufe → "all" → leer. */
export function leveled(text: LeveledText | undefined, level: Difficulty, lang: Lang = 'de'): string {
  if (!text) return '';
  return localize(text[level] ?? text.all, lang);
}
