import { useState } from 'preact/hooks';
import type { AccuseStepSource } from '../content/types';
import { checkAnswer } from '../game/codes';
import { leveled } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import type { PuzzleProps } from './types';

/** Abschlussbericht: Wer? Warum? Wo? – alle Fragen richtig = Fall gelöst (+ Finale-Bonus). */
export function AccusePuzzle({ step, tour, session, dispatch }: PuzzleProps<AccuseStepSource>) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ correct: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const lang = getLang();
  const complete = step.questions.every((q) => answers[q.id]);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!complete || busy) return;
    setBusy(true);
    let correct = 0;
    for (const q of step.questions) {
      const code = tour.codes[q.codeId];
      if (code && (await checkAnswer(tour.codeSalt, q.codeId, code, session.difficulty, answers[q.id]))) correct++;
    }
    setBusy(false);
    setResult({ correct });
    if (correct === step.questions.length) dispatch({ type: 'solve', answer: '' });
    else dispatch({ type: 'wrong' });
  };

  return (
    <form class="puzzle accuse" onSubmit={submit}>
      <p class="prompt">{leveled(step.prompt, session.difficulty, lang)}</p>
      {step.questions.map((q) => (
        <fieldset key={q.id} class="difficulty">
          <legend>{leveled(q.prompt, session.difficulty, lang)}</legend>
          {q.options.map((o) => (
            <label key={o.id} class={`choice ${answers[q.id] === o.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`${step.id}-${q.id}`}
                value={o.id}
                checked={answers[q.id] === o.id}
                onChange={() => {
                  setAnswers({ ...answers, [q.id]: o.id });
                  setResult(null);
                }}
              />
              <span class="choice-label">{leveled(o.label, session.difficulty, lang)}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <p class="feedback" role="status" aria-live="polite">
        {result && result.correct < step.questions.length
          ? ui('accuseWrong', { correct: result.correct, total: step.questions.length })
          : ''}
      </p>
      <button class="btn" type="submit" disabled={!complete || busy}>
        📝 {ui('accuseSubmit')}
      </button>
    </form>
  );
}
