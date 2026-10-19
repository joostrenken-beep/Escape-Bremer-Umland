import { useState } from 'preact/hooks';
import { OfflineButton } from '../components/OfflineButton';
import { LoadError, Loading } from '../components/Status';
import { DIFFICULTIES, type Difficulty } from '../content/types';
import { useTour } from '../content/useTour';
import { newSession, saveSession, type GameSession } from '../game/session';
import { leveled, localize } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import { navigate } from '../router';

interface Props {
  tourId: string;
  session: GameSession | null;
  onSessionChange: (s: GameSession | null) => void;
}

export function TourDetail({ tourId, session, onSessionChange }: Props) {
  const [state, reload] = useTour(tourId);
  const [difficulty, setDifficulty] = useState<Difficulty>(session?.tourId === tourId ? session.difficulty : 'medium');
  const lang = getLang();
  const running = session?.tourId === tourId && session.phase !== 'finished';

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <LoadError onRetry={reload} />;
  const tour = state.data;

  const start = async () => {
    // Läuft schon eine andere Ermittlung? Dann nachfragen.
    if (session && session.phase !== 'finished' && !confirm(ui('abandonConfirm'))) return;
    const s = newSession(tour.id, tour.version, difficulty, Date.now());
    await saveSession(s);
    onSessionChange(s);
    navigate('play');
  };

  return (
    <main class="screen">
      <a class="back" href="#/">
        ‹ {ui('back')}
      </a>
      <header>
        <p class="eyebrow">{localize(tour.town, lang)}</p>
        <h1>{localize(tour.title, lang)}</h1>
        <p>{localize(tour.teaser, lang)}</p>
      </header>

      <section class="card">
        <h2 class="h3">{ui('startingPoint')}</h2>
        <p>
          <strong>{localize(tour.start.name, lang)}</strong>
        </p>
        <p class="small">{leveled(tour.start.description, difficulty, lang)}</p>
      </section>

      <OfflineButton tourId={tour.id} />

      <a class="btn btn-secondary" href={`#/notebook/${tour.id}`}>
        💡 {ui('knowledge')}
      </a>

      {running ? (
        <div class="action-bar">
          <button class="btn" onClick={() => navigate('play')}>
            {ui('continueCase')}
          </button>
        </div>
      ) : (
        <>
          <fieldset class="difficulty">
            <legend>{ui('chooseDifficulty')}</legend>
            {DIFFICULTIES.map((d) => (
              <label key={d} class={`choice ${difficulty === d ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                />
                <span class="choice-label">{localize(tour.difficulties[d].label, lang)}</span>
                <span class="choice-desc">{localize(tour.difficulties[d].description, lang)}</span>
              </label>
            ))}
          </fieldset>
          <div class="action-bar">
            <button class="btn" onClick={start}>
              {ui('startCase')}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
