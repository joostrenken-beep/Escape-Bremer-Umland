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
  playPlaceholder: 'Der Stationsablauf kommt in Meilenstein 2.',
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

export function ui(key: UiKey): string {
  return dictionaries[currentLang][key] ?? de[key];
}
