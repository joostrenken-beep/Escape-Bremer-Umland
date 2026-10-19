import type { CodeStepSource } from '../content/types';
import { mediaUrl } from '../content/media';
import { CodeAnswer } from './CodeAnswer';
import type { PuzzleProps } from './types';

/** Code vor Ort finden und eingeben – optional mit Bild (z. B. „Findet dieses Detail“). */
export function CodePuzzle(props: PuzzleProps<CodeStepSource>) {
  const { step, tour, progress } = props;
  return (
    <div class="puzzle">
      {step.image && !progress.fallback && <img class="puzzle-img" src={mediaUrl(tour.id, step.image)} alt="" />}
      <CodeAnswer {...props} />
    </div>
  );
}
