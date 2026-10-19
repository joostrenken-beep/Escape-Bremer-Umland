import { useEffect, useRef, useState } from 'preact/hooks';
import type { CompassStepSource } from '../content/types';
import { forLevel } from '../game/codes';
import { compassName, normalizeDeg } from '../geo/geo';
import { requestCompassPermission, useCompass } from '../geo/sensors';
import { leveled } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import { useCamera } from './camera';
import type { PuzzleProps } from './types';

const HOLD_MS = 1500;
const DIRS = [0, 45, 90, 135, 180, 225, 270, 315];

/** Kleinster Winkel zwischen zwei Richtungen (−180 … +180). */
export const angleDiff = (a: number, b: number) => ((normalizeDeg(a - b) + 540) % 360) - 180;

/**
 * Handy in eine Himmelsrichtung halten. Mit AR erscheint der Hinweis über dem
 * Kamerabild, sobald die Richtung stimmt. Ohne Kompass: Richtung per Knopf wählen.
 */
export function CompassPuzzle({ step, session, dispatch }: PuzzleProps<CompassStepSource>) {
  const [mode, setMode] = useState<'start' | 'sensor' | 'manual'>('start');
  const [useAr, setUseAr] = useState(false);
  const [found, setFound] = useState(false);
  const [wrongDir, setWrongDir] = useState(false);
  const heading = useCompass(mode === 'sensor' && !found);
  const { video, status: camStatus } = useCamera(mode === 'sensor' && useAr && !found);
  const holdStart = useRef<number | null>(null);
  const [holdPct, setHoldPct] = useState(0);
  const lang = getLang();
  const tol = forLevel(step.tolerance, session.difficulty) ?? 20;

  // Kein Kompass-Signal nach 4 s? → manuelle Variante anbieten
  const [noSignal, setNoSignal] = useState(false);
  useEffect(() => {
    if (mode !== 'sensor' || heading !== null) return setNoSignal(false);
    const t = setTimeout(() => setNoSignal(true), 4000);
    return () => clearTimeout(t);
  }, [mode, heading]);

  const diff = heading === null ? null : angleDiff(step.bearing, heading);
  const onTarget = diff !== null && Math.abs(diff) <= tol;

  useEffect(() => {
    if (found || mode !== 'sensor') return;
    if (!onTarget) {
      holdStart.current = null;
      setHoldPct(0);
      return;
    }
    holdStart.current ??= Date.now();
    const pct = Math.min(100, ((Date.now() - holdStart.current) / HOLD_MS) * 100);
    setHoldPct(pct);
    if (pct >= 100) setFound(true);
  }, [heading, onTarget]);

  const start = async (ar: boolean) => {
    const ok = await requestCompassPermission(); // muss im Tipp passieren (iPhone)
    setUseAr(ar);
    setMode(ok ? 'sensor' : 'manual');
  };

  const reveal = leveled(step.revealText, session.difficulty, lang);

  if (found) {
    return (
      <div class="puzzle">
        <section class="card compass-found" role="status">
          <p class="stamp">🧭 {ui('compassFound')}</p>
          <p class="lead">{reveal}</p>
          <button class="btn" onClick={() => dispatch({ type: 'solve', answer: '' })}>
            {ui('continue')}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div class="puzzle">
      <p class="prompt">{leveled(step.prompt, session.difficulty, lang)}</p>

      {mode === 'start' && (
        <div class="step-help">
          {step.ar && (
            <button class="btn btn-secondary" onClick={() => start(true)}>
              📷 {ui('compassStartAr')}
            </button>
          )}
          <button class="btn btn-secondary" onClick={() => start(false)}>
            🧭 {ui('compassStart')}
          </button>
          <button class="btn btn-ghost btn-small" onClick={() => setMode('manual')}>
            {ui('compassManual')}
          </button>
        </div>
      )}

      {mode === 'sensor' && (
        <section class="card compass-live">
          <div class={`ar-frame ${useAr ? 'with-cam' : ''}`}>
            {useAr && <video ref={video} class="cam-video" playsInline muted autoPlay />}
            {diff !== null && (
              <div
                class={`ar-marker ${onTarget ? 'on-target' : ''}`}
                style={{ transform: `translateX(${Math.max(-140, Math.min(140, diff * 3))}px)` }}
                aria-hidden="true"
              >
                {onTarget ? '✦' : diff > 0 ? '➡' : '⬅'}
              </div>
            )}
            <div class="hold-bar" style={{ width: `${holdPct}%` }} />
          </div>
          <p class="small" role="status" aria-live="polite">
            {heading === null
              ? ui('compassWaiting')
              : onTarget
                ? ui('compassHold')
                : ui('compassTurn', { dir: diff! > 0 ? ui('right') : ui('left'), now: compassName(heading) })}
          </p>
          {useAr && (camStatus === 'denied' || camStatus === 'unavailable') && <p class="small">{ui('cameraFallback')}</p>}
          {useAr && <p class="small privacy">🔒 {ui('cameraPrivacy')}</p>}
          {noSignal && (
            <button class="btn btn-ghost btn-small" onClick={() => setMode('manual')}>
              {ui('compassManual')}
            </button>
          )}
        </section>
      )}

      {mode === 'manual' && (
        <section class="card">
          <p>{ui('compassManualText')}</p>
          <div class="dir-grid" role="group" aria-label={ui('compassManual')}>
            {DIRS.map((d) => (
              <button
                key={d}
                class="btn btn-secondary btn-small"
                onClick={() => {
                  if (Math.abs(angleDiff(step.bearing, d)) <= 22.5) setFound(true);
                  else {
                    setWrongDir(true);
                    dispatch({ type: 'wrong' });
                  }
                }}
              >
                {compassName(d)}
              </button>
            ))}
          </div>
          <p class="feedback" role="status" aria-live="polite">
            {wrongDir ? ui('wrongAnswer') : ''}
          </p>
        </section>
      )}
    </div>
  );
}
