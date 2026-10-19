import type { GameResult, ScoreAdapter, StorageAdapter } from './types';

const MAX_RESULTS = 20;

/** Bestenliste nur auf diesem Gerät (im StorageAdapter). */
export class LocalScoreAdapter implements ScoreAdapter {
  constructor(private readonly storage: StorageAdapter) {}

  async submit(result: GameResult) {
    const list = await this.list(result.tourId);
    // gleiches Spiel nicht doppelt eintragen (z. B. nach Neuladen)
    if (list.some((r) => r.finishedAt === result.finishedAt)) return;
    const next = [...list, result].sort((a, b) => b.score - a.score || a.timeMs - b.timeMs).slice(0, MAX_RESULTS);
    await this.storage.set(`scores:${result.tourId}`, next);
  }

  async list(tourId: string) {
    return (await this.storage.get<GameResult[]>(`scores:${tourId}`)) ?? [];
  }
}
