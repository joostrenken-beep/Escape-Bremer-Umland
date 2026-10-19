/**
 * Zentrale Stelle, an der entschieden wird, welche Adapter die App benutzt.
 * Für ein späteres Backend nur hier umstellen (z. B. new ApiContentAdapter(url)).
 */
import { LocalStorageAdapter, MemoryStore } from './LocalStorageAdapter';
import { StaticContentAdapter } from './StaticContentAdapter';
import type { ContentAdapter, StorageAdapter } from './types';

function pickStore() {
  try {
    const probe = '__probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return new MemoryStore(); // z. B. sehr strenger privater Modus
  }
}

export const content: ContentAdapter = new StaticContentAdapter();
export const storage: StorageAdapter = new LocalStorageAdapter(pickStore());

export type { ContentAdapter, StorageAdapter } from './types';
