/**
 * Punkteregeln (mit dem Projektinhaber abgestimmt, siehe CLAUDE.md).
 *  - Punktekonto: Start mit 100 Punkten je Station, Hilfen ziehen davon ab.
 *  - Abzüge je Rätsel-Schritt: Hinweis 1/2/3 = −10/−20/−30, Auflösung −60, Überspringen −50.
 *  - „Hier stimmt etwas nicht“ + Ersatzfrage gelöst = kein Abzug.
 *  - Eine Station kann nicht unter 0 fallen.
 *  - Die Zeit wird nur angezeigt, sie kostet keine Punkte.
 */

export const STATION_POINTS = 100;
export const HINT_COSTS = [10, 20, 30] as const;
export const REVEAL_COST = 60;
export const SKIP_COST = 50;

export interface StepScoreInput {
  hintsUsed: number;
  revealed: boolean;
  skipped: boolean;
}

export function stepPenalty(step: StepScoreInput): number {
  let p = 0;
  for (let i = 0; i < Math.min(step.hintsUsed, HINT_COSTS.length); i++) p += HINT_COSTS[i];
  if (step.revealed) p += REVEAL_COST;
  if (step.skipped) p += SKIP_COST;
  return p;
}

export function stationScore(steps: StepScoreInput[]): number {
  const penalty = steps.reduce((sum, s) => sum + stepPenalty(s), 0);
  return Math.max(0, STATION_POINTS - penalty);
}

/** Kosten des nächsten Hinweises (oder null, wenn alle Hinweise genutzt sind). */
export function nextHintCost(hintsUsed: number): number | null {
  return hintsUsed < HINT_COSTS.length ? HINT_COSTS[hintsUsed] : null;
}
