import { describe, expect, it } from 'vitest';
import { buildContent } from '../scripts/build-content';
import { codesForSecret, fieldReport } from '../src/screens/FieldCheck';

describe('Vor-Ort-Erfassung', () => {
  it('erzeugt Secret-JSON nur mit ausgefüllten Codes – und der Build übernimmt es', async () => {
    const secret = codesForSecret('worpswede', { stations: {}, codes: { 's01-unlock': ' 7, sieben ', 's02-unlock': '  ' } });
    expect(secret).toEqual({
      worpswede: { codes: { 's01-unlock': { answers: ['7', 'sieben'], reveal: { de: 'Die richtige Antwort lautet „7“.' } } } },
    });
    // Secret enthält nur einen Code – die übrigen kommen weiter aus codes.example.json
    const { tours, errors } = await buildContent({ dryRun: true, codesOverride: secret });
    expect(errors).toEqual([]);
    const tour = tours.find((t) => t.id === 'worpswede')!;
    expect(tour.codesSource).toBe('secret');
    expect(tour.placeholderCodes).not.toContain('s01-unlock');
    expect(tour.placeholderCodes).toContain('s02-unlock');
    expect(tour.codes['s10-lock']).toBeDefined(); // Denk-Rätsel weiterhin vorhanden
  });

  it('Prüfbericht nennt Koordinaten, Häkchen und Notizen', async () => {
    const { tours } = await buildContent({ dryRun: true });
    const tour = tours.find((t) => t.id === 'worpswede')!;
    const text = fieldReport(tour, {
      stations: { '01-kaffee-worpswede': { coords: { lat: 53.22031, lng: 8.93112, acc: 6 }, checked: true, note: 'Tür ist rot' } },
      codes: { 's01-unlock': '7' },
    });
    expect(text).toContain('53.220310, 8.931120');
    expect(text).toContain('Texte & Weg geprüft: ja');
    expect(text).toContain('Notiz: Tür ist rot');
    expect(text).toContain('Codes eingetragen: s01-unlock');
  });
});
