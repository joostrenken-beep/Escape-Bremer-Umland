# Ermittlerakte – Escape-Stadtführungen im Bremer Umland

Ein Krimi-Escape-Spiel für draußen, das gleichzeitig eine Stadtführung ist. Die Gruppe spielt mit **einem Handy**:
An jeder Station findet sie eine echte Information vor Ort (Jahreszahl, Inschrift, Anzahl …), gibt sie als Code ein
und löst Rätsel, bis der Fall aufgeklärt ist. Erste Tour: **Worpswede – „Die Mondnacht vom Weyerberg“**.

👉 **Spielen:** https://joostrenken-beep.github.io/Escape-Bremer-Umland/

## Auf dem iPhone testen

1. Link oben in **Safari** öffnen.
2. Optional: Teilen → **„Zum Home-Bildschirm“** – dann startet sie wie eine App.
3. Tour öffnen und **„Für offline speichern“** tippen (im WLAN). Danach funktioniert alles ohne Internet.

Nach jedem Push auf `main` baut GitHub die App neu (Reiter **Actions**). Ist eine neue Version da, zeigt die App
oben „Eine neue Version ist da – Aktualisieren“.

## Lokal entwickeln (optional, braucht Node.js ≥ 22)

```bash
npm install
npm run dev      # zeigt eine Adresse wie http://192.168.x.x:5173 – im selben WLAN auch auf dem Handy öffnen
npm test         # automatische Tests
```

Hinweis: Kamera, Bewegungssensoren und Offline-Modus funktionieren auf dem iPhone nur über HTTPS – also über den
GitHub-Pages-Link, nicht über die lokale Adresse.

## Lösungscodes (wichtig – das Repo ist öffentlich!)

Die echten Codes stehen **nie** im Repo. Im Repo liegt nur `content/<stadt>/codes.example.json` mit Platzhaltern.

- **Lokal:** `codes.example.json` kopieren zu `codes.json` und echte Antworten eintragen (wird von Git ignoriert).
- **Für die veröffentlichte App:** Auf GitHub unter *Settings → Secrets and variables → Actions → New repository
  secret* ein Secret **`TOUR_CODES`** anlegen. Inhalt:
  ```json
  { "worpswede": { "codes": { "s01-unlock": { "answers": ["…"], "reveal": { "de": "…" } } } } }
  ```

In der ausgelieferten App stehen nur Hash-Werte der Antworten.

## Aufbau

Siehe [`CLAUDE.md`](CLAUDE.md) für Architektur und Stand. Kurz:
- `content/` – alle Inhalte als JSON, eine Stadt pro Ordner
- `schema/` – Regeln, wie diese JSON-Dateien aussehen müssen (werden beim Build geprüft)
- `src/` – die App (Preact + TypeScript)
- `scripts/build-content.ts` – prüft die Inhalte und erzeugt daraus die Stadtpakete

Die Anleitung „Neue Stadt anlegen“ folgt in Meilenstein 6.
