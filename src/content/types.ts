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

/** Gemeinsame Felder aller Rätsel-Schritte. */
interface StepBase {
  id: string;
  prompt: LeveledText;
  /** Genau 3 gestufte Hinweise. */
  hints: [LeveledText, LeveledText, LeveledText];
  /** Ortsbezogene Angabe – false, bis vor Ort bestätigt. */
  verified: boolean;
  /** Was genau vor Ort zu prüfen ist (nur Entwickler-Ansicht). */
  verifyNote?: string;
}

/** Rätsel, deren Lösung als Code eingegeben wird (gehasht, siehe codes.json). */
export interface CodeAnswer {
  /** Verweis auf einen Eintrag in codes.json (Klartext, nicht im Repo). */
  codeId: string;
  input?: 'text' | 'number';
  /** Ersatzfrage für den Button „Hier stimmt etwas nicht“. */
  fallback?: {
    prompt: LeveledText;
    codeId: string;
    input?: 'text' | 'number';
  };
}

/** Code vor Ort finden (Inschrift, Jahreszahl, Anzahl …) – optional mit Bild (z. B. Bildausschnitt). */
export interface CodeStepSource extends StepBase, CodeAnswer {
  type: 'code';
  image?: string;
}

/** Zeugenaussage zum Anhören (Audiodatei oder Sprachausgabe), danach Frage. */
export interface AudioStepSource extends StepBase, CodeAnswer {
  type: 'audio';
  /** Text der Aussage – wird vorgelesen und ist auch als Abschrift lesbar. */
  speech: LeveledText;
  audio?: string;
  speaker?: LocalizedText;
}

/** Morse-Töne + Blinklicht, danach Eingabe der entschlüsselten Nachricht. */
export interface MorseStepSource extends StepBase, CodeAnswer {
  type: 'morse';
  message: Leveled<string>;
  /** Morse-Tabelle direkt anzeigen? (sonst nur über Hinweis) */
  showTable: Leveled<boolean>;
}

/** Versteckte Nachricht, die erst durch einen Rotfilter lesbar wird. */
export interface ColorFilterStepSource extends StepBase, CodeAnswer {
  type: 'colorfilter';
  message: Leveled<string>;
}

/** Historisches Foto halbtransparent über dem Kamerabild (Schieberegler). */
export interface OverlayStepSource extends StepBase, CodeAnswer {
  type: 'overlay';
  image: string;
  credit: LocalizedText;
}

/** Zahlenschloss mit Drehrädern. */
export interface LockStepSource extends StepBase {
  type: 'lock';
  codeId: string;
  digits: number;
}

/** Schiebepuzzle eines Bildes. */
export interface SliderStepSource extends StepBase {
  type: 'slider';
  image: string;
  /** Raster je Stufe, z. B. 3 = 3×3 */
  size: Leveled<number>;
  solutionText: LeveledText;
}

/** Handy in eine Himmelsrichtung halten – optional mit AR-Einblendung über dem Kamerabild. */
export interface CompassStepSource extends StepBase {
  type: 'compass';
  /** Zielrichtung in Grad (0 = Nord) */
  bearing: number;
  /** erlaubte Abweichung in Grad je Stufe */
  tolerance: Leveled<number>;
  ar: boolean;
  /** Was eingeblendet wird, wenn die Richtung stimmt */
  revealText: LeveledText;
  solutionText: LeveledText;
}

/** Anklage am Ende: mehrere Fragen mit Antwortmöglichkeiten. Bringt den Finale-Bonus. */
export interface AccuseStepSource extends StepBase {
  type: 'accuse';
  questions: {
    id: string;
    prompt: LeveledText;
    codeId: string;
    options: { id: string; label: LeveledText }[];
  }[];
  solutionText: LeveledText;
}

export type StepSource =
  | CodeStepSource
  | AudioStepSource
  | MorseStepSource
  | ColorFilterStepSource
  | OverlayStepSource
  | LockStepSource
  | SliderStepSource
  | CompassStepSource
  | AccuseStepSource;

export type StepType = StepSource['type'];

/** Alle codeIds, die ein Schritt benutzt (für Build-Prüfung und Hashing). */
export function codeIdsOfStep(step: StepSource): string[] {
  const ids: string[] = [];
  if ('codeId' in step) ids.push(step.codeId);
  if ('fallback' in step && step.fallback) ids.push(step.fallback.codeId);
  if (step.type === 'accuse') ids.push(...step.questions.map((q) => q.codeId));
  return ids;
}

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
  /** Freischaltcodes für die Tour (nur relevant, wenn tour.access.requireUnlockCode). */
  access?: { codes: string[] };
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
  /** Orts-Codes, für die noch keine echte Antwort hinterlegt ist (nur Platzhalter). */
  placeholderCodes: string[];
  /** Gehashte Freischaltcodes (nur wenn access.requireUnlockCode). */
  accessHashes?: string[];
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
