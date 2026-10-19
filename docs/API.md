# Server-Schnittstelle (für ein späteres Backend)

Die App funktioniert heute komplett ohne Server. Wird beim Build `VITE_API_URL` gesetzt
(z. B. `VITE_API_URL=https://api.example.de npm run build`), benutzt sie stattdessen diese Endpunkte.
Umsetzung in der App: `src/adapters/api.ts`, Auswahl in `src/adapters/index.ts`.

Alle Antworten sind JSON. Die Typen stehen in `src/content/types.ts` und `src/adapters/types.ts`.

| Methode | Pfad | Antwort | Zweck |
|---|---|---|---|
| GET | `/tours` | `TourSummary[]` | Stadtauswahl |
| GET | `/tours/{id}` | `BuiltTour` | Tour-Paket (Codes nur als Hashes!) |
| GET | `/tours/{id}/{datei}` | Datei | Medien und `tour.json` für den Offline-Download |
| POST | `/scores` | – | Body: `GameResult` – Ergebnis eintragen |
| GET | `/scores?tour={id}` | `GameResult[]` | Bestenliste einer Tour |
| POST | `/access/verify` | `{ "valid": boolean }` | Body: `{ "tourId", "code" }` – Freischaltcode prüfen |

Verhalten der App:
- **Bestenliste:** Ergebnisse werden immer zuerst lokal gespeichert; ist der Server nicht erreichbar (Funkloch),
  zeigt die App die lokale Liste.
- **Freischaltung:** Der Server entscheidet. Nach Erfolg merkt sich das Gerät die Freischaltung
  (`unlocked:<tourId>`), damit die Tour danach auch offline spielbar bleibt.
- **Touren:** Der Server kann dieselben Pakete ausliefern, die `scripts/build-content.ts` heute nach
  `public/tours/` schreibt. Ein Admin-Bereich für neue Städte könnte genau diese Dateien erzeugen.

Ideen für später: Freischaltcodes mit Ablaufdatum oder begrenzter Nutzung, Team-Bestenliste pro Tag,
Admin-Oberfläche zum Bearbeiten von Stationen (schreibt die JSON-Dateien aus `content/`).
