import { useCallback, useEffect, useState } from 'preact/hooks';
import type { BuiltTour } from '../content/types';
import { currentStation, reconcile, reduce, type GameAction } from './engine';
import { addKnowledge } from './knowledge';
import { saveSession, type GameSession } from './session';

/**
 * Verbindet Engine, Speicher und Oberfläche: jede Aktion erzeugt einen neuen
 * Spielstand, der sofort gespeichert wird.
 */
export function useGame(session: GameSession, tour: BuiltTour, onChange: (s: GameSession) => void) {
  const dispatch = useCallback(
    (action: GameAction) => {
      const next = reduce(session, tour, action, Date.now());
      if (next === session) return;
      saveSession(next);
      onChange(next);
      if (next.phase === 'debrief') {
        const st = currentStation(tour, next);
        if (st) addKnowledge(tour.id, st.id);
      }
    },
    [session, tour, onChange],
  );

  // Gespeicherten Stand an evtl. geänderte Tour anpassen
  useEffect(() => {
    const fixed = reconcile(session, tour);
    if (fixed !== session) {
      saveSession(fixed);
      onChange(fixed);
    }
  }, [tour]);

  return dispatch;
}

/** Aktuelle Uhrzeit, die sich jede Sekunde aktualisiert (nur wenn `active`). */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
