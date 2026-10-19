import { useEffect, useRef } from 'preact/hooks';
import { LoadError, Loading } from '../components/Status';
import { useTour } from '../content/useTour';
import { isPaused } from '../game/engine';
import { clearSession, type GameSession } from '../game/session';
import { useGame } from '../game/useGame';
import { ui } from '../i18n/ui';
import { navigate } from '../router';
import { GameHeader, PauseOverlay } from './play/GameHeader';
import { DebriefView, FinishedView, IntroView, SolveView, TravelView } from './play/phases';

interface Props {
  session: GameSession;
  onSessionChange: (s: GameSession | null) => void;
}

export function Play({ session, onSessionChange }: Props) {
  const [state, reload] = useTour(session.tourId);
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <LoadError onRetry={reload} />;
  return <Game tour={state.data} session={session} onSessionChange={onSessionChange} />;
}

function Game({ tour, session, onSessionChange }: Props & { tour: import('../content/types').BuiltTour }) {
  const dispatch = useGame(session, tour, onSessionChange);
  const props = { tour, session, dispatch };
  const main = useRef<HTMLElement>(null);

  // Neuer Abschnitt: nach oben scrollen und Fokus auf die Überschrift (für Screenreader)
  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  }, [session.phase, session.stationIndex, session.stepIndex]);

  const newGame = async () => {
    if (session.phase !== 'finished' && !confirm(ui('abandonConfirm'))) return;
    await clearSession();
    onSessionChange(null);
    navigate('tour', tour.id);
  };

  let view;
  switch (session.phase) {
    case 'intro':
      view = <IntroView {...props} />;
      break;
    case 'travel':
      view = <TravelView {...props} />;
      break;
    case 'solve':
      view = <SolveView {...props} />;
      break;
    case 'debrief':
      view = <DebriefView {...props} />;
      break;
    case 'finished':
      view = <FinishedView {...props} onNewGame={newGame} />;
      break;
  }

  return (
    <>
      <GameHeader {...props} />
      <main class="screen screen-game" ref={main}>
        {view}
        {session.phase !== 'finished' && (
          <button class="btn btn-ghost abandon" onClick={newGame}>
            {ui('abandonCase')}
          </button>
        )}
      </main>
      {isPaused(session) && session.phase !== 'finished' && <PauseOverlay onResume={() => dispatch({ type: 'resume' })} />}
    </>
  );
}
