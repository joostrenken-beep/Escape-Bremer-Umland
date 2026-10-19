/**
 * Schiebepuzzle-Logik (rein, getestet).
 * tiles[pos] = Nummer des Teils an Position pos; das leere Feld hat die Nummer n*n-1.
 */
import { seededRandom } from './random';

export const solved = (n: number) => Array.from({ length: n * n }, (_, i) => i);
export const isSolved = (tiles: number[]) => tiles.every((t, i) => t === i);

function neighbors(pos: number, n: number): number[] {
  const r = Math.floor(pos / n);
  const c = pos % n;
  const out: number[] = [];
  if (r > 0) out.push(pos - n);
  if (r < n - 1) out.push(pos + n);
  if (c > 0) out.push(pos - 1);
  if (c < n - 1) out.push(pos + 1);
  return out;
}

/** Schiebt das Teil an `pos` ins leere Feld, falls es daneben liegt. Sonst unverändert. */
export function move(tiles: number[], pos: number, n: number): number[] {
  const blank = tiles.indexOf(n * n - 1);
  if (!neighbors(blank, n).includes(pos)) return tiles;
  const next = [...tiles];
  [next[blank], next[pos]] = [next[pos], next[blank]];
  return next;
}

/** Mischt durch zufällige ERLAUBTE Züge – dadurch ist das Puzzle garantiert lösbar. */
export function shuffle(n: number, seed: string, moves = n * n * 20): number[] {
  const rnd = seededRandom(seed);
  let tiles = solved(n);
  let prevBlank = -1;
  for (let i = 0; i < moves; i++) {
    const blank = tiles.indexOf(n * n - 1);
    const options = neighbors(blank, n).filter((p) => p !== prevBlank);
    const pick = options[Math.floor(rnd() * options.length)];
    tiles = move(tiles, pick, n);
    prevBlank = blank;
  }
  return isSolved(tiles) ? move(tiles, neighbors(tiles.indexOf(n * n - 1), n)[0], n) : tiles;
}
