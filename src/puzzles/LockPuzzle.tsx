import { useState } from 'preact/hooks';
import type { LockStepSource } from '../content/types';
import { checkAnswer } from '../game/codes';
import { leveled } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import type { PuzzleProps } from './types';

/** Zahlenschloss mit Drehrädern (▲/▼ oder Wischen per Tastatur-Pfeiltasten). */
export function LockPuzzle({ step, tour, session, dispatch }: PuzzleProps<LockStepSource>) {
  const [digits, setDigits] = useState<number[]>(() => Array(step.digits).fill(0));
  const [state, setState] = useState<'idle' | 'busy' | 'wrong' | 'open'>('idle');
  const lang = getLang();

  const turn = (i: number, delta: number) => {
    setDigits((d) => d.map((v, k) => (k === i ? (v + delta + 10) % 10 : v)));
    setState('idle');
  };

  const open = async () => {
    setState('busy');
    const code = tour.codes[step.codeId];
    const value = digits.join('');
    const ok = code ? await checkAnswer(tour.codeSalt, step.codeId, code, session.difficulty, value) : false;
    if (ok) {
      setState('open');
      setTimeout(() => dispatch({ type: 'solve', answer: value }), 1200);
    } else {
      setState('wrong');
      dispatch({ type: 'wrong' });
    }
  };

  return (
    <div class="puzzle">
      <p class="prompt">{leveled(step.prompt, session.difficulty, lang)}</p>
      <div class={`lock ${state === 'wrong' ? 'is-wrong' : ''} ${state === 'open' ? 'is-open' : ''}`}>
        <span class="lock-shackle" aria-hidden="true" />
        <div class="lock-body">
          {digits.map((d, i) => (
            <div class="wheel" key={i}>
              <button class="wheel-btn" onClick={() => turn(i, 1)} aria-label={ui('wheelUp', { n: i + 1 })}>
                ▲
              </button>
              <span
                class="wheel-digit"
                role="spinbutton"
                tabIndex={0}
                aria-valuemin={0}
                aria-valuemax={9}
                aria-valuenow={d}
                aria-label={ui('wheel', { n: i + 1 })}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') turn(i, 1);
                  if (e.key === 'ArrowDown') turn(i, -1);
                  if (/^[0-9]$/.test(e.key)) setDigits((ds) => ds.map((v, k) => (k === i ? Number(e.key) : v)));
                }}
              >
                {d}
              </span>
              <button class="wheel-btn" onClick={() => turn(i, -1)} aria-label={ui('wheelDown', { n: i + 1 })}>
                ▼
              </button>
            </div>
          ))}
        </div>
      </div>
      <p class="feedback" role="status" aria-live="polite">
        {state === 'wrong' ? ui('lockWrong') : state === 'open' ? `🔓 ${ui('lockOpen')}` : ''}
      </p>
      <button class="btn" onClick={open} disabled={state === 'busy' || state === 'open'}>
        🔑 {ui('lockTry')}
      </button>
    </div>
  );
}
