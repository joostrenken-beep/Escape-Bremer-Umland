/**
 * Feste Texte der Oberfläche. Für Englisch später einfach `en` ergänzen –
 * fehlende Einträge fallen auf Deutsch zurück.
 */
import type { Lang } from '../content/types';

const de = {
  appName: 'Ermittlerakte',
  appTagline: 'Krimi-Touren zu Fuß im Bremer Umland',
  chooseTour: 'Wähle deinen Fall',
  loading: 'Akte wird geladen …',
  loadError: 'Die Touren konnten nicht geladen werden. Bist du online?',
  retry: 'Nochmal versuchen',
  minutes: 'Min.',
  km: 'km',
  stations: 'Stationen',
  openCase: 'Fall öffnen',
  back: 'Zurück',
  offlineReady: 'Offline verfügbar',
  saveOffline: 'Für offline speichern',
  savingOffline: 'Wird gespeichert …',
  saveOfflineHint: 'Lade die Tour vor dem Start im WLAN – unterwegs im Moor gibt es Funklöcher.',
  saveOfflineFailed: 'Speichern fehlgeschlagen. Bitte mit Internet erneut versuchen.',
  chooseDifficulty: 'Schwierigkeit wählen',
  startCase: 'Ermittlung starten',
  continueCase: 'Ermittlung fortsetzen',
  activeCase: 'Laufende Ermittlung',
  startingPoint: 'Treffpunkt',
  // Spielablauf
  caseFile: 'Fallakte',
  letsGo: 'Los geht’s',
  station: 'Station',
  puzzle: 'Rätsel',
  of: 'von',
  wayToStation: 'Weg zur Station',
  wayToStart: 'Weg zum Treffpunkt',
  weAreHere: 'Wir sind da',
  points: 'Punkte',
  time: 'Zeit',
  pause: 'Pause',
  paused: 'Pause',
  pausedText: 'Die Uhr ist angehalten. Genießt euren Kaffee – der Fall läuft nicht weg.',
  resume: 'Weiter ermitteln',
  notebook: 'Notizbuch',
  readAloud: 'Vorlesen',
  stopReading: 'Vorlesen stoppen',
  yourAnswer: 'Eure Antwort',
  check: 'Prüfen',
  checking: 'Wird geprüft …',
  wrongAnswer: 'Das passt leider nicht. Schaut noch einmal genau hin.',
  hints: 'Hinweise',
  hint: 'Hinweis',
  showHint: 'Hinweis {n} anzeigen (−{cost} Punkte)',
  showSolution: 'Auflösung anzeigen (−{cost} Punkte)',
  solution: 'Auflösung',
  continue: 'Weiter',
  somethingWrong: 'Hier stimmt etwas nicht',
  somethingWrongText: 'Ihr findet die Angabe nicht – vielleicht ist sie verdeckt, verwittert oder entfernt worden?',
  useFallback: 'Ersatzfrage beantworten (ohne Abzug)',
  skipStep: 'Überspringen (−{cost} Punkte)',
  cancel: 'Abbrechen',
  fallbackActive: 'Ersatzfrage',
  testSolve: '🧪 Test: Schritt lösen',
  testJump: '🧪 Test: Springe zu Station',
  testModeBadge: 'Testmodus',
  stationSolved: 'Station gelöst!',
  stationPoints: '{points} von {max} Punkten an dieser Station',
  newInNotebook: 'Neu im Notizbuch',
  didYouKnow: 'Wusstest du?',
  notVerifiedYet: 'Noch nicht vor Ort geprüft',
  nextStation: 'Weiter zur nächsten Station',
  toFinale: 'Zur Auflösung des Falls',
  caseClosed: 'Fall abgeschlossen',
  finalScore: 'Punkte',
  finalTime: 'Spielzeit',
  finaleComing: 'Das große Finale mit Urkunde kommt in Meilenstein 5.',
  newGame: 'Neue Ermittlung',
  // Notizbuch
  notebookEmpty: 'Noch keine Einträge. Löst die erste Station!',
  suspects: 'Verdächtige',
  clues: 'Hinweise & Spuren',
  codes: 'Gefundene Codes',
  notes: 'Notizen',
  knowledge: 'Ortswissen',
  knowledgeEmpty: 'Hier sammelt sich das Ortswissen jeder Station, die ihr erreicht habt.',
  // Einstellungen
  settings: 'Einstellungen',
  testMode: 'Testmodus',
  testModeHelp: 'Zum Ausprobieren am Schreibtisch: Codes überspringen, zwischen Stationen springen, unveröffentlichte Touren anzeigen.',
  resetAll: 'Alle Daten auf diesem Gerät löschen',
  resetConfirm: 'Spielstand, Einstellungen und Ortswissen wirklich löschen?',
  abandonCase: 'Ermittlung abbrechen',
  abandonConfirm: 'Wirklich abbrechen? Der Spielstand geht verloren.',
  updateAvailable: 'Eine neue Version ist da.',
  update: 'Aktualisieren',
  later: 'Später',
  appOfflineReady: 'Die App funktioniert jetzt auch ohne Internet.',
  ok: 'OK',
  installTitle: 'Tipp: Als App installieren',
  installIos: 'Tippe unten auf „Teilen“ und dann auf „Zum Home-Bildschirm“.',
  dismiss: 'Ausblenden',
  notFound: 'Diese Seite gibt es nicht.',
  toStart: 'Zur Startseite',
} as const;

export type UiKey = keyof typeof de;
const dictionaries: Record<Lang, Partial<Record<UiKey, string>>> = { de, en: {} };

let currentLang: Lang = 'de';
export const setLang = (lang: Lang) => (currentLang = lang);
export const getLang = () => currentLang;

/** UI-Text; Platzhalter wie {n} werden aus `vars` ersetzt. */
export function ui(key: UiKey, vars?: Record<string, string | number>): string {
  const text: string = dictionaries[currentLang][key] ?? de[key];
  return vars ? text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')) : text;
}
