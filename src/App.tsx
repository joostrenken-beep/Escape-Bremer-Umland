import { useEffect, useState } from 'preact/hooks';
import { UpdateBanner } from './components/PwaBanners';
import { loadSession, type GameSession } from './game/session';
import { ui } from './i18n/ui';
import { navigate, useRoute } from './router';
import { Play } from './screens/Play';
import { TourDetail } from './screens/TourDetail';
import { TourList } from './screens/TourList';

export function App() {
  const route = useRoute();
  // undefined = wird noch geladen, null = keine laufende Ermittlung
  const [session, setSession] = useState<GameSession | null | undefined>(undefined);

  useEffect(() => {
    loadSession().then(setSession);
  }, []);

  if (session === undefined) return null;

  let screen;
  const [page, param] = route;
  if (!page) screen = <TourList session={session} />;
  else if (page === 'tour' && param) screen = <TourDetail tourId={param} session={session} onSessionChange={setSession} />;
  else if (page === 'play' && session) screen = <Play session={session} onSessionChange={setSession} />;
  else
    screen = (
      <main class="screen">
        <p class="status">{ui('notFound')}</p>
        <button class="btn" onClick={() => navigate()}>
          {ui('toStart')}
        </button>
      </main>
    );

  return (
    <>
      <UpdateBanner />
      {screen}
    </>
  );
}
