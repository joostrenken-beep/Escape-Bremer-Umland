/**
 * Angaben zum Betreiber für Impressum und Datenschutz.
 * BITTE AUSFÜLLEN, bevor die App öffentlich beworben wird
 * (Name und ladungsfähige Anschrift; bei geschäftlichem Angebot weitere Pflichtangaben).
 * Solange hier [PLATZHALTER] steht, zeigt die Seite einen Hinweis an.
 */
export const operator = {
  name: '[PLATZHALTER] Vor- und Nachname',
  street: '[PLATZHALTER] Straße und Hausnummer',
  city: '[PLATZHALTER] PLZ und Ort',
  email: '[PLATZHALTER] E-Mail-Adresse',
};

export const operatorComplete = !Object.values(operator).some((v) => v.includes('[PLATZHALTER]'));
