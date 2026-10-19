import { content } from '../adapters';
import { LoadError, Loading } from '../components/Status';
import { clearSession, type GameSession } from '../game/session';
import { useAsync } from '../hooks';
import { leveled, localize } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import { navigate } from '../router';

/** Platzhalter: zeigt den Fallbeginn. Der eigentliche Stationsablauf folgt in Meilenstein 2. */
export function Play({ session, onSessionChange }: { session: GameSession; onSessionChange: (s: null) => void }) {
  const [state, reload] = useAsync(() => content.loadTour(session.tourId), [session.tourId]);
  const lang = getLang();

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <LoadError onRetry={reload} />;
  const tour = state.data;

  const abandon = async () => {
    if (!confirm(ui('abandonConfirm'))) return;
    await clearSession();
    onSessionChange(null);
    navigate();
  };

  return (
    <main class="screen">
      <a class="back" href={`#/tour/${tour.id}`}>
        ‹ {ui('back')}
      </a>
      <article class="card file">
        <p class="stamp">Akte {localize(tour.town, lang)}</p>
        <h1>{localize(tour.title, lang)}</h1>
        <p class="lead">{leveled(tour.story.intro, session.difficulty, lang)}</p>
      </article>
      <p class="status">{ui('playPlaceholder')}</p>
      <ol class="station-preview">
        {tour.stations.map((s) => (
          <li key={s.id}>{localize(s.title, lang)}</li>
        ))}
      </ol>
      <div class="action-bar">
        <button class="btn btn-ghost" onClick={abandon}>
          {ui('abandonCase')}
        </button>
      </div>
    </main>
  );
}
