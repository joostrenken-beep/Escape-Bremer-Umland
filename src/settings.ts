/**
 * Geräte-Einstellungen (unabhängig vom Spielstand).
 * testMode: zeigt unveröffentlichte Touren und „Test“-Knöpfe zum Überspringen
 * von Codes und Springen zwischen Stationen – zum Durchspielen am Schreibtisch.
 */
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { storage } from './adapters';

export interface Settings {
  testMode: boolean;
}

export const defaultSettings: Settings = { testMode: false };

export async function loadSettings(): Promise<Settings> {
  return { ...defaultSettings, ...((await storage.get<Partial<Settings>>('settings')) ?? {}) };
}

export const saveSettings = (s: Settings) => storage.set('settings', s);

export const SettingsContext = createContext<{ settings: Settings; update: (s: Partial<Settings>) => void }>({
  settings: defaultSettings,
  update: () => {},
});

export const useSettings = () => useContext(SettingsContext);
