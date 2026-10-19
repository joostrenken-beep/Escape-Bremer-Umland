/** Bildschirme für die einzelnen Spielphasen. */
import type { BuiltTour, NotebookEntrySource, StationSource } from '../../content/types';
import { mediaUrl } from '../../content/media';
import { elapsedMs, maxScore, progressOf, scoreOf, type GameAction } from '../../game/engine';
import { drawCertificate, shareCanvas } from '../../game/certificate';
import { useRef, useState } from 'preact/hooks';
import { STATION_POINTS, stationScore } from '../../game/scoring';
import type { GameSession } from '../../game/session';
import { formatDuration } from '../../game/useGame';
import { leveled, localize } from '../../i18n/text';
import { getLang, ui } from '../../i18n/ui';
import { Navigator } from '../../components/Navigator';
import { ReadAloud } from '../../components/ReadAloud';
import { useSettings } from '../../settings';
import { StepShell } from './StepShell';

interface PhaseProps {
  tour: BuiltTour;
  session: GameSession;
  dispatch: (a: GameAction) => void;
}

export function IntroView({ tour, session, dispatch }: PhaseProps) {
  const lang = getLang();
  const intro = leveled(tour.story.intro, session.difficulty, lang);
  return (
    <>
      <article class="card file">
        <p class="stamp">{ui('caseFile')}</p>
        <h1 tabIndex={-1}>{localize(tour.title, lang)}</h1>
        {tour.cover && <img class="cover" src={mediaUrl(tour.id, tour.cover)} alt={ui('coverAlt')} />}
        <p class="lead">{intro}</p>
        <ReadAloud text={intro} />
      </article>
      <section class="card">
        <h2 class="h3">{ui('startingPoint')}</h2>
        <p>
          <strong>{localize(tour.start.name, lang)}</strong>
        </p>
        <p class="small">{leveled(tour.start.description, session.difficulty, lang)}</p>
      </section>
      <div class="action-bar">
        <button class="btn" onClick={() => dispatch({ type: 'begin' })}>
          {ui('letsGo')}
        </button>
      </div>
    </>
  );
}

export function TravelView({ tour, session, dispatch }: PhaseProps) {
  const { settings } = useSettings();
  const lang = getLang();
  const station = tour.stations[session.stationIndex];
  return (
    <>
      <section class="card">
        <p class="eyebrow">
          {ui('wayToStation')} {session.stationIndex + 1}
        </p>
        <h1 tabIndex={-1}>{localize(station.title, lang)}</h1>
        <p class="small">📍 {localize(station.location.name, lang)}</p>
        <p class="lead">{leveled(station.directions, session.difficulty, lang)}</p>
      </section>
      <Navigator
        target={station.location}
        targetLabel={localize(station.title, lang)}
        from={session.stationIndex > 0 ? tour.stations[session.stationIndex - 1].location : tour.start}
      />
      {settings.testMode && (
        <label class="card test-jump">
          <span>{ui('testJump')}</span>
          <select
            value={session.stationIndex}
            onChange={(e) => dispatch({ type: 'testJump', stationIndex: Number((e.target as HTMLSelectElement).value) })}
          >
            {tour.stations.map((s, i) => (
              <option key={s.id} value={i}>
                {i + 1}. {localize(s.title, lang)}
              </option>
            ))}
          </select>
        </label>
      )}
      <div class="action-bar">
        <button class="btn" onClick={() => dispatch({ type: 'arrive' })}>
          {ui('weAreHere')}
        </button>
      </div>
    </>
  );
}

export function SolveView({ tour, session, dispatch }: PhaseProps) {
  const lang = getLang();
  const station = tour.stations[session.stationIndex];
  const step = station.steps[session.stepIndex];
  const story = leveled(station.story, session.difficulty, lang);
  return (
    <>
      <article class="card file">
        <p class="eyebrow">
          {ui('station')} {session.stationIndex + 1}
        </p>
        <h1 tabIndex={-1}>{localize(station.title, lang)}</h1>
        <p class="lead">{story}</p>
        <ReadAloud text={story} audioSrc={station.audio ? mediaUrl(tour.id, station.audio) : undefined} />
      </article>
      {station.steps.length > 1 && (
        <p class="small step-count">
          {ui('puzzle')} {session.stepIndex + 1} {ui('of')} {station.steps.length}
        </p>
      )}
      {step && <StepShell key={`${station.id}/${step.id}`} tour={tour} station={station} step={step} session={session} dispatch={dispatch} />}
    </>
  );
}

export function NotebookEntryCard({ entry, tour, session }: { entry: NotebookEntrySource; tour: BuiltTour; session: GameSession }) {
  const lang = getLang();
  return (
    <article class={`card note note-${entry.kind}`}>
      {entry.image && <img src={mediaUrl(tour.id, entry.image)} alt="" class="note-img" />}
      <h3>{localize(entry.title, lang)}</h3>
      <p>{leveled(entry.text, session.difficulty, lang)}</p>
    </article>
  );
}

export function DidYouKnowCard({ station }: { station: StationSource }) {
  const lang = getLang();
  if (!station.didYouKnow) return null;
  return (
    <aside class="card did-you-know">
      <h2 class="h3">💡 {ui('didYouKnow')}</h2>
      <p>{localize(station.didYouKnow.text, lang)}</p>
    </aside>
  );
}

export function DebriefView({ tour, session, dispatch }: PhaseProps) {
  const lang = getLang();
  const station = tour.stations[session.stationIndex];
  const points = stationScore(station.steps.map((s) => progressOf(session, station.id, s.id)));
  const isLast = session.stationIndex + 1 >= tour.stations.length;
  return (
    <>
      <section class="card file" aria-live="polite">
        <p class="stamp">{ui('stationSolved')}</p>
        <h1 tabIndex={-1}>{localize(station.title, lang)}</h1>
        <p class="lead">
          ★ {ui('stationPoints', { points, max: STATION_POINTS })}
        </p>
      </section>
      {station.notebook && station.notebook.length > 0 && (
        <section>
          <h2>📓 {ui('newInNotebook')}</h2>
          <div class="note-list">
            {station.notebook.map((e) => (
              <NotebookEntryCard key={e.id} entry={e} tour={tour} session={session} />
            ))}
          </div>
        </section>
      )}
      <DidYouKnowCard station={station} />
      <div class="action-bar">
        <button class="btn" onClick={() => dispatch({ type: 'next' })}>
          {isLast ? ui('toFinale') : ui('nextStation')}
        </button>
      </div>
    </>
  );
}

export function FinishedView({ tour, session, dispatch, onNewGame }: PhaseProps & { onNewGame: () => void }) {
  const lang = getLang();
  const outro = leveled(tour.story.outro, session.difficulty, lang);
  const score = scoreOf(tour, session);
  const max = maxScore(tour);
  const time = formatDuration(elapsedMs(session, Date.now()));
  const [team, setTeam] = useState(session.teamName ?? '');
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const make = async () => {
    setBusy(true);
    if (team !== (session.teamName ?? '')) dispatch({ type: 'setTeam', name: team });
    const canvas = await drawCertificate({
      team: team.trim(),
      tourTitle: localize(tour.title, lang),
      town: localize(tour.town, lang),
      difficulty: localize(tour.difficulties[session.difficulty].label, lang),
      score,
      maxScore: max,
      time,
      date: new Date(session.finishedAt ?? Date.now()).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }),
      imageUrl: tour.cover ? mediaUrl(tour.id, tour.cover) : undefined,
    });
    canvasRef.current = canvas;
    setPreview(canvas.toDataURL('image/png'));
    setBusy(false);
  };

  const share = () => {
    if (canvasRef.current) shareCanvas(canvasRef.current, 'ermittlerurkunde.png', ui('certificate'));
  };

  return (
    <>
      <article class="card file">
        <p class="stamp">{ui('caseClosed')}</p>
        <h1 tabIndex={-1}>{localize(tour.title, lang)}</h1>
        {tour.cover && <img class="cover cover-small" src={mediaUrl(tour.id, tour.cover)} alt="" />}
        <p class="lead">{outro}</p>
      </article>
      <section class="card result">
        <p>
          <span class="result-label">{ui('finalScore')}</span>
          <span class="result-value">
            ★ {score} <span class="small">/ {max}</span>
          </span>
        </p>
        <p>
          <span class="result-label">{ui('finalTime')}</span>
          <span class="result-value">⏱ {time}</span>
        </p>
        {session.usedTestMode && <p class="small">🧪 {ui('testModeUsed')}</p>}
      </section>

      <section class="card certificate">
        <h2 class="h3">🏅 {ui('certificate')}</h2>
        <label class="field">
          <span>{ui('teamName')}</span>
          <input
            class="text-input"
            value={team}
            maxLength={40}
            placeholder={ui('teamNamePlaceholder')}
            onInput={(e) => {
              setTeam((e.target as HTMLInputElement).value);
              setPreview(null);
            }}
          />
        </label>
        {!preview ? (
          <button class="btn" onClick={make} disabled={busy}>
            {busy ? ui('loading') : ui('makeCertificate')}
          </button>
        ) : (
          <>
            <img class="certificate-preview" src={preview} alt={ui('certificate')} />
            <button class="btn" onClick={share}>
              📤 {ui('shareCertificate')}
            </button>
            <p class="small">{ui('certificatePrivacy')}</p>
          </>
        )}
      </section>

      <a class="btn btn-secondary" href="#/notebook">
        📓 {ui('notebook')} & {ui('knowledge')}
      </a>
      <button class="btn btn-ghost" onClick={onNewGame}>
        {ui('newGame')}
      </button>
    </>
  );
}
