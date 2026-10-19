import { useState } from 'preact/hooks';
import { bearingDeg, compassName, distanceM, formatDistance, normalizeDeg, type LatLng } from '../geo/geo';
import { requestCompassPermission, useCompass, useGeolocation, useOnline } from '../geo/sensors';
import { ui } from '../i18n/ui';
import { RouteMap } from './RouteMap';

const NEAR_M = 30;

/**
 * Navigationshilfe zur nächsten Station: Richtungspfeil + Entfernung (GPS,
 * funktioniert auch offline) und optional eine Online-Karte.
 * GPS dient NUR der Orientierung – freigeschaltet wird die Station per Code.
 */
export function Navigator({ target, targetLabel, from }: { target: LatLng; targetLabel: string; from?: LatLng }) {
  const [active, setActive] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const geo = useGeolocation(active);
  const heading = useCompass(active);
  const online = useOnline();

  const start = async () => {
    await requestCompassPermission(); // muss im Tipp passieren (iPhone)
    setActive(true);
  };

  let body;
  if (!active) {
    body = (
      <button class="btn btn-secondary" onClick={start}>
        🧭 {ui('navStart')}
      </button>
    );
  } else if (geo.status === 'denied') {
    body = <p class="small">{ui('navDenied')}</p>;
  } else if (geo.status === 'unavailable') {
    body = <p class="small">{ui('navUnavailable')}</p>;
  } else if (!geo.pos) {
    body = <p class="small" role="status">{ui('navWaiting')}</p>;
  } else {
    const dist = distanceM(geo.pos, target);
    const bearing = bearingDeg(geo.pos, target);
    // Mit Kompass: Pfeil zeigt relativ zur Blickrichtung. Ohne: Pfeil relativ zu Norden.
    const rotation = heading === null ? bearing : normalizeDeg(bearing - heading);
    const near = dist <= NEAR_M;
    body = (
      <div class="nav-live" role="status" aria-live="polite">
        <div class="nav-arrow-wrap" aria-hidden="true">
          {heading === null && <span class="nav-north">N</span>}
          <span class="nav-arrow" style={{ transform: `rotate(${rotation}deg)` }}>
            ⬆
          </span>
        </div>
        <div>
          <p class="nav-distance">{near ? ui('navNear') : formatDistance(dist)}</p>
          <p class="small">
            {ui('navDirection', { dir: compassName(bearing) })}
            {heading === null ? ` · ${ui('navNoCompass')}` : ''}
            {geo.accuracyM && geo.accuracyM > 30 ? ` · ${ui('navInaccurate', { m: Math.round(geo.accuracyM) })}` : ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section class="card navigator" aria-label={ui('navigation')}>
      {body}
      {active && (
        <button class="btn btn-ghost btn-small" onClick={() => setActive(false)}>
          {ui('navStop')}
        </button>
      )}
      {online ? (
        showMap ? (
          <RouteMap
            points={[
              { ...target, label: targetLabel, kind: 'target' },
              ...(geo.pos ? [{ ...geo.pos, label: ui('navYou'), kind: 'me' as const }] : []),
            ]}
            route={from ? [from, target] : undefined}
          />
        ) : (
          <button class="btn btn-ghost btn-small" onClick={() => setShowMap(true)}>
            🗺 {ui('showMap')}
          </button>
        )
      ) : (
        <p class="small">{ui('mapOffline')}</p>
      )}
    </section>
  );
}
