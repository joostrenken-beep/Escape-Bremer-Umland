import type { BuiltTour } from '../content/types';
import { checkAccessCode } from '../game/codes';
import type { AccessAdapter, StorageAdapter } from './types';

/**
 * Freischaltung ohne Server: Die gültigen Codes stehen gehasht im Tour-Paket
 * (tour.accessHashes). Eine freigeschaltete Tour merkt sich das Gerät.
 * Hinweis: Ohne Server lässt sich das umgehen – für echten Verkauf später
 * den ApiAccessAdapter verwenden (Codes werden dann auf dem Server geprüft).
 */
export class LocalAccessAdapter implements AccessAdapter {
  constructor(private readonly storage: StorageAdapter) {}

  async isUnlocked(tour: BuiltTour) {
    if (!tour.access?.requireUnlockCode) return true;
    return (await this.storage.get<boolean>(`unlocked:${tour.id}`)) === true;
  }

  async unlock(tour: BuiltTour, code: string) {
    const ok = await checkAccessCode(tour.codeSalt, tour.accessHashes ?? [], code);
    if (ok) await this.storage.set(`unlocked:${tour.id}`, true);
    return ok;
  }
}
