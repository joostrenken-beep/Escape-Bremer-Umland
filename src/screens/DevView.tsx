/**
 * Entwickler-Ansicht (#/dev): alles, was vor Ort noch geprüft werden muss.
 *  - alle Angaben mit `verified: false` (Koordinaten, Code-Fragen, „Wusstest du?“)
 *  - alle Texte mit [PLATZHALTER]
 *  - Codes-Quelle (echte Codes oder Platzhalter?)
 *  - Routenkarte + Luftlinien-Längen
 *  - „Meinen Standort anzeigen“, um vor Ort echte Koordinaten abzulesen
 */
import { useState } from 'preact/hooks';
import { RouteMap } from '../components/RouteMap';
import { FieldCheck } from './FieldCheck';
import { operatorComplete } from '../legal';
import { LoadError, Loading } from '../components/Status';
import type { BuiltTour } from '../content/types';
import { useTour } from '../content/useTour';
import { collectUnverified, collectPlaceholders, type UnverifiedItem } from '../content/verification';
import { distanceM, formatDistance, routeLengthM } from '../geo/geo';
import { useGeolocation, useOnline } from '../geo/sensors';
import { content } from '../adapters';
import { useAsync } from '../hooks';
import { localize } from '../i18n/text';

export function DevView({ tourId }: { tourId?: string }) {
  const [tours] = useAsync(() => content.listTours(), []);
  if (!tourId) {
    return (
      <main class="screen">
        <a class="back" href="#/settings">‹ Zurück</a>
        <h1>🛠 Entwickler-Ansicht</h1>
        {tours.status === 'ok' ? (
          <ul class="dev-list">
            {tours.data.map((t) => (
              <li key={t.id}>
                <a class="btn btn-secondary" href={`#/dev/${t.id}`}>
                  {localize(t.town)} – {localize(t.title)}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <Loading />
        )}
      </main>
    );
  }
  return <DevTour tourId={tourId} />;
}

function DevTour({ tourId }: { tourId: string }) {
  const [state, reload] = useTour(tourId);
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <LoadError onRetry={reload} />;
  const tour = state.data;
  return (
    <main class="screen">
      <a class="back" href="#/dev">‹ Zurück</a>
      <h1>🛠 {localize(tour.town)}</h1>
      <p class="small">
        Version {tour.version} · gebaut {new Date(tour.builtAt).toLocaleString('de-DE')}
      </p>
      <CodesStatus tour={tour} />
      {!operatorComplete && (
        <p class="card dev-warn">⚠️ Impressum fehlt noch: Name, Anschrift und E-Mail in src/legal.ts eintragen (oder Claude geben).</p>
      )}
      <FieldCheck tour={tour} />
      <MyPosition tour={tour} />
      <RouteOverview tour={tour} />
      <Checklist tour={tour} />
    </main>
  );
}

function CodesStatus({ tour }: { tour: BuiltTour }) {
  const source = {
    secret: 'Codes aus dem GitHub-Secret TOUR_CODES',
    local: 'Codes aus lokaler codes.json',
    example: 'Nur Platzhalter-Codes aus codes.example.json',
  }[tour.codesSource];
  const open = tour.placeholderCodes.length;
  return (
    <p class={`card ${open ? 'dev-warn' : ''}`}>
      {open ? '⚠️' : '✅'} {source}.{' '}
      {open
        ? `${open} Orts-Codes sind noch Platzhalter (Antwort „0000“, Ersatzfrage „test“) – unten in der Vor-Ort-Erfassung eintragen.`
        : 'Alle Orts-Codes sind hinterlegt.'}
    </p>
  );
}

/** Vor Ort: aktuelle Koordinaten ablesen und die nächstgelegene Station zeigen. */
function MyPosition({ tour }: { tour: BuiltTour }) {
  const [active, setActive] = useState(false);
  const geo = useGeolocation(active);
  const nearest = geo.pos
    ? tour.stations
        .map((s) => ({ s, d: distanceM(geo.pos!, s.location) }))
        .sort((a, b) => a.d - b.d)[0]
    : undefined;
  const coords = geo.pos ? `${geo.pos.lat.toFixed(5)}, ${geo.pos.lng.toFixed(5)}` : '';
  return (
    <section class="card">
      <h2 class="h3">📍 Mein Standort</h2>
      {!active ? (
        <button class="btn btn-secondary" onClick={() => setActive(true)}>
          Meinen Standort anzeigen
        </button>
      ) : geo.pos ? (
        <>
          <p class="mono dev-coords">{coords}</p>
          <p class="small">Genauigkeit ±{Math.round(geo.accuracyM ?? 0)} m</p>
          {nearest && (
            <p class="small">
              Nächste Station laut Content: <strong>{localize(nearest.s.title)}</strong> ({formatDistance(nearest.d)} entfernt)
            </p>
          )}
          <button class="btn btn-small btn-secondary" onClick={() => navigator.clipboard?.writeText(coords)}>
            Koordinaten kopieren
          </button>
        </>
      ) : (
        <p class="small">{geo.status === 'denied' ? 'Standortzugriff verweigert.' : 'Suche GPS-Signal …'}</p>
      )}
    </section>
  );
}

function RouteOverview({ tour }: { tour: BuiltTour }) {
  const online = useOnline();
  const [show, setShow] = useState(false);
  const route = [tour.start, ...tour.stations.map((s) => s.location)];
  return (
    <section class="card">
      <h2 class="h3">🗺 Route</h2>
      <p class="small">
        Luftlinie Start → Stationen: <strong>{formatDistance(routeLengthM(route))}</strong> (echte Gehstrecke ist länger) · Angabe in
        tour.json: {tour.distanceKm.toLocaleString('de-DE')} km
      </p>
      <ol class="dev-route">
        {tour.stations.map((s, i) => (
          <li key={s.id}>
            {localize(s.title)}{' '}
            <span class="small">
              ({formatDistance(distanceM(i === 0 ? tour.start : tour.stations[i - 1].location, s.location))}
              {s.location.verified ? ', ✅ Lage geprüft' : ', ⚠️ Lage geschätzt'})
            </span>
          </li>
        ))}
      </ol>
      {online &&
        (show ? (
          <RouteMap
            height={360}
            route={route}
            points={tour.stations.map((s, i) => ({ ...s.location, label: `${i + 1}. ${localize(s.title)}`, kind: 'todo' as const }))}
          />
        ) : (
          <button class="btn btn-small btn-secondary" onClick={() => setShow(true)}>
            Karte anzeigen
          </button>
        ))}
    </section>
  );
}

function describe(item: UnverifiedItem): string {
  const v = item.value as Record<string, unknown>;
  if (typeof v.lat === 'number') return `Koordinaten ${(v.lat as number).toFixed(5)}, ${(v.lng as number).toFixed(5)}`;
  if (v.type === 'code') {
    const prompt = v.prompt as Record<string, { de: string }>;
    return `Code-Frage: ${(prompt.all ?? prompt.medium ?? Object.values(prompt)[0]).de}`;
  }
  if (v.text && typeof (v.text as { de?: string }).de === 'string') return `„Wusstest du?“: ${(v.text as { de: string }).de}`;
  return '';
}

function Checklist({ tour }: { tour: BuiltTour }) {
  const sections = [
    { title: 'Start', node: tour.start, prefix: 'start' },
    ...tour.stations.map((s, i) => ({ title: `${i + 1}. ${localize(s.title)}`, node: s, prefix: s.id })),
  ];
  const total = collectUnverified({ start: tour.start, stations: tour.stations }).length;
  const placeholders = collectPlaceholders({ start: tour.start, stations: tour.stations }).length;

  const asText = () =>
    sections
      .map(({ title, node }) => {
        const items = collectUnverified(node).map((it) => `  [ ] ${describe(it)}${it.note ? `\n      → ${it.note}` : ''}`);
        const ph = collectPlaceholders(node).map((p) => `  [ ] Platzhalter-Text (${p.path}): ${p.text}`);
        return [title, ...items, ...ph].join('\n');
      })
      .join('\n\n');

  return (
    <section>
      <h2>✅ Prüfliste vor Ort</h2>
      <p class="small">
        {total} Angaben mit <code>verified: false</code> · {placeholders} Texte mit [PLATZHALTER]
      </p>
      <button class="btn btn-small btn-secondary" onClick={() => navigator.clipboard?.writeText(asText())}>
        Prüfliste als Text kopieren
      </button>
      {sections.map(({ title, node, prefix }) => {
        const items = collectUnverified(node);
        const ph = collectPlaceholders(node);
        if (!items.length && !ph.length) return null;
        return (
          <article key={prefix} class="card dev-station">
            <h3>{title}</h3>
            <ul>
              {items.map((it) => (
                <li key={it.path}>
                  <span class="dev-path">{it.path}</span>
                  <span>{describe(it)}</span>
                  {it.note && <span class="small">→ {it.note}</span>}
                </li>
              ))}
              {ph.map((p) => (
                <li key={p.path}>
                  <span class="dev-path">{p.path}</span>
                  <span>Platzhalter-Text: {p.text}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
