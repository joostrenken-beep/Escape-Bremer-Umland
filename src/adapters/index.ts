/**
 * Zentrale Stelle, an der entschieden wird, welche Adapter die App benutzt.
 * Ohne VITE_API_URL: alles lokal/statisch. Mit VITE_API_URL: Server (docs/API.md).
 */
import { ApiAccessAdapter, ApiContentAdapter, ApiScoreAdapter } from './api';
import { LocalAccessAdapter } from './LocalAccessAdapter';
import { LocalScoreAdapter } from './LocalScoreAdapter';
import { LocalStorageAdapter, MemoryStore } from './LocalStorageAdapter';
import { StaticContentAdapter } from './StaticContentAdapter';
import type { AccessAdapter, ContentAdapter, ScoreAdapter, StorageAdapter } from './types';

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

const apiUrl = (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

export const storage: StorageAdapter = new LocalStorageAdapter(pickStore());
const localScores = new LocalScoreAdapter(storage);

export const content: ContentAdapter = apiUrl ? new ApiContentAdapter(apiUrl) : new StaticContentAdapter();
export const scores: ScoreAdapter = apiUrl ? new ApiScoreAdapter(apiUrl, localScores) : localScores;
export const access: AccessAdapter = apiUrl ? new ApiAccessAdapter(apiUrl, storage) : new LocalAccessAdapter(storage);

export type { AccessAdapter, ContentAdapter, GameResult, ScoreAdapter, StorageAdapter } from './types';
