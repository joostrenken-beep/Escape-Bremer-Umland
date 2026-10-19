/**
 * Spielstand einer laufenden Ermittlung.
 *
 * Wird nach jeder Aktion gespeichert (StorageAdapter), damit das Spiel nach
 * Absturz, Neuladen oder leerem Akku genau dort weitergeht.
 * Texte werden NICHT gespeichert, nur Verweise (IDs) – die Texte kommen immer
 * frisch aus dem Tour-Paket (wichtig für Sprachen und Content-Updates).
 */
import { storage } from '../adapters';
import type { Difficulty } from '../content/types';

export type Phase =
  | 'intro' // Fallakte lesen, Treffpunkt
  | 'travel' // Weg zur nächsten Station
  | 'solve' // an der Station: Story + Rätsel
  | 'debrief' // Station gelöst: Notizbuch-Einträge, „Wusstest du?“
  | 'finished'; // alle Stationen geschafft

export interface StepProgress {
  hintsUsed: number;
  revealed: boolean;
  /** „Hier stimmt etwas nicht“ → Ersatzfrage aktiv */
  fallback: boolean;
  skipped: boolean;
  solved: boolean;
  attempts: number;
  /** Eingegebene (richtige) Antwort – erscheint im Notizbuch */
  answer?: string;
}

export type NotebookItem =
  | { type: 'entry'; stationId: string; entryId: string; at: string }
  | { type: 'code'; stationId: string; stepId: string; value: string; at: string };

export interface GameTimer {
  /** Bereits abgelaufene Spielzeit vor dem aktuellen Lauf (ms) */
  elapsedMs: number;
  /** Zeitstempel (ms), seit dem die Uhr läuft – null = pausiert */
  runningSince: number | null;
}

export interface GameSession {
  schemaVersion: 2;
  tourId: string;
  tourVersion: string;
  difficulty: Difficulty;
  startedAt: string;
  finishedAt?: string;
  phase: Phase;
  stationIndex: number;
  stepIndex: number;
  /** Schlüssel: "<stationId>/<stepId>" */
  steps: Record<string, StepProgress>;
  notebook: NotebookItem[];
  timer: GameTimer;
  /** Wurde der Testmodus benutzt? (Wertung dann nicht ernst gemeint) */
  usedTestMode: boolean;
}

const KEY = 'session';

/** Ältere Spielstände auf das aktuelle Format bringen. */
export function migrateSession(raw: unknown): GameSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<GameSession> & { schemaVersion?: number };
  if (s.schemaVersion === 2) return s as GameSession;
  if (s.schemaVersion === 1 && s.tourId && s.difficulty) {
    return newSession(s.tourId, s.tourVersion ?? '0.0.0', s.difficulty, Date.now(), s.startedAt);
  }
  return null;
}

export function newSession(
  tourId: string,
  tourVersion: string,
  difficulty: Difficulty,
  now: number,
  startedAt = new Date(now).toISOString(),
): GameSession {
  return {
    schemaVersion: 2,
    tourId,
    tourVersion,
    difficulty,
    startedAt,
    phase: 'intro',
    stationIndex: 0,
    stepIndex: 0,
    steps: {},
    notebook: [],
    timer: { elapsedMs: 0, runningSince: now },
    usedTestMode: false,
  };
}

export const loadSession = async () => migrateSession(await storage.get<unknown>(KEY));
export const saveSession = (s: GameSession) => storage.set(KEY, s);
export const clearSession = () => storage.remove(KEY);
