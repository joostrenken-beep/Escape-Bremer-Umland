import { useEffect, useState } from 'preact/hooks';
import type { SliderStepSource } from '../content/types';
import { mediaUrl } from '../content/media';
import { forLevel } from '../game/codes';
import { leveled } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import { isSolved, move, shuffle } from './slider';
import type { PuzzleProps } from './types';

/** Schiebepuzzle: Teile neben dem leeren Feld antippen, bis das Bild stimmt. */
export function SliderPuzzle({ step, tour, session, dispatch }: PuzzleProps<SliderStepSource>) {
  const n = forLevel(step.size, session.difficulty) ?? 3;
  const [tiles, setTiles] = useState(() => shuffle(n, `${session.startedAt}:${step.id}`));
  const [done, setDone] = useState(false);
  const [moves, setMoves] = useState(0);
  const lang = getLang();
  const src = mediaUrl(tour.id, step.image);
  const blank = n * n - 1;

  useEffect(() => {
    if (!done && isSolved(tiles)) {
      setDone(true);
      const t = setTimeout(() => dispatch({ type: 'solve', answer: '' }), 1600);
      return () => clearTimeout(t);
    }
  }, [tiles]);

  const tap = (pos: number) => {
    if (done) return;
    const next = move(tiles, pos, n);
    if (next !== tiles) {
      setTiles(next);
      setMoves((m) => m + 1);
    }
  };

  return (
    <div class="puzzle">
      <p class="prompt">{leveled(step.prompt, session.difficulty, lang)}</p>
      <div
        class={`slider-grid ${done ? 'slider-done' : ''}`}
        style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
        role="group"
        aria-label={ui('sliderLabel', { n })}
      >
        {tiles.map((tile, pos) => {
          const r = Math.floor(tile / n);
          const c = tile % n;
          const isBlank = tile === blank && !done;
          return (
            <button
              key={tile}
              class={`slider-tile ${isBlank ? 'blank' : ''}`}
              onClick={() => tap(pos)}
              disabled={isBlank || done}
              aria-label={isBlank ? ui('sliderEmpty') : ui('sliderTile', { tile: tile + 1, pos: pos + 1 })}
              style={
                isBlank
                  ? undefined
                  : {
                      backgroundImage: `url("${src}")`,
                      backgroundSize: `${n * 100}% ${n * 100}%`,
                      backgroundPosition: `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%`,
                    }
              }
            />
          );
        })}
      </div>
      <p class="small" role="status" aria-live="polite">
        {done ? `✅ ${leveled(step.solutionText, session.difficulty, lang)}` : ui('sliderMoves', { moves })}
      </p>
    </div>
  );
}
