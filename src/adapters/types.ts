/**
 * Schnittstellen für alle Datenzugriffe.
 *
 * Die App spricht nur mit diesen Interfaces – nie direkt mit localStorage
 * oder fetch. Heute stecken dahinter LocalStorageAdapter und
 * StaticContentAdapter (statische JSON-Dateien). Später kann ein ApiAdapter
 * (Server mit Highscores, Admin-Bereich, Freischaltcodes) dieselben
 * Interfaces erfüllen, ohne dass sich die App ändert.
 */

import type { BuiltTour, TourSummary } from '../content/types';

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
