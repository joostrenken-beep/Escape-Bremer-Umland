/**
 * Rätsel-Registry: ordnet jedem `type` aus dem Content eine Komponente zu.
 *
 * Neuen Rätseltyp hinzufügen:
 *  1. Typ in src/content/types.ts (StepSource) und schema/station.schema.json ergänzen
 *  2. Komponente in src/puzzles/ anlegen (bekommt PuzzleProps)
 *  3. Hier eintragen – TypeScript meckert, solange ein Typ fehlt.
 */
import type { ComponentType } from 'preact';
import type { StepSource, StepType } from '../content/types';
import { AccusePuzzle } from './AccusePuzzle';
import { AudioPuzzle } from './AudioPuzzle';
import { CodePuzzle } from './CodePuzzle';
import { ColorFilterPuzzle } from './ColorFilterPuzzle';
import { CompassPuzzle } from './CompassPuzzle';
import { LockPuzzle } from './LockPuzzle';
import { MorsePuzzle } from './MorsePuzzle';
import { OverlayPuzzle } from './OverlayPuzzle';
import { SliderPuzzle } from './SliderPuzzle';
import type { PuzzleProps } from './types';

type Registry = { [K in StepType]: ComponentType<PuzzleProps<Extract<StepSource, { type: K }>>> };

export const puzzles: Registry = {
  code: CodePuzzle,
  audio: AudioPuzzle,
  morse: MorsePuzzle,
  colorfilter: ColorFilterPuzzle,
  overlay: OverlayPuzzle,
  lock: LockPuzzle,
  slider: SliderPuzzle,
  compass: CompassPuzzle,
  accuse: AccusePuzzle,
};

export function PuzzleView(props: PuzzleProps) {
  const Component = puzzles[props.step.type] as ComponentType<PuzzleProps>;
  return <Component {...props} />;
}

/**
 * Welcher Code gilt gerade (Hauptfrage oder Ersatzfrage)? Für die Auflösung.
 * undefined = Rätsel ohne Code → Auflösung steht in `solutionText`.
 */
export function activeCodeId(step: StepSource, fallback: boolean): string | undefined {
  if ('fallback' in step && fallback && step.fallback) return step.fallback.codeId;
  if (step.type === 'accuse') return undefined;
  return 'codeId' in step ? step.codeId : undefined;
}
