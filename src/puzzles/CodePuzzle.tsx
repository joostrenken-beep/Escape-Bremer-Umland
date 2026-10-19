import { useState } from 'preact/hooks';
import type { CodeStepSource } from '../content/types';
import { checkAnswer } from '../game/codes';
import { leveled } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import type { PuzzleProps } from './types';

/** Code vor Ort finden und eingeben (Jahreszahl, Inschrift, Anzahl …). */
export function CodePuzzle({ step, tour, session, progress, dispatch }: PuzzleProps<CodeStepSource>) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const lang = getLang();

  const active = progress.fallback && step.fallback ? step.fallback : step;
  const inputId = `code-${step.id}`;

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true);
    const code = tour.codes[active.codeId];
    const ok = code ? await checkAnswer(tour.codeSalt, active.codeId, code, session.difficulty, value) : false;
    setBusy(false);
    if (ok) {
      dispatch({ type: 'solve', answer: value });
      setValue('');
      setWrong(false);
    } else {
      dispatch({ type: 'wrong' });
      setWrong(true);
    }
  };

  return (
    <form class="code-puzzle" onSubmit={submit}>
      {progress.fallback && <p class="tag tag-warn">{ui('fallbackActive')}</p>}
      <label for={inputId} class="prompt">
        {leveled(active.prompt, session.difficulty, lang)}
      </label>
      <input
        id={inputId}
        class={`code-input ${wrong ? 'is-wrong' : ''}`}
        value={value}
        onInput={(e) => {
          setValue((e.target as HTMLInputElement).value);
          setWrong(false);
        }}
        inputMode={active.input === 'number' ? 'numeric' : 'text'}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellcheck={false}
        enterKeyHint="done"
        placeholder={ui('yourAnswer')}
        aria-invalid={wrong}
        aria-describedby={wrong ? `${inputId}-err` : undefined}
      />
      <p id={`${inputId}-err`} class="feedback" role="status" aria-live="polite">
        {wrong ? ui('wrongAnswer') : ''}
      </p>
      <button class="btn" type="submit" disabled={busy || !value.trim()}>
        {busy ? ui('checking') : ui('check')}
      </button>
    </form>
  );
}
