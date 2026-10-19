import { useEffect, useState } from 'preact/hooks';
import { useRegisterSW } from 'virtual:pwa-register/preact';
import { ui } from '../i18n/ui';
import { storage } from '../adapters';

/** Hinweis „Neue Version“ bzw. „Jetzt offline nutzbar“ vom Service Worker. */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  if (needRefresh) {
    return (
      <div class="banner" role="status">
        <span>{ui('updateAvailable')}</span>
        <button class="btn btn-small" onClick={() => updateServiceWorker(true)}>
          {ui('update')}
        </button>
        <button class="btn btn-small btn-ghost" onClick={() => setNeedRefresh(false)}>
          {ui('later')}
        </button>
      </div>
    );
  }
  if (offlineReady) {
    return (
      <div class="banner" role="status">
        <span>{ui('appOfflineReady')}</span>
        <button class="btn btn-small" onClick={() => setOfflineReady(false)}>
          {ui('ok')}
        </button>
      </div>
    );
  }
  return null;
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;

/** iPhone zeigt keinen automatischen Installations-Dialog – daher ein eigener Tipp. */
export function InstallHint() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (!isIos() || isStandalone()) return;
    storage.get<boolean>('installHintDismissed').then((d) => setHidden(!!d));
  }, []);
  if (hidden) return null;
  return (
    <aside class="card install-hint" aria-label={ui('installTitle')}>
      <strong>{ui('installTitle')}</strong>
      <p class="small">{ui('installIos')}</p>
      <button
        class="btn btn-small btn-ghost"
        onClick={() => {
          setHidden(true);
          storage.set('installHintDismissed', true);
        }}
      >
        {ui('dismiss')}
      </button>
    </aside>
  );
}
