import { useEffect, useState } from 'preact/hooks';
import { content } from '../adapters';
import { ui } from '../i18n/ui';

type State = 'unknown' | 'missing' | 'saving' | 'ready' | 'failed';

/** Zeigt, ob ein Stadtpaket offline verfügbar ist, und lädt es auf Wunsch herunter. */
export function OfflineButton({ tourId }: { tourId: string }) {
  const [state, setState] = useState<State>('unknown');
  const [progress, setProgress] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    content.isTourOffline(tourId).then((ok) => setState(ok ? 'ready' : 'missing'), () => setState('missing'));
  }, [tourId]);

  if (state === 'unknown') return null;
  if (state === 'ready') {
    return (
      <p class="offline-badge">
        <span aria-hidden="true">✔</span> {ui('offlineReady')}
      </p>
    );
  }

  const save = async () => {
    setState('saving');
    try {
      await content.downloadTour(tourId, (done, total) => setProgress([done, total]));
      setState('ready');
    } catch {
      setState('failed');
    }
  };

  return (
    <div class="offline-box">
      <p class="small">{state === 'failed' ? ui('saveOfflineFailed') : ui('saveOfflineHint')}</p>
      <button class="btn btn-secondary" onClick={save} disabled={state === 'saving'} aria-busy={state === 'saving'}>
        {state === 'saving' ? `${ui('savingOffline')} ${progress[0]}/${progress[1]}` : ui('saveOffline')}
      </button>
    </div>
  );
}
