import { describe, expect, it } from 'vitest';
import { LocalStorageAdapter, MemoryStore } from '../src/adapters/LocalStorageAdapter';

describe('LocalStorageAdapter', () => {
  it('speichert und lädt Werte', async () => {
    const s = new LocalStorageAdapter(new MemoryStore());
    await s.set('session', { tourId: 'worpswede', difficulty: 'easy' });
    expect(await s.get('session')).toEqual({ tourId: 'worpswede', difficulty: 'easy' });
    await s.remove('session');
    expect(await s.get('session')).toBeNull();
  });

  it('übersteht kaputte Einträge', async () => {
    const store = new MemoryStore();
    store.setItem('ermittlerakte:session', '{kaputt');
    expect(await new LocalStorageAdapter(store).get('session')).toBeNull();
  });
});
