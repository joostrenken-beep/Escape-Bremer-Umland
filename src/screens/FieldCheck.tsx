/**
 * Vor-Ort-Erfassung (Entwickler-Ansicht): Beim Ablaufen der Route je Station
 *  - den GPS-Standort übernehmen,
 *  - die tatsächlich gefundenen Antworten eintragen,
 *  - abhaken, dass Texte/Wege passen, und Notizen machen.
 * Alles bleibt auf dem Gerät (StorageAdapter). Am Ende:
 *  - „Codes fürs GitHub-Secret“ → JSON für das Secret TOUR_CODES
 *  - „Prüfbericht“ → Text mit Koordinaten/Notizen, um den Content anzupassen.
 */
import { useEffect, useState } from 'preact/hooks';
import { storage } from '../adapters';
import { codeIdsOfStep, type BuiltTour, type CodesFile, type LeveledText } from '../content/types';

interface StationCheck {
  coords?: { lat: number; lng: number; acc: number };
  checked?: boolean;
  note?: string;
}

export interface FieldData {
  stations: Record<string, StationCheck>;
  /** codeId → eingegebene Antworten (Komma-getrennt) */
  codes: Record<string, string>;
}

const key = (tourId: string) => `fieldcheck:${tourId}`;
const raw = (t: LeveledText | undefined) => (t ? (t.all ?? t.medium ?? t.easy ?? t.hard)?.de ?? '' : '');

/** JSON für das GitHub-Secret TOUR_CODES (nur ausgefüllte Codes). */
export function codesForSecret(tourId: string, data: FieldData): Record<string, CodesFile> {
  const codes: CodesFile['codes'] = {};
  for (const [id, value] of Object.entries(data.codes)) {
    const answers = value.split(',').map((a) => a.trim()).filter(Boolean);
    if (answers.length) codes[id] = { answers, reveal: { de: `Die richtige Antwort lautet „${answers[0]}“.` } };
  }
  return { [tourId]: { codes } };
}

export function fieldReport(tour: BuiltTour, data: FieldData): string {
  const lines = [`Prüfbericht ${tour.town.de} (Tour-Version ${tour.version}), ${new Date().toLocaleString('de-DE')}`, ''];
  tour.stations.forEach((s, i) => {
    const c = data.stations[s.id] ?? {};
    lines.push(`${i + 1}. ${s.title.de} (${s.id})`);
    lines.push(c.coords ? `   Koordinaten: ${c.coords.lat.toFixed(6)}, ${c.coords.lng.toFixed(6)} (±${Math.round(c.coords.acc)} m)` : '   Koordinaten: –');
    lines.push(`   Texte & Weg geprüft: ${c.checked ? 'ja' : 'nein'}`);
    const filled = s.steps.flatMap(codeIdsOfStep).filter((id) => data.codes[id]?.trim());
    lines.push(`   Codes eingetragen: ${filled.length ? filled.join(', ') : '–'}`);
    if (c.note?.trim()) lines.push(`   Notiz: ${c.note.trim()}`);
    lines.push('');
  });
  return lines.join('\n');
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }),
  );
}

export function FieldCheck({ tour }: { tour: BuiltTour }) {
  const [data, setData] = useState<FieldData | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [exported, setExported] = useState<{ title: string; text: string } | null>(null);

  useEffect(() => {
    storage.get<FieldData>(key(tour.id)).then((d) => setData(d ?? { stations: {}, codes: {} }));
  }, [tour.id]);

  if (!data) return null;

  const save = (next: FieldData) => {
    setData(next);
    storage.set(key(tour.id), next);
  };
  const setStation = (id: string, patch: StationCheck) =>
    save({ ...data, stations: { ...data.stations, [id]: { ...data.stations[id], ...patch } } });
  const setCode = (id: string, value: string) => save({ ...data, codes: { ...data.codes, [id]: value } });

  const takePosition = async (id: string) => {
    setBusy(id);
    try {
      const p = await currentPosition();
      setStation(id, { coords: { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy } });
    } catch {
      alert('Standort nicht verfügbar – Standortzugriff erlauben und draußen erneut versuchen.');
    }
    setBusy(null);
  };

  const exportText = async (title: string, text: string) => {
    setExported({ title, text });
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      /* Text steht unten zum manuellen Kopieren */
    }
  };

  const done = tour.stations.filter((s) => data.stations[s.id]?.checked).length;
  const openCodes = tour.placeholderCodes.filter((id) => !data.codes[id]?.trim()).length;

  return (
    <section>
      <h2>📝 Vor-Ort-Erfassung</h2>
      <p class="small">
        Beim Ablaufen der Route je Station ausfüllen. Alles bleibt auf diesem Handy. Stand: {done}/{tour.stations.length} Stationen
        geprüft, {openCodes} Orts-Codes offen.
      </p>
      {tour.stations.map((s, i) => {
        const c = data.stations[s.id] ?? {};
        const locationSteps = s.steps.filter((st) => !st.verified);
        return (
          <article key={s.id} class={`card dev-station field ${c.checked ? 'field-done' : ''}`}>
            <h3>
              {i + 1}. {s.title.de} {c.checked && '✅'}
            </h3>
            <button class="btn btn-small btn-secondary" onClick={() => takePosition(s.id)} disabled={busy === s.id}>
              📍 {busy === s.id ? 'Suche GPS …' : c.coords ? 'Standort neu übernehmen' : 'Standort übernehmen'}
            </button>
            {c.coords && (
              <p class="small mono">
                {c.coords.lat.toFixed(6)}, {c.coords.lng.toFixed(6)} (±{Math.round(c.coords.acc)} m)
              </p>
            )}
            {locationSteps.map((st) =>
              codeIdsOfStep(st).map((id) => {
                const isFallback = 'fallback' in st && st.fallback?.codeId === id;
                const prompt = isFallback && 'fallback' in st ? raw(st.fallback?.prompt) : raw(st.prompt);
                return (
                  <label key={id} class="field-row">
                    <span class="small">
                      {isFallback ? 'Ersatzfrage' : 'Frage'}: {prompt.replace('[PLATZHALTER] ', '')}
                    </span>
                    <input
                      class="text-input"
                      value={data.codes[id] ?? ''}
                      placeholder="Antwort vor Ort (mehrere mit Komma)"
                      onInput={(e) => setCode(id, (e.target as HTMLInputElement).value)}
                    />
                  </label>
                );
              }),
            )}
            <label class="field-row">
              <span class="small">Notiz (z. B. besserer Weg, Frage passt nicht, Fakt stimmt nicht)</span>
              <textarea class="text-input" rows={2} value={c.note ?? ''} onInput={(e) => setStation(s.id, { note: (e.target as HTMLTextAreaElement).value })} />
            </label>
            <label class="field-check">
              <input type="checkbox" checked={!!c.checked} onChange={(e) => setStation(s.id, { checked: (e.target as HTMLInputElement).checked })} />
              <span>Station geprüft: Weg, Texte und „Wusstest du?“ passen</span>
            </label>
          </article>
        );
      })}
      <div class="step-help">
        <button class="btn" onClick={() => exportText('Codes fürs GitHub-Secret TOUR_CODES', JSON.stringify(codesForSecret(tour.id, data), null, 2))}>
          🔑 Codes fürs GitHub-Secret kopieren
        </button>
        <button class="btn btn-secondary" onClick={() => exportText('Prüfbericht', fieldReport(tour, data))}>
          📋 Prüfbericht kopieren
        </button>
      </div>
      {exported && (
        <div class="card">
          <p>
            <strong>{exported.title}</strong> – in die Zwischenablage kopiert (falls nicht: Text unten markieren und kopieren).
          </p>
          <textarea class="text-input mono" rows={10} readOnly value={exported.text} onFocus={(e) => (e.target as HTMLTextAreaElement).select()} />
        </div>
      )}
    </section>
  );
}
