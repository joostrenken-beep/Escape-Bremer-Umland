import { useEffect, useState } from 'preact/hooks';

/**
 * Winziger Hash-Router: #/ , #/tour/worpswede , #/play
 * Hash-Routen funktionieren auf GitHub Pages ohne Server-Konfiguration.
 */
export function parseHash(hash: string): string[] {
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

export function useRoute(): string[] {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', onChange);
    return () => removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(...parts: string[]) {
  location.hash = '#/' + parts.map(encodeURIComponent).join('/');
}
