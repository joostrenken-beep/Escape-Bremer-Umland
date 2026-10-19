/**
 * Typen für Tour-Inhalte.
 *
 * Zwei Ebenen:
 *  - "Source"-Typen beschreiben, was Autor:innen in content/<stadt>/ schreiben
 *    (geprüft gegen schema/*.schema.json).
 *  - "Built"-Typen beschreiben das Paket, das scripts/build-content.ts nach
 *    public/tours/<stadt>/ schreibt und das die App lädt (Codes nur gehasht).
 *
 * Wenn du hier etwas änderst, passe auch das JSON-Schema in schema/ an.
 */

export type Lang = 'de' | 'en';
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Text in mehreren Sprachen. Deutsch ist Pflicht, alles andere fällt auf Deutsch zurück. */
export type LocalizedText = { de: string } & Partial<Record<Exclude<Lang, 'de'>, string>>;

/**
 * Text je Schwierigkeitsstufe. `all` gilt für alle Stufen, die keinen eigenen Text haben.
 * Beispiel: { "all": {"de": "…"}, "easy": {"de": "kindgerechte Variante"} }
 */
export type LeveledText = Partial<Record<Difficulty | 'all', LocalizedText>>;

/** Koordinate. `verified: false`, solange die Lage nicht vor Ort bestätigt ist. */
export interface GeoPoint {
  lat: number;
  lng: number;
  verified: boolean;
  note?: string;
}

/** Stufen-abhängige Zahl, z. B. Parameter eines Mini-Games. */
export type Leveled<T> = Partial<Record<Difficulty | 'all', T>>;

// ---------------------------------------------------------------------------
// Rätsel-Schritte ("Steps"). Jede Station besteht aus einem oder mehreren
// Schritten. Jeder Schritt hat einen `type`, über den die App die passende
// Rätsel-Komponente (Plugin) auswählt. Neue Typen kommen in Meilenstein 4 dazu.
// ---------------------------------------------------------------------------

/** Eingabe eines Codes, der vor Ort gefunden wird (Inschrift, Jahreszahl, Anzahl …). */
export interface CodeStepSource {
  type: 'code';
  id: string;
  prompt: LeveledText;
  /** Verweis auf einen Eintrag in codes.json (Klartext, nicht im Repo). */
  codeId: string;
  input?: 'text' | 'number';
  /** Genau 3 gestufte Hinweise. */
  hints: [LeveledText, LeveledText, LeveledText];
  /** Ersatzfrage für den Button „Hier stimmt etwas nicht“. */
  fallback?: {
    prompt: LeveledText;
    codeId: string;
    input?: 'text' | 'number';
  };
  /** Ortsbezogene Angabe – false, bis vor Ort bestätigt. */
  verified: boolean;
  /** Was genau vor Ort zu prüfen ist (nur Entwickler-Ansicht). */
  verifyNote?: string;
}

export type StepSource = CodeStepSource;

export interface NotebookEntrySource {
  id: string;
  kind: 'clue' | 'suspect' | 'code' | 'note';
  title: LocalizedText;
  text: LeveledText;
  image?: string;
}

export interface DidYouKnow {
  text: LocalizedText;
  sources?: string[];
  verified: boolean;
  verifyNote?: string;
}

export interface StationSource {
  id: string;
  title: LocalizedText;
  location: GeoPoint & { name: LocalizedText };
  /** Wegbeschreibung von der vorherigen Station (bzw. vom Startpunkt) hierher. */
  directions: LeveledText;
  /** Erzähltext, max. ca. 80 Wörter. */
  story: LeveledText;
  /** Optionale Audio-Datei (relativ zu media/). Ohne Datei: Sprachausgabe des Geräts. */
  audio?: string;
  steps: StepSource[];
  /** Wird nach Abschluss der Station ins Ermittler-Notizbuch übernommen. */
  notebook?: NotebookEntrySource[];
  didYouKnow?: DidYouKnow;
}

export interface TourSource {
  id: string;
  version: string;
  /** false = Tour erscheint nur im Testmodus. */
  published: boolean;
  town: LocalizedText;
  title: LocalizedText;
  teaser: LocalizedText;
  durationMinutes: [number, number];
  distanceKm: number;
  cover?: string;
  /** Öffentliches Salz für die Code-Hashes dieser Tour. */
  codeSalt: string;
  start: GeoPoint & { name: LocalizedText; description: LeveledText };
  difficulties: Record<Difficulty, { label: LocalizedText; description: LocalizedText }>;
  story: {
    intro: LeveledText;
    outro: LeveledText;
  };
  /** Reihenfolge = Route. Dateinamen (ohne .json) in stations/. */
  stations: string[];
  /** Optionaler Freischaltcode vor Tourbeginn (Geschäftsmodell, Standard: aus). */
  access?: { requireUnlockCode: boolean };
}

/** Klartext-Codes (content/<stadt>/codes.json, nie committen). */
export interface CodesFile {
  codes: Record<
    string,
    {
      /** Gültige Antworten. Entweder für alle Stufen oder je Stufe. */
      answers: string[] | Leveled<string[]>;
      /** Text, der bei „Auflösung anzeigen“ erscheint. */
      reveal: LocalizedText;
    }
  >;
}

// ---------------------------------------------------------------------------
// Gebautes Paket (was die App lädt)
// ---------------------------------------------------------------------------

export interface BuiltCode {
  /** SHA-256-Hashes der normalisierten Antworten, je Stufe bzw. "all". */
  hashes: Leveled<string[]>;
  /** Verschleierter Auflösungstext (siehe src/game/codes.ts). */
  reveal: { iv: string; data: string };
}

export interface BuiltTour extends Omit<TourSource, 'stations'> {
  stations: StationSource[];
  codes: Record<string, BuiltCode>;
  /** Woher die Codes beim Build kamen: GitHub-Secret, lokale codes.json oder Platzhalter. */
  codesSource: 'secret' | 'local' | 'example';
  /** Alle Dateien des Pakets (für den Offline-Download), relativ zu tours/<id>/. */
  files: string[];
  builtAt: string;
}

/** Eintrag in tours/index.json – Übersicht für die Stadtauswahl. */
export interface TourSummary {
  id: string;
  version: string;
  published: boolean;
  town: LocalizedText;
  title: LocalizedText;
  teaser: LocalizedText;
  durationMinutes: [number, number];
  distanceKm: number;
  stationCount: number;
  cover?: string;
}
