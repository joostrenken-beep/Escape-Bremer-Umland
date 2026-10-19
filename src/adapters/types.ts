/**
 * Schnittstellen für alle Datenzugriffe.
 *
 * Die App spricht nur mit diesen Interfaces – nie direkt mit localStorage
 * oder fetch. Heute stecken dahinter lokale Umsetzungen (statische Dateien,
 * localStorage). Ist VITE_API_URL gesetzt, nimmt adapters/index.ts die
 * Api-Varianten (siehe docs/API.md) – die App selbst ändert sich dabei nicht.
 */

import type { BuiltTour, Difficulty, TourSummary } from '../content/types';

export interface ContentAdapter {
  listTours(): Promise<TourSummary[]>;
  loadTour(id: string): Promise<BuiltTour>;
  /** Lädt alle Dateien eines Stadtpakets in den Offline-Speicher. */
  downloadTour(id: string, onProgress?: (done: number, total: number) => void): Promise<void>;
  /** Ist das Stadtpaket vollständig offline verfügbar? */
  isTourOffline(id: string): Promise<boolean>;
}

/** Schlüssel-Wert-Speicher für Spielstand und Einstellungen. */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

/** Ergebnis einer abgeschlossenen Ermittlung. */
export interface GameResult {
  tourId: string;
  tourVersion: string;
  difficulty: Difficulty;
  team?: string;
  score: number;
  maxScore: number;
  timeMs: number;
  finishedAt: string;
  usedTestMode: boolean;
}

/** Bestenliste – heute nur auf dem Gerät, später auf einem Server. */
export interface ScoreAdapter {
  submit(result: GameResult): Promise<void>;
  list(tourId: string): Promise<GameResult[]>;
}

/** Freischaltcodes vor Tourbeginn (optionales Geschäftsmodell). */
export interface AccessAdapter {
  isUnlocked(tour: BuiltTour): Promise<boolean>;
  /** Prüft einen Code; bei Erfolg bleibt die Tour auf diesem Gerät freigeschaltet. */
  unlock(tour: BuiltTour, code: string): Promise<boolean>;
}
