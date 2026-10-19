import { useCallback, useEffect, useState } from 'preact/hooks';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ok'; data: T };

/** Lädt Daten asynchron und liefert Lade-/Fehler-/Ergebnis-Zustand plus "reload". */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): [AsyncState<T>, () => void] {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    fn().then(
      (data) => alive && setState({ status: 'ok', data }),
      (error: Error) => alive && setState({ status: 'error', error }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return [state, useCallback(() => setTick((t) => t + 1), [])];
}
