import type { StorageAdapter } from './types';

/** Minimaler Teil der Web-Storage-API – so lässt sich der Adapter auch in Tests nutzen. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Speichert alles lokal im Browser (bleibt nach Neuladen/Absturz erhalten). */
export class LocalStorageAdapter implements StorageAdapter {
  constructor(
    private readonly store: KeyValueStore = globalThis.localStorage,
    private readonly prefix = 'ermittlerakte:',
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = this.store.getItem(this.prefix + key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null; // kaputter Eintrag → behandeln wie "nicht vorhanden"
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.setItem(this.prefix + key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    this.store.removeItem(this.prefix + key);
  }
}

/** Speicher nur im Arbeitsspeicher – für Tests und als Notlösung (z. B. privater Modus). */
export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}
