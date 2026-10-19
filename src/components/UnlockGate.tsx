import { useState } from 'preact/hooks';
import { access } from '../adapters';
import type { BuiltTour } from '../content/types';
import { ui } from '../i18n/ui';

/** Freischaltcode-Eingabe vor Tourbeginn (nur wenn tour.access.requireUnlockCode). */
export function UnlockGate({ tour, onUnlocked }: { tour: BuiltTour; onUnlocked: () => void }) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'wrong' | 'error'>('idle');

  const submit = async (e: Event) => {
    e.preventDefault();
    setState('busy');
    try {
      if (await access.unlock(tour, code)) onUnlocked();
      else setState('wrong');
    } catch {
      setState('error');
    }
  };

  return (
    <form class="card unlock" onSubmit={submit}>
      <h2 class="h3">🔐 {ui('unlockTitle')}</h2>
      <p class="small">{ui('unlockText')}</p>
      <input
        class="code-input"
        value={code}
        onInput={(e) => {
          setCode((e.target as HTMLInputElement).value);
          setState('idle');
        }}
        autoComplete="off"
        autoCapitalize="characters"
        placeholder={ui('unlockPlaceholder')}
        aria-label={ui('unlockTitle')}
      />
      <p class="feedback" role="status" aria-live="polite">
        {state === 'wrong' ? ui('unlockWrong') : state === 'error' ? ui('unlockError') : ''}
      </p>
      <button class="btn" type="submit" disabled={!code.trim() || state === 'busy'}>
        {ui('unlockButton')}
      </button>
    </form>
  );
}
