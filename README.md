# Ermittlerakte – Escape-Stadtführungen im Bremer Umland

Ein Krimi-Escape-Spiel für draußen, das gleichzeitig eine Stadtführung ist. Die Gruppe spielt mit **einem Handy**:
An jeder Station findet sie eine echte Information vor Ort (Jahreszahl, Inschrift, Anzahl …), gibt sie als Code ein
und löst Rätsel – vom Logikrätsel über Morse-Töne bis zum Kompass mit Kamera –, bis der Fall aufgeklärt ist.
Touren: **Worpswede – „Die Mondnacht vom Weyerberg“** und **Bremen-Findorff – „Die Glocke der Moorlilie“**.

👉 **Spielen:** https://joostrenken-beep.github.io/Escape-Bremer-Umland/

## Spielen & teilen

- Link in **Safari** (iPhone) oder **Chrome** (Android) öffnen – das ist alles. Den Link kann man einfach weitergeben.
- Optional: Teilen → **„Zum Home-Bildschirm“** – dann startet sie wie eine App.
- Tour öffnen und **„Für offline speichern“** tippen (im WLAN). Danach funktioniert alles ohne Internet
  (nur die Karte braucht Netz).
- Spielstand, Notizbuch und Ergebnisse speichert jedes Handy für sich.

**Testmodus:** Startseite → ⚙️ Einstellungen → Testmodus. Dann lassen sich Rätsel überspringen, Stationen anspringen
und unveröffentlichte Touren spielen. Dort gibt es auch die **Entwickler-Ansicht** mit der Prüfliste für vor Ort.

## Tour vor Ort fertigstellen (Worpswede, Findorff)

Die App ist fertig – nur die Angaben, die man **vor Ort** sieht, kann niemand vom Schreibtisch aus kennen.
Solange sie fehlen, erwartet die App an diesen Stellen „0000“ (Ersatzfrage: „test“).

1. Handy: ⚙️ Einstellungen → **Testmodus** an → **Entwickler-Ansicht** → Stadt wählen.
2. Route ablaufen. In der **Vor-Ort-Erfassung** je Station:
   **„Standort übernehmen“**, die gefundenen **Antworten** eintragen (mehrere Schreibweisen mit Komma),
   Notizen machen, **„Station geprüft“** abhaken. Alles bleibt auf dem Handy gespeichert.
3. Danach:
   - **„Codes fürs GitHub-Secret kopieren“** → auf GitHub unter *Settings → Secrets and variables → Actions*
     das Secret **`TOUR_CODES`** anlegen bzw. ersetzen und den Text einfügen. Dann *Actions → Test & Deploy →
     Run workflow* – fertig, die Codes sind aktiv.
   - **„Prüfbericht kopieren“** → an Claude schicken: Koordinaten, Wegbeschreibungen und Fakten werden eingetragen
     und auf „geprüft“ gesetzt.
4. In `src/legal.ts` Name, Anschrift und E-Mail für das **Impressum** eintragen (oder Claude geben).

## Neue Stadt anlegen

Jede Stadt ist ein eigener Ordner in `content/`. **Programmieren muss man dafür nichts.**

1. **Ordner anlegen** (mit Node.js auf dem Rechner, oder Claude bitten):
   ```bash
   npm run new-city -- lilienthal "Lilienthal"
   ```
   Das erzeugt `content/lilienthal/` mit einer Beispiel-Station. Die Tour ist zunächst **unveröffentlicht**
   (`"published": false`) – sie erscheint nur im Testmodus.
2. **`tour.json` ausfüllen:** Titel, Teaser, Startpunkt, Story-Einleitung und Auflösung (je Stufe), Reihenfolge der
   Stationen (`"stations": [...]`).
3. **Stationen schreiben:** pro Station eine Datei `stations/<id>.json` (die Beispiel-Station kopieren).
   Wichtig:
   - Texte je Stufe: `"all"` gilt für alle, `"easy"`/`"medium"`/`"hard"` überschreiben einzelne Stufen.
   - Story max. ca. 80 Wörter.
   - Jede ortsbezogene Angabe bekommt `"verified": false`, bis sie vor Ort geprüft ist.
   - Rätseltypen (`"type"`): `code`, `audio`, `morse`, `colorfilter`, `overlay`, `lock`, `slider`, `compass`,
     `accuse` – kopierfertige Beispiele für alle Typen: [`docs/RAETSELTYPEN.md`](docs/RAETSELTYPEN.md).
   - Bilder und Audio in `media/` ablegen und als `"media/datei.jpg"` angeben (Lizenz beachten!).
4. **Codes:** Platzhalter in `codes.example.json`. Echte Codes niemals ins Repo (siehe unten).
5. **Prüfen:** `npm run content` – meldet verständlich, was fehlt oder falsch ist. Jeder Push prüft das automatisch.
6. **Vor Ort prüfen:** Testmodus → Entwickler-Ansicht → Prüfliste abarbeiten, Koordinaten mit
   „Meinen Standort anzeigen“ ablesen, dann `"verified": true` setzen.
7. **Veröffentlichen:** in `tour.json` `"published": true` setzen und pushen.

## Lösungscodes (wichtig – das Repo ist öffentlich!)

Die Codes, die man **vor Ort** findet, stehen **nie** im Repo. Im Repo liegt nur `codes.example.json` mit
Platzhaltern (und den Lösungen der reinen Denk-Rätsel, die sich ohnehin aus dem Rätseltext ergeben).

- **Lokal:** `codes.example.json` kopieren zu `codes.json` und echte Antworten eintragen (wird von Git ignoriert).
- **Für die veröffentlichte App:** GitHub → *Settings → Secrets and variables → Actions → New repository secret*,
  Name **`TOUR_CODES`**. Am einfachsten mit der Vor-Ort-Erfassung erzeugen (siehe oben). Das Secret muss nur die
  Codes enthalten, die man vor Ort findet – alle übrigen kommen aus `codes.example.json`. Mehrere Städte stehen
  zusammen in einem JSON:
  ```json
  {
    "worpswede": { "codes": { "s01-unlock": { "answers": ["7"], "reveal": { "de": "Es sind 7 runde Fenster." } } } },
    "lilienthal": { "codes": { "…": { "answers": ["…"], "reveal": { "de": "…" } } } }
  }
  ```
  Tipp: Eine Kopie davon privat aufbewahren – GitHub zeigt Secrets nach dem Speichern nicht mehr an.
- Mehrere richtige Antworten sind möglich (`"answers": ["Barkenhoff", "Barkenhof"]`), Groß-/Kleinschreibung,
  Leerzeichen, Bindestriche und ä/ae/ß/ss werden automatisch toleriert.
- In der ausgelieferten App stehen nur Hash-Werte der Antworten.

## Freischaltcodes (optional, Standard: aus)

Soll eine Tour nur mit Code spielbar sein (z. B. verkauftes Ticket):
1. In `tour.json`: `"access": { "requireUnlockCode": true }`
2. In den Codes (Secret bzw. `codes.json`) ergänzen: `"access": { "codes": ["MOOR-2026", "…"] }`

Ohne Server lässt sich das von Technikkundigen umgehen. Für echten Verkauf einen Server nutzen (nächster Abschnitt).

## Späteres Backend

Alle Datenzugriffe laufen über Adapter (`src/adapters/`). Wird beim Build die Umgebungsvariable `VITE_API_URL`
gesetzt, nutzt die App einen Server für Touren, Bestenliste und Freischaltcodes – sonst alles lokal.
Die erwartete Schnittstelle steht in [`docs/API.md`](docs/API.md).

## Lokal entwickeln (optional, braucht Node.js ≥ 22)

```bash
npm install
npm run dev      # zeigt eine Adresse wie http://192.168.x.x:5173 – im selben WLAN auch auf dem Handy öffnen
npm test         # automatische Tests
npm run content  # nur Inhalte prüfen
```

Kamera, Bewegungssensoren und Offline-Modus funktionieren auf dem iPhone nur über HTTPS – also über den
GitHub-Pages-Link. Checkliste für Tests auf echten Geräten: [`docs/GERAETETEST.md`](docs/GERAETETEST.md).

## Aufbau

Siehe [`CLAUDE.md`](CLAUDE.md) für Architektur, Entscheidungen und Stand. Kurz:
- `content/` – alle Inhalte als JSON, eine Stadt pro Ordner
- `schema/` – Regeln, wie diese JSON-Dateien aussehen müssen (werden beim Build geprüft)
- `src/` – die App (Preact + TypeScript), Rätsel-Plugins in `src/puzzles/`
- `scripts/` – Content-Build (prüfen, Codes hashen) und `new-city`
- `templates/neue-stadt/` – Vorlage für neue Städte

## Bildnachweis

- „Mondnacht am Weyerberg“ (`content/worpswede/media/mondnacht.svg`): eigene Illustration für dieses Projekt –
  das Gemälde und die Malerin Johanna Behrens sind erfunden.
- Torfkahn „Moorlilie“ (`content/findorff/media/moorlilie.svg`): eigene Illustration – Boot und Glocke sind erfunden.
- Karten: © OpenStreetMap-Mitwirkende.
