/**
 * Sammelt alle ortsbezogenen Angaben, die noch nicht vor Ort bestätigt sind
 * (alle Objekte mit `"verified": false`). Grundlage für die Entwickler-Ansicht.
 */

export interface UnverifiedItem {
  /** Wo im Content, z. B. "stations[2].steps[0]" */
  path: string;
  note?: string;
  value: Record<string, unknown>;
}

export function collectUnverified(node: unknown, path = ''): UnverifiedItem[] {
  const out: UnverifiedItem[] = [];
  if (Array.isArray(node)) {
    node.forEach((child, i) => out.push(...collectUnverified(child, `${path}[${i}]`)));
  } else if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if (obj.verified === false) {
      const note = typeof obj.verifyNote === 'string' ? obj.verifyNote : typeof obj.note === 'string' ? obj.note : undefined;
      out.push({ path: path || '(root)', note, value: obj });
    }
    for (const [key, child] of Object.entries(obj)) {
      out.push(...collectUnverified(child, path ? `${path}.${key}` : key));
    }
  }
  return out;
}

export interface PlaceholderItem {
  path: string;
  text: string;
}

/** Sammelt alle Texte, die noch „[PLATZHALTER]“ enthalten. */
export function collectPlaceholders(node: unknown, path = ''): PlaceholderItem[] {
  if (typeof node === 'string') return node.includes('[PLATZHALTER]') ? [{ path: path || '(root)', text: node }] : [];
  if (Array.isArray(node)) return node.flatMap((c, i) => collectPlaceholders(c, `${path}[${i}]`));
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => collectPlaceholders(v, path ? `${path}.${k}` : k));
  }
  return [];
}
