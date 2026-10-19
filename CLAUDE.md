# CLAUDE.md – Ermittlerakte (Escape-Stadtführungen Bremer Umland)

Mobile Web-App (PWA): Outdoor-Krimi-Escape-Spiel, das gleichzeitig Stadtführung ist.
Jede Stadt = eigene Tour = eigenes Content-Paket. Start: Worpswede („Die Mondnacht vom Weyerberg“).
Nutzer (Projektinhaber) übt Vibecoding → Änderungen am Ende jedes Meilensteins in einfachen Worten erklären.

## Stand

| Meilenstein | Status |
|---|---|
| 1 Grundgerüst (Setup, PWA/Offline, Schema, Stadt- & Stufenwahl) | ✅ fertig |
| 2 Spielkern (Stationen, Codes, Hinweise, Notizbuch, Speichern, Punkte/Zeit, Testmodus) | ✅ fertig |
| 3 Worpswede-Content v1 + Entwickler-Ansicht | offen |
| 4 Digitale Rätsel (Mini-Games, Audio, Kamera, AR) | offen |
| 5 Finale, Urkunde, Design, Gerätetests | offen |
| 6 Backend-Vorbereitung, Freischaltmodul, Anleitung neue Stadt | offen |

## Entscheidungen (mit Nutzer abgestimmt)

- **Story:** Fiktiver Fall. Sammlung „Haus Lindenhof“, Bild „Mondnacht am Weyerberg“, Malerin Johanna Behrens
  und alle Verdächtigen (Konrad Albers, Greta Vogt, Ben Harms, Lotte Mewes) sind **erfunden**. Echte Personen
  (Modersohn-Becker, Vogeler, Modersohn, Mackensen, Hoetger) nur als Hintergrund, nie Täter. Echte Einrichtungen nie negativ.
  Auflösung (mittel/schwer): Greta hat das Bild versteckt, um es vor Albers' Fälschungstausch zu schützen.
  Leicht: kein Verbrechen – Lotte hat es für eine Geburtstagsüberraschung ausgeliehen.
- **Route (Entwurf, vor Ort prüfen):** Kaffee Worpswede → Große Kunstschau → Käseglocke → Kunsthalle → Zionskirche
  (Friedhof nur „Wusstest du?“, keine Spielaktion an Gräbern) → Weyerberg/Niedersachsenstein → Barkenhoff →
  Alter Bahnhof → Haus im Schluh → Finale Ortsmitte. Alle Rätsel **draußen, ohne Eintritt** lösbar.
- **Punkte:** Punktekonto – Start mit 100/Station (volles Konto), Hilfen ziehen sofort ab (Nutzerwunsch, damit man
  in Runde 1 nicht mit Punkten „bezahlt“, die man noch nicht hat); Hinweise −10/−20/−30; Auflösung −60; Überspringen −50; „Hier stimmt etwas nicht“ +
  Ersatzfrage gelöst = 0 Abzug; Finale-Bonus. Zeit wird nur angezeigt, kein Abzug.
- **Karte:** Online Leaflet/OSM. **Keine Offline-Karte** (Nutzerwunsch). Offline: Wegbeschreibung + GPS-Pfeil.
- **Audio:** vorerst Sprachausgabe des Geräts (speechSynthesis); Morse/Töne per WebAudio. Echte Aufnahmen später.
- **Bilder:** gemeinfreie Werke/Fotos (Wikimedia Commons), Lizenz je Bild prüfen und vermerken.
- **Repo ist öffentlich** → Klartext-Codes NIE committen (siehe unten).
- **Hosting:** GitHub Pages via Actions (`.github/workflows/deploy.yml`), URL
  `https://joostrenken-beep.github.io/Escape-Bremer-Umland/`. Push auf `main` = Deploy.

## Architektur

```
content/<stadt>/            Inhalte (nur JSON + Medien, kein Code)
  tour.json                 Metadaten, Story, Stufen, Reihenfolge der Stationen
  stations/<id>.json        je Station: Texte je Stufe, Rätsel-Schritte, Notizbuch, „Wusstest du?“
  media/                    Bilder, Audio
  codes.example.json        Platzhalter-Codes (im Repo)
  codes.json                echte Klartext-Codes (gitignored!)
schema/*.schema.json        JSON-Schema (Draft 2020-12), Prüfung beim Build mit Ajv
scripts/build-content.ts    content/ → public/tours/ (prüfen, Codes hashen, index.json)
src/
  content/types.ts          TS-Typen (Source = Autorendaten, Built = ausgeliefertes Paket) – synchron zum Schema halten!
  content/verification.ts   sammelt alle `verified: false` (für Entwickler-Ansicht)
  adapters/                 ContentAdapter + StorageAdapter (Interfaces); heute Static/LocalStorage, später ApiAdapter
  adapters/index.ts         EINZIGE Stelle, an der Adapter ausgewählt werden
  game/codes.ts             Normalisierung + SHA-256-Hash + verschleierte Auflösung (Browser & Node)
  game/session.ts           Spielstand (schemaVersion 2, migrateSession für alte Stände) + Speichern
  game/engine.ts            REINE Spiellogik: reduce(session, tour, action, now) → neue session (gut testbar)
  game/scoring.ts           Punkteregeln · game/useGame.ts: Engine + Speichern + Uhr für die UI
  game/knowledge.ts         „Wusstest du?“-Archiv je Tour (bleibt nach Spielende)
  puzzles/registry.tsx      type → Rätsel-Komponente; puzzles/CodePuzzle.tsx
  screens/play/StepShell    gemeinsamer Rahmen je Rätsel: Hinweise, Auflösung, „Hier stimmt etwas nicht“, Testmodus
  screens/play/phases.tsx   Bildschirme je Phase: intro → travel → solve → debrief → … → finished
  settings.ts               Geräte-Einstellungen (testMode) als Preact-Context
  i18n/ui.ts                UI-Texte (de; en ergänzbar), i18n/text.ts: localize()/leveled()
  router.ts                 Hash-Router (#/, #/tour/<id>, #/play, #/notebook[/<id>], #/settings)
  screens/, components/     Preact-Komponenten
tests/                      Vitest (Codes, Content-Validierung, Storage, Engine/Punkte/Spielstand)
```

### Wichtige Konzepte
- **LocalizedText** `{de, en?}`; **LeveledText** `{all?, easy?, medium?, hard?}` – Stufe fällt auf `all` zurück.
  Build prüft, dass jede Stufe einen Text bekommt.
- **Rätsel-Schritte** (`steps[]`) mit `type` → Plugin-Komponente. Bisher nur `code`.
  Neuer Typ = Schema (`station.schema.json` → `$defs/Step`), Typ in `types.ts`, Komponente + Registry (ab M2).
- **Codes:** Station referenziert `codeId`; Klartext in codes.json; Build schreibt nur
  `sha256(salt:codeId:normalize(answer))` + AES-GCM-verschleierten Auflösungstext. Reihenfolge der Code-Quelle:
  Env `TOUR_CODES` (GitHub-Secret, JSON `{ "<stadt>": {codes…} }`) → `codes.json` → `codes.example.json` (Warnung).
- **verified:** jede ortsbezogene Angabe (Koordinaten, Code-Schritte, „Wusstest du?“) hat `verified: false`,
  bis der Nutzer sie vor Ort bestätigt. Nie Fakten als gesichert erfinden – `[PLATZHALTER]` nutzen.
- **Offline:** App-Hülle wird per Workbox vorab gecacht. Stadtpakete (`tours/**`) NICHT – „Für offline speichern“
  lädt alle `files` des Pakets in Cache `tour-content` (gleicher Name wie runtimeCaching in vite.config.ts).
- Story-Texte ≤ 80 Wörter (Build warnt).
- **Spielablauf:** Phasen intro → travel („Wir sind da“) → solve (Story + Schritte nacheinander) → debrief
  (Notizbuch-Einträge, „Wusstest du?“) → nächste Station … → finished. Jede Aktion → engine.reduce → sofort gespeichert.
- **Zeit:** `timer.elapsedMs` + `runningSince` (null = Pause). Jede Spielaktion beendet eine Pause; nach Ende steht die Uhr.
- **Notizbuch** speichert nur Verweise (stationId/entryId) + gelöste Codes, Texte kommen aus der Tour.
- **Testmodus** (⚙️ Einstellungen): unveröffentlichte Touren, „Test: Schritt lösen“, Sprung zu Station; setzt `usedTestMode`.
- Ersatzfrage (fallback) hat keine eigenen Hinweise – nur Auflösung.

## Konventionen
- Sprache im UI und in Kommentaren: Deutsch. Code-Bezeichner: Englisch.
- Preact + Hooks, keine weitere UI-Bibliothek. CSS in `src/styles.css` mit Variablen (Moor/Birke/Himmel/Aktenrot).
- Mobile first, Buttons ≥ 52 px, Hauptaktion unten in `.action-bar`, hoher Kontrast.
- Kamera/GPS/Sensoren nur nach Nutzer-Tap aktivieren, immer Fallback ohne.
- Imports, die vom Build-Skript (Node) erreicht werden, mit `.ts`-Endung.

## Befehle
- `npm run dev` – Dev-Server (baut Content automatisch, lädt bei Änderungen neu)
- `npm test` – Tests · `npm run typecheck` · `npm run content` – nur Content prüfen/bauen
- `npm run build` / `npm run preview` · `npm run icons` – Icons aus `public/icon.svg` erzeugen
