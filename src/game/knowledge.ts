/**
 * „Wusstest du?“-Archiv: merkt sich, welche Stationen einer Tour man schon
 * erreicht hat – auch über das Spielende (und einen Neustart) hinaus.
 */
import { storage } from '../adapters';

const key = (tourId: string) => `knowledge:${tourId}`;

export async function loadKnowledge(tourId: string): Promise<string[]> {
  return (await storage.get<string[]>(key(tourId))) ?? [];
}

export async function addKnowledge(tourId: string, stationId: string): Promise<void> {
  const list = await loadKnowledge(tourId);
  if (!list.includes(stationId)) await storage.set(key(tourId), [...list, stationId]);
}
