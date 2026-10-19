/**
 * Api-Adapter für ein späteres Backend (siehe docs/API.md).
 * Werden nur benutzt, wenn beim Build VITE_API_URL gesetzt ist.
 */
import type { BuiltTour, TourSummary } from '../content/types';
import { StaticContentAdapter } from './StaticContentAdapter';
import type { AccessAdapter, ContentAdapter, GameResult, ScoreAdapter, StorageAdapter } from './types';

type Fetch = typeof fetch;

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Server antwortet mit ${res.status}`);
  return (await res.json()) as T;
}

/** Touren vom Server. Offline-Speicherung funktioniert wie bei statischen Dateien. */
export class ApiContentAdapter implements ContentAdapter {
  private readonly offline: StaticContentAdapter;
  constructor(
    private readonly baseUrl: string,
    private readonly f: Fetch = fetch.bind(globalThis),
  ) {
    this.offline = new StaticContentAdapter(`${baseUrl}/tours/`);
  }
  listTours() {
    return this.f(`${this.baseUrl}/tours`).then((r) => json<TourSummary[]>(r));
  }
  loadTour(id: string) {
    return this.f(`${this.baseUrl}/tours/${encodeURIComponent(id)}`).then((r) => json<BuiltTour>(r));
  }
  downloadTour(id: string, onProgress?: (done: number, total: number) => void) {
    return this.offline.downloadTour(id, onProgress);
  }
  isTourOffline(id: string) {
    return this.offline.isTourOffline(id);
  }
}

/** Bestenliste auf dem Server; fällt bei Fehlern (z. B. offline) auf die lokale Liste zurück. */
export class ApiScoreAdapter implements ScoreAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly local: ScoreAdapter,
    private readonly f: Fetch = fetch.bind(globalThis),
  ) {}
  async submit(result: GameResult) {
    await this.local.submit(result);
    try {
      await this.f(`${this.baseUrl}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
    } catch {
      /* offline – lokal ist gespeichert */
    }
  }
  async list(tourId: string) {
    try {
      return await this.f(`${this.baseUrl}/scores?tour=${encodeURIComponent(tourId)}`).then((r) => json<GameResult[]>(r));
    } catch {
      return this.local.list(tourId);
    }
  }
}

/** Freischaltcodes werden auf dem Server geprüft (nicht umgehbar). */
export class ApiAccessAdapter implements AccessAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly storage: StorageAdapter,
    private readonly f: Fetch = fetch.bind(globalThis),
  ) {}
  async isUnlocked(tour: BuiltTour) {
    if (!tour.access?.requireUnlockCode) return true;
    return (await this.storage.get<boolean>(`unlocked:${tour.id}`)) === true;
  }
  async unlock(tour: BuiltTour, code: string) {
    const res = await this.f(`${this.baseUrl}/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId: tour.id, code }),
    });
    const { valid } = await json<{ valid: boolean }>(res);
    if (valid) await this.storage.set(`unlocked:${tour.id}`, true);
    return valid;
  }
}
