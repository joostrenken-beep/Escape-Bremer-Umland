import { useEffect, useState } from 'preact/hooks';
import { UpdateBanner } from './components/PwaBanners';
import { loadSession, type GameSession } from './game/session';
import { ui } from './i18n/ui';
import { navigate, useRoute } from './router';
import { Notebook } from './screens/Notebook';
import { Play } from './screens/Play';
import { SettingsScreen } from './screens/Settings';
import { TourDetail } from './screens/TourDetail';
import { TourList } from './screens/TourList';
import { defaultSettings, loadSettings, saveSettings, SettingsContext, type Settings } from './settings';

export function App() {
  const route = useRoute();
  // undefined = wird noch geladen, null = keine laufende Ermittlung
  const [session, setSession] = useState<GameSession | null | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    loadSession().then(setSession);
    loadSettings().then(setSettings);
  }, []);

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const resetAll = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('ermittlerakte:'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* kein localStorage */
    }
    setSession(null);
    setSettings(defaultSettings);
    navigate();
  };

  if (session === undefined) return null;

  let screen;
  const [page, param] = route;
  if (!page) screen = <TourList session={session} />;
  else if (page === 'tour' && param) screen = <TourDetail tourId={param} session={session} onSessionChange={setSession} />;
  else if (page === 'play' && session) screen = <Play session={session} onSessionChange={setSession} />;
  else if (page === 'notebook' && (param || session))
    screen = <Notebook session={session} tourId={param ?? session!.tourId} initialTab={param && session?.tourId !== param ? 'knowledge' : 'notes'} />;
  else if (page === 'settings') screen = <SettingsScreen onResetAll={resetAll} />;
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
    <SettingsContext.Provider value={{ settings, update: updateSettings }}>
      <UpdateBanner />
      {screen}
    </SettingsContext.Provider>
  );
}
