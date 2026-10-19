import type { BuiltTour, TourSummary } from '../content/types';
import type { ContentAdapter } from './types';

/** Muss zum cacheName in vite.config.ts (runtimeCaching) passen. */
export const TOUR_CACHE = 'tour-content';

/** Lädt Touren als statische Dateien von /tours/ (GitHub Pages, Netlify …). */
export class StaticContentAdapter implements ContentAdapter {
  constructor(private readonly baseUrl: string = import.meta.env.BASE_URL + 'tours/') {}

  private url(path: string) {
    return new URL(this.baseUrl + path, location.href).href;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(this.url(path));
    if (!res.ok) throw new Error(`Konnte ${path} nicht laden (${res.status})`);
    return (await res.json()) as T;
  }

  listTours() {
    return this.fetchJson<TourSummary[]>('index.json');
  }

  loadTour(id: string) {
    return this.fetchJson<BuiltTour>(`${id}/tour.json`);
  }

  async downloadTour(id: string, onProgress?: (done: number, total: number) => void) {
    if (!('caches' in globalThis)) throw new Error('Offline-Speicher wird von diesem Browser nicht unterstützt');
    const tour = await this.loadTour(id);
    const cache = await caches.open(TOUR_CACHE);
    const urls = tour.files.map((f) => this.url(`${id}/${f}`));
    let done = 0;
    onProgress?.(done, urls.length);
    for (const url of urls) {
      // cache.add lädt frisch vom Server und legt die Antwort im Speicher ab
      await cache.add(new Request(url, { cache: 'reload' }));
      onProgress?.(++done, urls.length);
    }
  }

  async isTourOffline(id: string) {
    if (!('caches' in globalThis)) return false;
    const cache = await caches.open(TOUR_CACHE);
    const tourRes = await cache.match(this.url(`${id}/tour.json`));
    if (!tourRes) return false;
    const tour = (await tourRes.json()) as BuiltTour;
    for (const f of tour.files) {
      if (!(await cache.match(this.url(`${id}/${f}`)))) return false;
    }
    return true;
  }
}
