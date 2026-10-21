# CLAUDE.md – Ermittlerakte (Escape-Stadtführungen Bremer Umland)

Mobile Web-App (PWA): Outdoor-Krimi-Escape-Spiel, das gleichzeitig Stadtführung ist.
Jede Stadt = eigene Tour = eigenes Content-Paket. Touren: Worpswede („Die Mondnacht vom Weyerberg“),
Bremen-Findorff („Die Glocke der Moorlilie“).
Nutzer (Projektinhaber) übt Vibecoding → Änderungen am Ende jedes Meilensteins in einfachen Worten erklären.

## Stand

| Meilenstein | Status |
|---|---|
| 1 Grundgerüst (Setup, PWA/Offline, Schema, Stadt- & Stufenwahl) | ✅ fertig |
| 2 Spielkern (Stationen, Codes, Hinweise, Notizbuch, Speichern, Punkte/Zeit, Testmodus) | ✅ fertig |
| 3 Worpswede-Content v1 + Entwickler-Ansicht + Navigation | ✅ fertig |
| 4 Digitale Rätsel (Mini-Games, Audio, Kamera, AR) | ✅ fertig |
| 5 Finale, Urkunde, Design, Gerätetests | ✅ fertig (echte Gerätetests: docs/GERAETETEST.md) |
| 6 Backend-Vorbereitung, Freischaltmodul, Anleitung neue Stadt | ✅ fertig |

## Entscheidungen (mit Nutzer abgestimmt)

- **Story:** Fiktiver Fall. Sammlung „Haus Lindenhof“, Bild „Mondnacht am Weyerberg“, Malerin Johanna Behrens
  und alle Verdächtigen (Konrad Albers, Greta Vogt, Ben Harms, Lotte Mewes) sind **erfunden**. Echte Personen
  (Modersohn-Becker, Vogeler, Modersohn, Mackensen, Hoetger) nur als Hintergrund, nie Täter. Echte Einrichtungen nie negativ.
  Auflösung (mittel/schwer): Greta hat das Bild versteckt, um es vor Albers' Fälschungstausch zu schützen.
  Leicht: kein Verbrechen – Lotte hat es für eine Geburtstagsüberraschung ausgeliehen.
- **Route Worpswede (Koordinaten aus Online-Quellen, vor Ort bestätigen):** 1 Kaffee Worpswede → 2 Große Kunstschau →
  3 Käseglocke → 4 Kunsthalle → 5 Zionskirche (Friedhof nur „Wusstest du?“, keine Spielaktion an Gräbern) →
  6 Niedersachsenstein → 7 Barkenhoff → 8 Haus im Schluh → 9 Alter Bahnhof → 10 Finale Lindenallee.
  Rundweg ca. 6 km zu Fuß (Bahnhof liegt ~1,2 km außerhalb). Kaffee Worpswede evtl. seit 2019 geschlossen – Story
  setzt kein geöffnetes Café voraus. Alle Rätsel **draußen, ohne Eintritt**, keine privaten Grundstücke betreten.
- **Rätsel-Kette Worpswede:** Station 3 Logikrätsel (Albers + Greta im Haus, Albers lügt), Station 4 Caesar (mittel +3,
  schwer +5 „Paula“, leicht rückwärts) → „neun“. Notizbuch-Fragmente A=1 (St. 3 Käseglocke), B=9 (St. 4 Kunsthalle), C=0 (Alter Bahnhof), D=2 (Barkenhoff)
  → Finale-Zahlenschloss **1902** (= Entstehungsjahr der Mondnacht; schwer: Reihenfolge aus Fallakte ableiten).
  Digitale Rätsel (M4): St. 2 Rotfilter (KOPIE/leicht TORTE), St. 5 Zeugenaussage Audio (grüner Schal/leicht Dackel
  Bruno), St. 6 Kompass+AR (225° SW), St. 7 Schiebepuzzle (media/mondnacht.svg – eigene Illustration, Bild ist fiktiv),
  St. 8 Morse (NULL), St. 10 Zahlenschloss 1902 + Anklage (wer/warum/wer2; Finale-Bonus).
  Foto-Vergleich (overlay) am Barkenhoff wieder entfernt, bis ein gemeinfreies Foto da ist (Beispiel in docs/RAETSELTYPEN.md).
- **Findorff („Die Glocke der Moorlilie“, content/findorff):** Messingglocke (1924) des erfundenen Torfkahns
  „Moorlilie“ verschwindet vor dem Hafenfest. Erfunden: Boot, Verdächtige (Henning Brakhage – Antiquitätenhändler,
  TÄTER mittel/schwer, Verkauf an Sammler in Hamburg; Svea Lindemann – Bootsbauerin, leicht: hat Glocke zum Polieren
  mitgenommen; Dr. Ole Kück – Heimatforscher; Mira Tietjen – Blumenhändlerin, Zeugin). Route (Koordinaten aus
  Online-Quellen, ca. 4,5 km zu Fuß):
  1 Torfhafen → 2 Torfkanal (Audio: blauer Lieferwagen / leicht gelbes Putztuch) → 3 Lok „Jan Reiners“ (Morse EINS, A=1)
  → 4 Jan-Reiners-Weg (Logik, eindeutig Brakhage / leicht Svea; B=9) → 5 Findorffmarkt/Marktbunker-Wandbild
  (Rotfilter HAMBURG / leicht GLANZ) → 6 Hemmstraße (Caesar +3, schwer +4 „TORF“, leicht rückwärts; C=2)
  → 7 Findorfftunnel → 8 Bürgerweide (Kompass 315° NW; D=4) → 9 Bürgerpark-Rand (Schiebepuzzle media/moorlilie.svg)
  → 10 Finale Torfhafen (Schloss 1924 + Anklage brakhage/verkaufen/mira, leicht svea/polieren/mira).
  Brakhages Laden und Lager sind erfunden – keine Orts-Codes an echten Geschäften!
- **Finale-Bonus:** Anklage (accuse) +100 beim ersten Versuch ohne Hinweis, +50 selbst gelöst, sonst 0.
- **Punkte:** Punktekonto – Start mit 100/Station (volles Konto), Hilfen ziehen sofort ab (Nutzerwunsch, damit man
  in Runde 1 nicht mit Punkten „bezahlt“, die man noch nicht hat); Hinweise −10/−20/−30; Auflösung −60; Überspringen −50; „Hier stimmt etwas nicht“ +
  Ersatzfrage gelöst = 0 Abzug; Finale-Bonus. Zeit wird nur angezeigt, kein Abzug.
- **Koordinaten** immer aus Quellen recherchieren (WebSearch: Wikipedia/Wikidata/Denkmallisten), nie schätzen –
  OSM/Wikipedia direkt sind in der Cloud-Umgebung gesperrt, die Websuche funktioniert.
- **Karte:** Online Leaflet/OSM. **Keine Offline-Karte** (Nutzerwunsch). Offline: Wegbeschreibung + GPS-Pfeil.
- **Audio:** vorerst Sprachausgabe des Geräts (speechSynthesis); Morse/Töne per WebAudio. Echte Aufnahmen später.
- **Bilder:** gemeinfreie Werke/Fotos (Wikimedia Commons), Lizenz je Bild prüfen und vermerken.
- **Repo ist öffentlich** → Klartext der ORTS-Codes NIE committen. Lösungen der reinen Denk-Rätsel (Logik, Chiffre,
  Zahlenschloss) stehen in codes.example.json – sie folgen ohnehin aus dem Rätseltext; ausgeliefert werden nur Hashes.
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
scripts/build-content.ts    content/ → public/tours/ (prüfen, Codes + Freischaltcodes hashen, index.json)
scripts/new-city.ts         npm run new-city -- <id> "<Name>" → kopiert templates/neue-stadt/ nach content/<id>
templates/neue-stadt/       Vorlage einer gültigen Mini-Tour (unveröffentlicht, Platzhalter)
docs/                       API.md (Server-Vertrag), GERAETETEST.md (Checkliste echte Geräte)
src/
  content/types.ts          TS-Typen (Source = Autorendaten, Built = ausgeliefertes Paket) – synchron zum Schema halten!
  content/verification.ts   sammelt alle `verified: false` (für Entwickler-Ansicht)
  adapters/types.ts         Interfaces: ContentAdapter, StorageAdapter, ScoreAdapter, AccessAdapter
  adapters/Local*, Static*  heutige Umsetzung (statische Dateien, localStorage, Bestenliste + Freischaltung lokal)
  adapters/api.ts           Api*-Adapter für späteres Backend (Vertrag: docs/API.md)
  adapters/index.ts         EINZIGE Stelle, an der Adapter ausgewählt werden (VITE_API_URL gesetzt → Api*)
  game/codes.ts             Normalisierung + SHA-256-Hash + verschleierte Auflösung (Browser & Node)
  game/session.ts           Spielstand (schemaVersion 2, migrateSession für alte Stände) + Speichern
  game/engine.ts            REINE Spiellogik: reduce(session, tour, action, now) → neue session (gut testbar)
  game/scoring.ts           Punkteregeln · game/useGame.ts: Engine + Speichern + Uhr für die UI
  geo/geo.ts, geo/sensors.ts Entfernung/Richtung (getestet) · GPS/Kompass-Hooks (nur aktiv nach Tipp)
  components/Navigator.tsx  Richtungspfeil + Entfernung (offline) + Online-Karte (components/RouteMap.tsx, Leaflet lazy)
  screens/DevView.tsx       #/dev/<tour>: Prüfliste (verified:false + [PLATZHALTER]), Codes-Quelle, Route, Mein Standort
  game/certificate.ts       Ermittlerurkunde als PNG (Canvas, lokal) + Teilen (Web Share API / Download)
  game/knowledge.ts         „Wusstest du?“-Archiv je Tour (bleibt nach Spielende)
  puzzles/registry.tsx      type → Rätsel-Komponente; puzzles/CodePuzzle.tsx
  screens/play/StepShell    gemeinsamer Rahmen je Rätsel: Hinweise, Auflösung, „Hier stimmt etwas nicht“, Testmodus
  screens/play/phases.tsx   Bildschirme je Phase: intro → travel → solve → debrief → … → finished
  settings.ts               Geräte-Einstellungen (testMode) als Preact-Context
  i18n/ui.ts                UI-Texte (de; en ergänzbar), i18n/text.ts: localize()/leveled()
  router.ts                 Hash-Router (#/, #/tour/<id>, #/play, #/notebook[/<id>], #/settings)
  screens/, components/     Preact-Komponenten
tests/                      Vitest; tests/fixtures/content/testtour = feste 2-Stationen-Tour für Engine-Tests
```

### Wichtige Konzepte
- **LocalizedText** `{de, en?}`; **LeveledText** `{all?, easy?, medium?, hard?}` – Stufe fällt auf `all` zurück.
  Build prüft, dass jede Stufe einen Text bekommt.
- **Rätsel-Schritte** (`steps[]`) mit `type` → Plugin-Komponente in `src/puzzles/`:
  code (+image), audio, morse, colorfilter, overlay (Kamera), lock, slider, compass (+AR), accuse.
  Code-Rätsel nutzen `CodeAnswer` (Eingabe + Ersatzfrage); Rätsel ohne Code haben `solutionText` für die Auflösung.
  Neuer Typ = Schema (`station.schema.json` → `$defs/Step` + eigener `$defs/<Typ>Step`), Typ in `types.ts`
  (+ `codeIdsOfStep`), Komponente + Eintrag in `puzzles/registry.tsx`.
- **Kamera** (`puzzles/camera.ts`): nur nach Tipp, Stream wird beim Verlassen gestoppt, nichts gespeichert/hochgeladen.
- **Preact 11:** Zahlen in `style` bekommen KEIN automatisches „px“ – immer Einheit als String angeben!
- **Codes:** Station referenziert `codeId`; Klartext in codes.json; Build schreibt nur
  `sha256(salt:codeId:normalize(answer))` + AES-GCM-verschleierten Auflösungstext. Code-Quelle: `codes.example.json`
  als Basis, darüber JE CODE Env `TOUR_CODES` (GitHub-Secret, `{ "<stadt>": {codes…} }`) bzw. sonst `codes.json`.
  `BuiltTour.placeholderCodes` = Orts-Codes (Schritte mit verified:false), die noch aus dem Beispiel kommen.
- **Vor-Ort-Erfassung** (`screens/FieldCheck.tsx`, in der Entwickler-Ansicht): Nutzer erfasst je Station GPS,
  Antworten, Häkchen, Notizen (localStorage `fieldcheck:<tour>`). Export: Secret-JSON + Prüfbericht (Text an Claude →
  Koordinaten/verified/Texte im Content setzen).
- **[PLATZHALTER]** wird für Spieler ausgeblendet (`i18n/text.ts`, `setShowPlaceholders`), im Testmodus sichtbar.
- **Impressum/Datenschutz:** `#/about` (`screens/About.tsx`), Betreiberdaten in `src/legal.ts` (noch Platzhalter).
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
  Im Testmodus erscheint in den Einstellungen der Link zur Entwickler-Ansicht (#/dev).
- **Freischaltcode-Modul** (Standard aus): tour.access.requireUnlockCode + codes.access.codes → tour.accessHashes;
  UnlockGate in TourDetail. Lokal umgehbar – für Verkauf ApiAccessAdapter.
- **Bestenliste:** bei Spielende `scores.submit()` (useGame), Anzeige `components/Results.tsx` (ohne Testmodus-Spiele).
- **BuiltTour.codesSource** = secret | local | example → Entwickler-Ansicht warnt bei Platzhalter-Codes.
- Ersatzfrage (fallback) hat keine eigenen Hinweise – nur Auflösung.

## Konventionen
- Sprache im UI und in Kommentaren: Deutsch. Code-Bezeichner: Englisch.
- Preact + Hooks, keine weitere UI-Bibliothek. CSS in `src/styles.css` mit Variablen (Moor/Birke/Himmel/Aktenrot).
- Mobile first, Buttons ≥ 52 px, Hauptaktion unten in `.action-bar`, hoher Kontrast.
- Kamera/GPS/Sensoren nur nach Nutzer-Tap aktivieren, immer Fallback ohne.
- Imports, die vom Build-Skript (Node) erreicht werden, mit `.ts`-Endung.

## Offene Punkte (Stand: App fertig, v1.0.0)
- Nur durch den Nutzer möglich (Worpswede UND Findorff): Route ablaufen, Vor-Ort-Erfassung ausfüllen → Secret TOUR_CODES setzen,
  Prüfbericht an Claude → Koordinaten/Wege/Fakten eintragen, verified: true setzen. Impressum in src/legal.ts.
- Optional: gemeinfreies historisches Foto für den Barkenhoff (St. 9, overlay wieder einbauen).
- Optional: eigene Audioaufnahme der Zeugenaussage (St. 5, Feld `audio`), Bildausschnitt-Rätsel (code + `image`).
- Tests auf echten Geräten (docs/GERAETETEST.md). Englische Texte (`en`) ergänzen.

## Befehle
- `npm run dev` – Dev-Server (baut Content automatisch, lädt bei Änderungen neu)
- `npm test` – Tests · `npm run typecheck` · `npm run content` – nur Content prüfen/bauen
- `npm run build` / `npm run preview` · `npm run icons` – Icons aus `public/icon.svg` erzeugen
- `npm run new-city -- <id> "<Name>"` – neue Stadt aus Vorlage
- Lokaler Build für Pages-Pfad: `BASE_PATH=/Escape-Bremer-Umland/ npx vite build` (sonst stimmen die Pfade nicht)
