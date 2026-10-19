import { useEffect, useRef, useState } from 'preact/hooks';
import type { MorseStepSource } from '../content/types';
import { forLevel } from '../game/codes';
import { ui } from '../i18n/ui';
import { CodeAnswer } from './CodeAnswer';
import { MORSE, morseSchedule } from './morse';
import type { PuzzleProps } from './types';

/** Morse-Nachricht als Töne + Blinklicht (für alle, die nichts hören). */
export function MorsePuzzle(props: PuzzleProps<MorseStepSource>) {
  const { step, session, progress } = props;
  const message = forLevel(step.message, session.difficulty) ?? '';
  const unitMs = session.difficulty === 'easy' ? 220 : session.difficulty === 'medium' ? 160 : 110;
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(false);
  const tableAllowed = (forLevel(step.showTable, session.difficulty) ?? false) || progress.hintsUsed >= 1;
  const [showTable, setShowTable] = useState(false);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => () => stopRef.current(), []);

  const play = () => {
    stopRef.current();
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = AC ? new AC() : null;
    const osc = ctx?.createOscillator();
    const gain = ctx?.createGain();
    if (ctx && osc && gain) {
      osc.frequency.value = 620;
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
    }
    const timers: number[] = [];
    let t = 300;
    const t0 = ctx ? ctx.currentTime + 0.3 : 0;
    for (const { on, off } of morseSchedule(message)) {
      const start = t;
      const end = t + on * unitMs;
      timers.push(window.setTimeout(() => setLit(true), start), window.setTimeout(() => setLit(false), end));
      if (ctx && gain) {
        // sanfte Flanken, damit es nicht knackt
        const s = t0 + (start - 300) / 1000;
        const e = t0 + (end - 300) / 1000;
        gain.gain.setTargetAtTime(0.25, s, 0.005);
        gain.gain.setTargetAtTime(0, e, 0.005);
      }
      t = end + off * unitMs;
    }
    timers.push(window.setTimeout(() => stop(), t + 200));
    setPlaying(true);
    function stop() {
      timers.forEach(clearTimeout);
      try {
        osc?.stop();
        ctx?.close();
      } catch {
        /* schon gestoppt */
      }
      setLit(false);
      setPlaying(false);
    }
    stopRef.current = stop;
  };

  return (
    <div class="puzzle">
      <section class="card morse">
        <div class={`morse-lamp ${lit ? 'on' : ''}`} aria-hidden="true" />
        <button class="btn btn-secondary" onClick={() => (playing ? stopRef.current() : play())}>
          {playing ? `⏹ ${ui('stop')}` : `▶ ${ui('playMorse')}`}
        </button>
        <p class="small">{ui('morseHelp')}</p>
        {tableAllowed && (
          <button class="btn btn-ghost btn-small" onClick={() => setShowTable(!showTable)} aria-expanded={showTable}>
            {showTable ? ui('hideMorseTable') : ui('showMorseTable')}
          </button>
        )}
        {tableAllowed && showTable && (
          <dl class="morse-table">
            {Object.entries(MORSE).map(([ch, code]) => (
              <div key={ch}>
                <dt>{ch}</dt>
                <dd>{code.replace(/\./g, '•').replace(/-/g, '–')}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
      <CodeAnswer {...props} />
    </div>
  );
}
