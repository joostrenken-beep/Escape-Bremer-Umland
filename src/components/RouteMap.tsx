import { useEffect, useRef } from 'preact/hooks';
import type { LatLng } from '../geo/geo';

export interface MapPoint extends LatLng {
  label: string;
  kind: 'target' | 'done' | 'todo' | 'me';
}

const COLORS: Record<MapPoint['kind'], string> = {
  target: '#9e2b25',
  done: '#3f5f31',
  todo: '#6d5b4a',
  me: '#24527d',
};

/**
 * Online-Karte (OpenStreetMap über Leaflet). Leaflet wird erst beim ersten
 * Anzeigen nachgeladen. Ohne Internet gibt es keine Kartenkacheln –
 * daher zeigt der Aufrufer die Karte nur online an.
 */
export function RouteMap({ points, route, height = 280 }: { points: MapPoint[]; route?: LatLng[]; height?: number }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<import('leaflet').Map | null>(null);
  const layer = useRef<import('leaflet').LayerGroup | null>(null);
  const L = useRef<typeof import('leaflet') | null>(null);

  // Karte einmalig anlegen
  useEffect(() => {
    let cancelled = false;
    Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(([mod]) => {
      if (cancelled || !el.current) return;
      L.current = mod;
      map.current = mod.map(el.current, { zoomControl: true, attributionControl: true });
      mod
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(map.current);
      layer.current = mod.layerGroup().addTo(map.current);
      draw();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => draw(), [points, route]);

  function draw() {
    const mod = L.current;
    if (!mod || !map.current || !layer.current) return;
    layer.current.clearLayers();
    if (route && route.length > 1) {
      mod.polyline(route.map((p) => [p.lat, p.lng] as [number, number]), { color: '#3b2a1e', weight: 3, dashArray: '6 8' }).addTo(layer.current);
    }
    for (const p of points) {
      mod
        .circleMarker([p.lat, p.lng], {
          radius: p.kind === 'target' || p.kind === 'me' ? 10 : 7,
          color: '#fff',
          weight: 2,
          fillColor: COLORS[p.kind],
          fillOpacity: 1,
        })
        .bindTooltip(p.label)
        .addTo(layer.current);
    }
    const all = [...points, ...(route ?? [])];
    if (all.length === 1) map.current.setView([all[0].lat, all[0].lng], 17);
    else if (all.length > 1) map.current.fitBounds(all.map((p) => [p.lat, p.lng] as [number, number]), { padding: [30, 30], maxZoom: 17 });
  }

  return <div ref={el} class="route-map" style={{ height: `${height}px` }} role="img" aria-label="Karte mit Route" />;
}
