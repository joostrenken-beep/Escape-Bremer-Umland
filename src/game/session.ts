/**
 * Laufende Ermittlung (Spielstand). In Meilenstein 1 nur Tour + Stufe;
 * Meilenstein 2 ergänzt Station, Hinweise, Punkte, Zeit und Notizbuch.
 */
import { storage } from '../adapters';
import type { Difficulty } from '../content/types';

export interface GameSession {
  schemaVersion: 1;
  tourId: string;
  tourVersion: string;
  difficulty: Difficulty;
  startedAt: string;
}

const KEY = 'session';

export const loadSession = () => storage.get<GameSession>(KEY);
export const saveSession = (s: GameSession) => storage.set(KEY, s);
export const clearSession = () => storage.remove(KEY);
