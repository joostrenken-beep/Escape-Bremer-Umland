import { useEffect, useState } from 'preact/hooks';
import type { BuiltTour, StationSource, StepSource } from '../../content/types';
import { revealSolution } from '../../game/codes';
import { progressOf, type GameAction } from '../../game/engine';
import { nextHintCost, REVEAL_COST, SKIP_COST } from '../../game/scoring';
import type { GameSession } from '../../game/session';
import { leveled, localize } from '../../i18n/text';
import { getLang, ui } from '../../i18n/ui';
import { activeCodeId, PuzzleView } from '../../puzzles/registry';
import { useSettings } from '../../settings';

interface Props {
  tour: BuiltTour;
  station: StationSource;
  step: StepSource;
  session: GameSession;
  dispatch: (a: GameAction) => void;
}

/** Rahmen um jedes Rätsel: Hinweise, Auflösung, „Hier stimmt etwas nicht“, Testmodus. */
export function StepShell({ tour, station, step, session, dispatch }: Props) {
  const { settings } = useSettings();
  const progress = progressOf(session, station.id, step.id);
  const [troubleOpen, setTroubleOpen] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const lang = getLang();
  const codeId = activeCodeId(step, progress.fallback);

  useEffect(() => {
    if (!progress.revealed) return setSolution(null);
    if (!codeId) {
      // Rätsel ohne Code (Schiebepuzzle, Kompass, Anklage): Auflösung steht offen im Content
      return setSolution('solutionText' in step ? leveled(step.solutionText, session.difficulty, lang) : '—');
    }
    const code = tour.codes[codeId];
    if (!code) return setSolution('—');
    revealSolution(tour.codeSalt, codeId, code.reveal).then(
      (t) => setSolution(localize(t, lang)),
      () => setSolution('—'),
    );
  }, [progress.revealed, codeId, tour, lang]);

  // Hinweise gehören zur Hauptfrage – bei der Ersatzfrage gibt es nur die Auflösung
  const hints = progress.fallback ? [] : step.hints.slice(0, progress.hintsUsed);
  const hintCost = progress.fallback ? null : nextHintCost(progress.hintsUsed);

  if (progress.revealed) {
    return (
      <section class="card solution" aria-labelledby="solution-h">
        <h3 id="solution-h">{ui('solution')}</h3>
        <p aria-live="polite">{solution ?? ui('loading')}</p>
        <button class="btn" onClick={() => dispatch({ type: 'acceptReveal' })}>
          {ui('continue')}
        </button>
      </section>
    );
  }

  return (
    <div class="step">
      <PuzzleView step={step} tour={tour} session={session} progress={progress} dispatch={dispatch} />

      {hints.length > 0 && (
        <section class="hints" aria-label={ui('hints')}>
          <ol>
            {hints.map((h, i) => (
              <li key={i}>
                <strong>
                  {ui('hint')} {i + 1}:
                </strong>{' '}
                {leveled(h, session.difficulty, lang)}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div class="step-help">
        {hintCost !== null ? (
          <button class="btn btn-secondary" onClick={() => dispatch({ type: 'hint' })}>
            💡 {ui('showHint', { n: progress.hintsUsed + 1, cost: hintCost })}
          </button>
        ) : (
          <button class="btn btn-secondary" onClick={() => dispatch({ type: 'reveal' })}>
            🔓 {ui('showSolution', { cost: REVEAL_COST })}
          </button>
        )}

        {!troubleOpen ? (
          <button class="btn btn-ghost" onClick={() => setTroubleOpen(true)}>
            ⚠️ {ui('somethingWrong')}
          </button>
        ) : (
          <div class="card trouble" role="group" aria-label={ui('somethingWrong')}>
            <p>{ui('somethingWrongText')}</p>
            {'fallback' in step && step.fallback && !progress.fallback && (
              <button
                class="btn btn-secondary"
                onClick={() => {
                  dispatch({ type: 'useFallback' });
                  setTroubleOpen(false);
                }}
              >
                {ui('useFallback')}
              </button>
            )}
            <button class="btn btn-secondary" onClick={() => dispatch({ type: 'skip' })}>
              {ui('skipStep', { cost: SKIP_COST })}
            </button>
            <button class="btn btn-ghost" onClick={() => setTroubleOpen(false)}>
              {ui('cancel')}
            </button>
          </div>
        )}

        {settings.testMode && (
          <button class="btn btn-test" onClick={() => dispatch({ type: 'testSolve' })}>
            {ui('testSolve')}
          </button>
        )}
      </div>
    </div>
  );
}
