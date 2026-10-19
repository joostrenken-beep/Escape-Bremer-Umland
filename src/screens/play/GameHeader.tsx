import type { BuiltTour } from '../../content/types';
import { elapsedMs, isPaused, scoreOf, type GameAction } from '../../game/engine';
import type { GameSession } from '../../game/session';
import { formatDuration, useNow } from '../../game/useGame';
import { ui } from '../../i18n/ui';
import { navigate } from '../../router';
import { useSettings } from '../../settings';

export function GameHeader({ tour, session, dispatch }: { tour: BuiltTour; session: GameSession; dispatch: (a: GameAction) => void }) {
  const { settings } = useSettings();
  const paused = isPaused(session);
  const now = useNow(!paused);
  const stationNo = Math.min(session.stationIndex + 1, tour.stations.length);
  const progressDone =
    session.phase === 'finished' ? tour.stations.length : session.stationIndex + (session.phase === 'debrief' ? 1 : 0);

  return (
    <header class="game-header">
      <div class="game-stats">
        <span>
          <span class="sr-only">{ui('station')} </span>📍 {stationNo}/{tour.stations.length}
        </span>
        <span>
          <span class="sr-only">{ui('time')} </span>⏱ <span class="mono">{formatDuration(elapsedMs(session, now))}</span>
        </span>
        <span>
          <span class="sr-only">{ui('points')} </span>★ {scoreOf(tour, session)}
        </span>
        {settings.testMode && <span class="tag tag-test">{ui('testModeBadge')}</span>}
      </div>
      <div class="game-actions">
        {session.phase !== 'finished' && (
          <button class="btn icon-btn" onClick={() => dispatch({ type: 'pause' })} aria-label={ui('pause')} title={ui('pause')}>
            ⏸
          </button>
        )}
        <button class="btn icon-btn" onClick={() => navigate('notebook')} aria-label={ui('notebook')} title={ui('notebook')}>
          📓
        </button>
      </div>
      <div class="progress" aria-hidden="true">
        <div class="progress-bar" style={{ width: `${(progressDone / tour.stations.length) * 100}%` }} />
      </div>
    </header>
  );
}

export function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="pause-h">
      <div class="card overlay-card">
        <h2 id="pause-h">☕ {ui('paused')}</h2>
        <p>{ui('pausedText')}</p>
        <button class="btn" onClick={onResume} autoFocus>
          {ui('resume')}
        </button>
      </div>
    </div>
  );
}
