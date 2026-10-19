/**
 * GPS und Kompass – werden NUR aktiv, solange `active` true ist (Akku sparen),
 * und erst nach einem Tipp des Nutzers eingeschaltet (iPhone-Pflicht).
 */
import { useEffect, useState } from 'preact/hooks';
import { normalizeDeg, type LatLng } from './geo';

export interface GeoState {
  status: 'off' | 'waiting' | 'ok' | 'denied' | 'unavailable';
  pos?: LatLng;
  accuracyM?: number;
}

export function useGeolocation(active: boolean): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'off' });
  useEffect(() => {
    if (!active) return setState({ status: 'off' });
    if (!('geolocation' in navigator)) return setState({ status: 'unavailable' });
    setState((s) => ({ ...s, status: s.pos ? 'ok' : 'waiting' }));
    const id = navigator.geolocation.watchPosition(
      (p) => setState({ status: 'ok', pos: { lat: p.coords.latitude, lng: p.coords.longitude }, accuracyM: p.coords.accuracy }),
      (err) => setState((s) => ({ ...s, status: err.code === err.PERMISSION_DENIED ? 'denied' : s.pos ? 'ok' : 'unavailable' })),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [active]);
  return state;
}

type IosOrientationEvent = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

/**
 * Fragt (auf dem iPhone) die Erlaubnis für Bewegungssensoren an.
 * MUSS direkt in einem Tipp-Handler aufgerufen werden.
 */
export async function requestCompassPermission(): Promise<boolean> {
  const DOE = (globalThis as { DeviceOrientationEvent?: IosOrientationEvent }).DeviceOrientationEvent;
  if (!DOE) return false;
  if (typeof DOE.requestPermission === 'function') {
    try {
      return (await DOE.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }
  return true; // Android & Co. brauchen keine Nachfrage
}

/** Blickrichtung des Handys in Grad (0 = Norden) oder null, wenn kein Kompass verfügbar ist. */
export function useCompass(active: boolean): number | null {
  const [heading, setHeading] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return setHeading(null);
    const onOrient = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      if (typeof e.webkitCompassHeading === 'number') setHeading(e.webkitCompassHeading); // iOS
      else if (e.absolute && typeof e.alpha === 'number') setHeading(normalizeDeg(360 - e.alpha)); // Android
    };
    const absEvent = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    addEventListener(absEvent, onOrient as EventListener);
    return () => removeEventListener(absEvent, onOrient as EventListener);
  }, [active]);
  return heading;
}

/** Ist das Gerät online? (aktualisiert sich bei Wechsel) */
export function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    addEventListener('online', up);
    addEventListener('offline', down);
    return () => {
      removeEventListener('online', up);
      removeEventListener('offline', down);
    };
  }, []);
  return online;
}
