import { useState } from 'preact/hooks';
import type { OverlayStepSource } from '../content/types';
import { mediaUrl } from '../content/media';
import { localize } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import { useCamera } from './camera';
import { CodeAnswer } from './CodeAnswer';
import type { PuzzleProps } from './types';

/** Historisches Foto über das heutige Kamerabild legen und vergleichen. */
export function OverlayPuzzle(props: PuzzleProps<OverlayStepSource>) {
  const { step, tour } = props;
  const [cameraOn, setCameraOn] = useState(false);
  const [opacity, setOpacity] = useState(50);
  const { video, status } = useCamera(cameraOn);
  const lang = getLang();
  const src = mediaUrl(tour.id, step.image);
  const live = cameraOn && status === 'on';

  return (
    <div class="puzzle">
      <section class="card overlay-cam">
        <div class="cam-frame">
          {cameraOn && <video ref={video} class="cam-video" playsInline muted autoPlay />}
          <img
            src={src}
            alt={ui('historicPhoto')}
            class={`cam-overlay ${live ? 'over-live' : ''}`}
            style={live ? { opacity: String(opacity / 100) } : undefined}
          />
        </div>
        {live && (
          <label class="range-label">
            <span>{ui('overlayToday')}</span>
            <input type="range" min={0} max={100} value={opacity} onInput={(e) => setOpacity(Number((e.target as HTMLInputElement).value))} aria-label={ui('overlayMix')} />
            <span>{ui('overlayPast')}</span>
          </label>
        )}
        <p class="small credit">{localize(step.credit, lang)}</p>
        {!cameraOn ? (
          <button class="btn btn-secondary" onClick={() => setCameraOn(true)}>
            📷 {ui('cameraCompare')}
          </button>
        ) : (
          <button class="btn btn-ghost btn-small" onClick={() => setCameraOn(false)}>
            {ui('cameraOff')}
          </button>
        )}
        {(status === 'denied' || status === 'unavailable') && <p class="small">{ui('cameraFallback')}</p>}
        <p class="small privacy">🔒 {ui('cameraPrivacy')}</p>
      </section>
      <CodeAnswer {...props} />
    </div>
  );
}
