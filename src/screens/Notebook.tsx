import { useState } from 'preact/hooks';
import { LoadError, Loading } from '../components/Status';
import type { BuiltTour, NotebookEntrySource } from '../content/types';
import { useTour } from '../content/useTour';
import { loadKnowledge } from '../game/knowledge';
import type { GameSession } from '../game/session';
import { useAsync } from '../hooks';
import { localize } from '../i18n/text';
import { getLang, ui, type UiKey } from '../i18n/ui';
import { DidYouKnowCard, NotebookEntryCard } from './play/phases';

/** Ermittler-Notizbuch: Verdächtige, Spuren, Codes – plus Ortswissen. */
export function Notebook({ session, tourId, initialTab = 'notes' }: { session: GameSession | null; tourId: string; initialTab?: 'notes' | 'knowledge' }) {
  const [state, reload] = useTour(tourId);
  const [tab, setTab] = useState(initialTab);
  const back = session?.tourId === tourId ? '#/play' : `#/tour/${tourId}`;

  return (
    <main class="screen">
      <a class="back" href={back}>
        ‹ {ui('back')}
      </a>
      <h1>📓 {ui('notebook')}</h1>
      <div class="tabs" role="tablist">
        {session?.tourId === tourId && (
          <button role="tab" aria-selected={tab === 'notes'} class={`tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>
            {ui('notebook')}
          </button>
        )}
        <button role="tab" aria-selected={tab === 'knowledge'} class={`tab ${tab === 'knowledge' ? 'active' : ''}`} onClick={() => setTab('knowledge')}>
          {ui('knowledge')}
        </button>
      </div>
      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <LoadError onRetry={reload} />}
      {state.status === 'ok' &&
        (tab === 'notes' && session?.tourId === tourId ? (
          <Notes tour={state.data} session={session} />
        ) : (
          <Knowledge tour={state.data} />
        ))}
    </main>
  );
}

const SECTIONS: [NotebookEntrySource['kind'], UiKey][] = [
  ['suspect', 'suspects'],
  ['clue', 'clues'],
  ['note', 'notes'],
];

function Notes({ tour, session }: { tour: BuiltTour; session: GameSession }) {
  const lang = getLang();
  const entries = session.notebook.flatMap((n) => {
    if (n.type !== 'entry') return [];
    const e = tour.stations.find((s) => s.id === n.stationId)?.notebook?.find((x) => x.id === n.entryId);
    return e ? [e] : [];
  });
  const codes = session.notebook.filter((n) => n.type === 'code');
  if (entries.length === 0 && codes.length === 0) return <p class="status">{ui('notebookEmpty')}</p>;

  return (
    <>
      {SECTIONS.map(([kind, label]) => {
        const list = entries.filter((e) => e.kind === kind);
        return list.length ? (
          <section key={kind}>
            <h2>{ui(label)}</h2>
            <div class="note-list">
              {list.map((e) => (
                <NotebookEntryCard key={e.id} entry={e} tour={tour} session={session} />
              ))}
            </div>
          </section>
        ) : null;
      })}
      {codes.length > 0 && (
        <section>
          <h2>{ui('codes')}</h2>
          <ul class="card code-list">
            {codes.map((c) => {
              if (c.type !== 'code') return null;
              const station = tour.stations.find((s) => s.id === c.stationId);
              return (
                <li key={`${c.stationId}/${c.stepId}`}>
                  <span>{station ? localize(station.title, lang) : c.stationId}</span>
                  <strong class="mono">{c.value}</strong>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

function Knowledge({ tour }: { tour: BuiltTour }) {
  const [state] = useAsync(() => loadKnowledge(tour.id), [tour.id]);
  const lang = getLang();
  if (state.status !== 'ok') return null;
  const stations = tour.stations.filter((s) => state.data.includes(s.id) && s.didYouKnow);
  if (stations.length === 0) return <p class="status">{ui('knowledgeEmpty')}</p>;
  return (
    <div class="note-list">
      {stations.map((s) => (
        <section key={s.id}>
          <p class="eyebrow">{localize(s.title, lang)}</p>
          <DidYouKnowCard station={s} />
        </section>
      ))}
    </div>
  );
}
