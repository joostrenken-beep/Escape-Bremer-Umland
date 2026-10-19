import { ui } from '../i18n/ui';

export function Loading() {
  return (
    <p class="status" role="status" aria-live="polite">
      {ui('loading')}
    </p>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div class="status" role="alert">
      <p>{ui('loadError')}</p>
      <button class="btn" onClick={onRetry}>
        {ui('retry')}
      </button>
    </div>
  );
}
