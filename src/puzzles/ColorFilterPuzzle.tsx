import { useEffect, useRef, useState } from 'preact/hooks';
import type { ColorFilterStepSource } from '../content/types';
import { forLevel } from '../game/codes';
import { ui } from '../i18n/ui';
import { CodeAnswer } from './CodeAnswer';
import { seededRandom } from './random';
import type { PuzzleProps } from './types';

const W = 640;
const H = 320;

/**
 * Versteckte Nachricht unter rotem/violettem Gekritzel. Der „Rotfilter“ zeigt
 * nur noch den Rotkanal – Rotes und Rosa verschwindet, die dunkelviolette
 * Schrift bleibt dunkel stehen. (So funktionieren echte Decoder-Folien.)
 */
export function ColorFilterPuzzle(props: PuzzleProps<ColorFilterStepSource>) {
  const { step, session } = props;
  const message = forLevel(step.message, session.difficulty) ?? '';
  const canvas = useRef<HTMLCanvasElement>(null);
  const [filter, setFilter] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const rnd = seededRandom(`${step.id}:${message}`);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    const scribble = (color: string, count: number, width: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        let x = rnd() * W;
        let y = rnd() * H;
        ctx.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          x += (rnd() - 0.5) * 120;
          y += (rnd() - 0.5) * 120;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };
    // Tarnung: rosa-violette Linien, die der Schrift ähneln
    scribble('rgb(215,120,225)', 70, 9);
    // Die Nachricht in Dunkelviolett (wenig Rot → bleibt im Filter dunkel)
    ctx.fillStyle = 'rgb(105,60,190)';
    ctx.font = `bold ${Math.min(120, Math.floor((W * 1.5) / Math.max(4, message.length)))}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, W / 2, H / 2 + 6);
    // Darüber dichtes rotes Gekritzel
    scribble('rgb(235,60,60)', 160, 7);
    scribble('rgb(215,120,225)', 50, 5);

    if (filter) {
      const img = ctx.getImageData(0, 0, W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const v = r > 170 ? 255 : r * 0.6; // Kontrast etwas verstärken
        d[i] = v;
        d[i + 1] = v * 0.92;
        d[i + 2] = v * 0.92;
      }
      ctx.putImageData(img, 0, 0);
    }
  }, [message, filter, step.id]);

  return (
    <div class="puzzle">
      <section class="card colorfilter">
        <div class={`filter-frame ${filter ? 'filter-on' : ''}`}>
          <canvas ref={canvas} width={W} height={H} class="filter-canvas" aria-label={ui('scribbledNote')} role="img" />
        </div>
        <button class="btn btn-secondary" onClick={() => setFilter(!filter)} aria-pressed={filter}>
          {filter ? ui('filterOff') : `🟥 ${ui('filterOn')}`}
        </button>
      </section>
      <CodeAnswer {...props} />
    </div>
  );
}
