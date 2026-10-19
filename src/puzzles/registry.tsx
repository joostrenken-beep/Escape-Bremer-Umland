/**
 * Rätsel-Registry: ordnet jedem `type` aus dem Content eine Komponente zu.
 *
 * Neuen Rätseltyp hinzufügen:
 *  1. Typ in src/content/types.ts (StepSource) und schema/station.schema.json ergänzen
 *  2. Komponente in src/puzzles/ anlegen (bekommt PuzzleProps)
 *  3. Hier eintragen – TypeScript meckert, solange ein Typ fehlt.
 */
import type { ComponentType } from 'preact';
import type { StepSource } from '../content/types';
import { CodePuzzle } from './CodePuzzle';
import type { PuzzleProps } from './types';

type Registry = { [K in StepSource['type']]: ComponentType<PuzzleProps<Extract<StepSource, { type: K }>>> };

export const puzzles: Registry = {
  code: CodePuzzle,
};

export function PuzzleView(props: PuzzleProps) {
  const Component = puzzles[props.step.type] as ComponentType<PuzzleProps>;
  return <Component {...props} />;
}

/** Welcher Code gilt gerade (Hauptfrage oder Ersatzfrage)? Für Auflösung/Notizbuch. */
export function activeCodeId(step: StepSource, fallback: boolean): string {
  return fallback && step.fallback ? step.fallback.codeId : step.codeId;
}
