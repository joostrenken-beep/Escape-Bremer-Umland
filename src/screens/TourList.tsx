import { content } from '../adapters';
import { LoadError, Loading } from '../components/Status';
import { InstallHint } from '../components/PwaBanners';
import { useAsync } from '../hooks';
import { localize } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import { navigate } from '../router';
import type { GameSession } from '../game/session';
import type { TourSummary } from '../content/types';
import { useSettings } from '../settings';
import { mediaUrl } from '../content/media';

export function TourList({ session }: { session: GameSession | null }) {
  const [state, reload] = useAsync(() => content.listTours(), []);
  const lang = getLang();
  const { settings } = useSettings();

  return (
    <main class="screen">
      <header class="hero">
        <p class="stamp">{ui('appName')}</p>
        <h1>{ui('appTagline')}</h1>
      </header>

      <InstallHint />

      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <LoadError onRetry={reload} />}
      {state.status === 'ok' && (
        <section aria-labelledby="tours-h">
          <h2 id="tours-h">{ui('chooseTour')}</h2>
          <ul class="tour-list">
            {state.data
              .filter((t) => t.published || settings.testMode)
              .map((t) => (
                <li key={t.id}>
                  <TourCard tour={t} lang={lang} active={session?.tourId === t.id} />
                </li>
              ))}
          </ul>
        </section>
      )}

      {session && session.phase !== 'finished' && (
        <div class="action-bar">
          <button class="btn" onClick={() => navigate('play')}>
            {ui('continueCase')}
          </button>
        </div>
      )}

      <footer class="footer">
        <a href="#/settings">⚙️ {ui('settings')}</a>
        {settings.testMode && <span class="tag tag-test">{ui('testModeBadge')}</span>}
      </footer>
    </main>
  );
}

function TourCard({ tour, lang, active }: { tour: TourSummary; lang: 'de' | 'en'; active: boolean }) {
  return (
    <article class="card tour-card">
      {tour.cover && <img class="cover" src={mediaUrl(tour.id, tour.cover)} alt="" loading="lazy" />}
      <p class="eyebrow">{localize(tour.town, lang)}</p>
      <h3>{localize(tour.title, lang)}</h3>
      <p>{localize(tour.teaser, lang)}</p>
      <ul class="facts" aria-label="Eckdaten">
        <li>
          ⏱ {tour.durationMinutes[0]}–{tour.durationMinutes[1]} {ui('minutes')}
        </li>
        <li>
          🚶 {tour.distanceKm.toLocaleString('de-DE')} {ui('km')}
        </li>
        <li>
          📍 {tour.stationCount} {ui('stations')}
        </li>
      </ul>
      {!tour.published && <p class="tag tag-test">unveröffentlicht</p>}
      {active && <p class="tag">{ui('activeCase')}</p>}
      <button class="btn" onClick={() => navigate('tour', tour.id)}>
        {ui('openCase')}
      </button>
    </article>
  );
}
