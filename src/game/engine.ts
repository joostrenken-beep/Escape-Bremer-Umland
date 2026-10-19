/**
 * Spiel-Engine: reine Funktion (Spielstand, Aktion) → neuer Spielstand.
 *
 * Keine Oberfläche, kein Speichern, keine Uhrzeit aus dem System – alles kommt
 * als Parameter herein. Dadurch lässt sich der komplette Spielablauf in Tests
 * durchspielen (tests/engine.test.ts).
 */
import type { BuiltTour, StationSource, StepSource } from '../content/types';
import { stationScore, type StepScoreInput } from './scoring';
import type { GameSession, NotebookItem, StepProgress } from './session';

export type GameAction =
  | { type: 'begin' } // Fallakte gelesen → los
  | { type: 'arrive' } // „Wir sind da“
  | { type: 'hint' }
  | { type: 'reveal' } // Auflösung anzeigen
  | { type: 'solve'; answer: string } // richtige Antwort (Prüfung passiert vorher, async)
  | { type: 'wrong' } // falscher Versuch (nur Zähler)
  | { type: 'acceptReveal' } // nach der Auflösung weiter
  | { type: 'useFallback' } // „Hier stimmt etwas nicht“ → Ersatzfrage
  | { type: 'skip' } // Schritt überspringen (−50)
  | { type: 'next' } // nach Debrief zur nächsten Station
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'testSolve' } // Testmodus: Schritt ohne Code lösen
  | { type: 'testJump'; stationIndex: number }; // Testmodus: zu Station springen

export const stepKey = (stationId: string, stepId: string) => `${stationId}/${stepId}`;

export const emptyProgress = (): StepProgress => ({
  hintsUsed: 0,
  revealed: false,
  fallback: false,
  skipped: false,
  solved: false,
  attempts: 0,
});

export function currentStation(tour: BuiltTour, s: GameSession): StationSource | undefined {
  return tour.stations[Math.min(s.stationIndex, tour.stations.length - 1)];
}

export function currentStep(tour: BuiltTour, s: GameSession): StepSource | undefined {
  return currentStation(tour, s)?.steps[s.stepIndex];
}

export function progressOf(s: GameSession, stationId: string, stepId: string): StepProgress {
  return s.steps[stepKey(stationId, stepId)] ?? emptyProgress();
}

// --- Zeit ---------------------------------------------------------------

export function elapsedMs(s: GameSession, now: number): number {
  const { elapsedMs, runningSince } = s.timer;
  return elapsedMs + (runningSince === null ? 0 : Math.max(0, now - runningSince));
}

export const isPaused = (s: GameSession) => s.timer.runningSince === null;

function stopClock(s: GameSession, now: number): GameSession {
  if (isPaused(s)) return s;
  return { ...s, timer: { elapsedMs: elapsedMs(s, now), runningSince: null } };
}

function startClock(s: GameSession, now: number): GameSession {
  if (!isPaused(s)) return s;
  return { ...s, timer: { ...s.timer, runningSince: now } };
}

// --- Punkte -------------------------------------------------------------

export function scoreOf(tour: BuiltTour, s: GameSession): number {
  return tour.stations.reduce((sum, station, i) => {
    const done = i < s.stationIndex || (i === s.stationIndex && (s.phase === 'debrief' || s.phase === 'finished'));
    if (!done) return sum;
    const steps: StepScoreInput[] = station.steps.map((st) => progressOf(s, station.id, st.id));
    return sum + stationScore(steps);
  }, 0);
}

export function maxScore(tour: BuiltTour): number {
  return tour.stations.length * 100;
}

// --- Reducer ------------------------------------------------------------

function updateStep(s: GameSession, tour: BuiltTour, fn: (p: StepProgress) => StepProgress): GameSession {
  const station = currentStation(tour, s);
  const step = currentStep(tour, s);
  if (!station || !step) return s;
  const key = stepKey(station.id, step.id);
  return { ...s, steps: { ...s.steps, [key]: fn(s.steps[key] ?? emptyProgress()) } };
}

/** Schritt erledigt → nächster Schritt oder Debrief (inkl. Notizbuch-Einträge). */
function advanceStep(s: GameSession, tour: BuiltTour, nowIso: string): GameSession {
  const station = currentStation(tour, s);
  if (!station) return s;
  const step = currentStep(tour, s);
  let notebook = s.notebook;

  // Gelösten Code ins Notizbuch
  if (step) {
    const p = progressOf(s, station.id, step.id);
    if (p.answer && !notebook.some((n) => n.type === 'code' && n.stationId === station.id && n.stepId === step.id)) {
      notebook = [...notebook, { type: 'code', stationId: station.id, stepId: step.id, value: p.answer, at: nowIso }];
    }
  }

  if (s.stepIndex + 1 < station.steps.length) {
    return { ...s, notebook, stepIndex: s.stepIndex + 1 };
  }

  // Station fertig: Notizbuch-Einträge der Station übernehmen
  const added: NotebookItem[] = (station.notebook ?? [])
    .filter((e) => !notebook.some((n) => n.type === 'entry' && n.stationId === station.id && n.entryId === e.id))
    .map((e) => ({ type: 'entry', stationId: station.id, entryId: e.id, at: nowIso }));
  return { ...s, notebook: [...notebook, ...added], phase: 'debrief' };
}

export function reduce(s: GameSession, tour: BuiltTour, action: GameAction, now: number): GameSession {
  const nowIso = new Date(now).toISOString();

  switch (action.type) {
    case 'pause':
      return stopClock(s, now);
    case 'resume':
      return startClock(s, now);
  }

  // Jede Spielaktion setzt eine pausierte Uhr wieder in Gang
  if (s.phase !== 'finished') s = startClock(s, now);

  switch (action.type) {
    case 'begin':
      return s.phase === 'intro' ? { ...s, phase: 'travel', stationIndex: 0, stepIndex: 0 } : s;

    case 'arrive':
      return s.phase === 'travel' ? { ...s, phase: 'solve', stepIndex: 0 } : s;

    case 'hint':
      if (s.phase !== 'solve') return s;
      return updateStep(s, tour, (p) => (p.hintsUsed < 3 ? { ...p, hintsUsed: p.hintsUsed + 1 } : p));

    case 'reveal':
      if (s.phase !== 'solve') return s;
      return updateStep(s, tour, (p) => ({ ...p, revealed: true }));

    case 'wrong':
      if (s.phase !== 'solve') return s;
      return updateStep(s, tour, (p) => ({ ...p, attempts: p.attempts + 1 }));

    case 'solve':
      if (s.phase !== 'solve') return s;
      s = updateStep(s, tour, (p) => ({ ...p, solved: true, attempts: p.attempts + 1, answer: action.answer.trim() }));
      return advanceStep(s, tour, nowIso);

    case 'acceptReveal':
      if (s.phase !== 'solve') return s;
      s = updateStep(s, tour, (p) => (p.revealed ? { ...p, solved: true } : p));
      return progressOfCurrent(s, tour)?.solved ? advanceStep(s, tour, nowIso) : s;

    case 'useFallback':
      if (s.phase !== 'solve' || !currentStep(tour, s)?.fallback) return s;
      return updateStep(s, tour, (p) => ({ ...p, fallback: true }));

    case 'skip':
      if (s.phase !== 'solve') return s;
      s = updateStep(s, tour, (p) => ({ ...p, skipped: true, solved: true }));
      return advanceStep(s, tour, nowIso);

    case 'testSolve':
      if (s.phase !== 'solve') return s;
      s = updateStep(s, tour, (p) => ({ ...p, solved: true }));
      return advanceStep({ ...s, usedTestMode: true }, tour, nowIso);

    case 'testJump': {
      const i = Math.max(0, Math.min(action.stationIndex, tour.stations.length - 1));
      return { ...s, usedTestMode: true, phase: 'travel', stationIndex: i, stepIndex: 0 };
    }

    case 'next':
      if (s.phase !== 'debrief') return s;
      if (s.stationIndex + 1 < tour.stations.length) {
        return { ...s, phase: 'travel', stationIndex: s.stationIndex + 1, stepIndex: 0 };
      }
      return { ...stopClock(s, now), phase: 'finished', finishedAt: nowIso };
  }
}

function progressOfCurrent(s: GameSession, tour: BuiltTour): StepProgress | undefined {
  const station = currentStation(tour, s);
  const step = currentStep(tour, s);
  return station && step ? progressOf(s, station.id, step.id) : undefined;
}

/**
 * Passt einen gespeicherten Spielstand an eine geänderte Tour an
 * (z. B. weil nach einem Update eine Station weniger existiert).
 */
export function reconcile(s: GameSession, tour: BuiltTour): GameSession {
  const last = tour.stations.length - 1;
  if (s.stationIndex <= last) {
    const steps = tour.stations[s.stationIndex].steps.length;
    return s.stepIndex < steps ? s : { ...s, stepIndex: 0 };
  }
  return { ...s, stationIndex: last, stepIndex: 0, phase: s.phase === 'finished' ? 'finished' : 'travel' };
}
