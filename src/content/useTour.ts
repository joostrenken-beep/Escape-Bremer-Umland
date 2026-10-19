import { content } from '../adapters';
import { useAsync } from '../hooks';
import type { BuiltTour } from './types';

/** Touren im Speicher behalten, damit Wechsel zwischen Spiel und Notizbuch nicht neu laden. */
const cache = new Map<string, Promise<BuiltTour>>();

export function getTour(id: string): Promise<BuiltTour> {
  let p = cache.get(id);
  if (!p) {
    p = content.loadTour(id);
    p.catch(() => cache.delete(id)); // Fehler nicht dauerhaft merken
    cache.set(id, p);
  }
  return p;
}

export const useTour = (id: string) => useAsync(() => getTour(id), [id]);
