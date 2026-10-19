import type { BuiltTour, StepSource } from '../content/types';
import type { GameAction } from '../game/engine';
import type { GameSession, StepProgress } from '../game/session';

/**
 * Was jede Rätsel-Komponente (Plugin) bekommt.
 * Hinweise, Auflösung, „Hier stimmt etwas nicht“ und Testmodus übernimmt
 * der gemeinsame Rahmen (StepShell) – das Plugin kümmert sich nur um das
 * eigentliche Rätsel und meldet `solve` bzw. `wrong`.
 */
export interface PuzzleProps<S extends StepSource = StepSource> {
  step: S;
  tour: BuiltTour;
  session: GameSession;
  progress: StepProgress;
  dispatch: (action: GameAction) => void;
}
