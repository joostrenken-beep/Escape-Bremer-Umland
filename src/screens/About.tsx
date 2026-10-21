import { operator, operatorComplete } from '../legal';

/** Über die App, Datenschutz, Impressum, Bildnachweis. */
export function About() {
  return (
    <main class="screen about">
      <a class="back" href="#/">
        ‹ Zurück
      </a>
      <h1>Über & Datenschutz</h1>

      <section class="card">
        <h2 class="h3">Über die Ermittlerakte</h2>
        <p>
          Krimi-Escape-Spiele zu Fuß, die zugleich Stadtführungen sind. Die Fälle und alle Verdächtigen sind frei erfunden; die
          Orte und das Ortswissen sind echt. Echte Personen der Künstlerkolonie kommen nur als historischer Hintergrund vor.
        </p>
        <p class="small">
          Bitte achtet unterwegs auf den Verkehr, betretet keine Privatgrundstücke und verhaltet euch auf Friedhöfen respektvoll.
        </p>
      </section>

      <section class="card">
        <h2 class="h3">Datenschutz in Kürze</h2>
        <ul class="plain-list">
          <li>Keine Anmeldung, keine Werbung, kein Tracking, keine Cookies.</li>
          <li>
            Spielstand, Notizbuch, Ergebnisse und Einstellungen werden nur <strong>auf eurem Gerät</strong> gespeichert. Ihr könnt sie
            unter Einstellungen jederzeit löschen.
          </li>
          <li>
            <strong>Standort (GPS)</strong> wird nur nach Antippen für den Richtungspfeil genutzt und verlässt das Gerät nicht.
          </li>
          <li>
            <strong>Kamera</strong> und <strong>Bewegungssensoren</strong> werden nur nach Antippen genutzt. Das Kamerabild wird nur
            angezeigt – nichts wird aufgenommen, gespeichert oder übertragen.
          </li>
          <li>Die Ermittlerurkunde wird auf dem Gerät erzeugt; geteilt wird sie nur, wenn ihr das selbst tut.</li>
          <li>
            <strong>Hosting:</strong> Die App liegt auf GitHub Pages (GitHub Inc.). Beim Abruf verarbeitet GitHub technisch notwendige
            Daten wie die IP-Adresse (
            <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">
              Datenschutzerklärung von GitHub
            </a>
            ).
          </li>
          <li>
            <strong>Karte:</strong> Erst wenn ihr „Karte anzeigen“ tippt, lädt euer Gerät Kartenbilder von OpenStreetMap; dabei wird
            eure IP-Adresse an die OpenStreetMap Foundation übertragen (
            <a href="https://osmfoundation.org/wiki/Privacy_Policy" rel="noopener">
              Datenschutzrichtlinie der OSMF
            </a>
            ).
          </li>
          <li>Das Vorlesen nutzt die Sprachausgabe eures Geräts (Systemfunktion).</li>
        </ul>
      </section>

      <section class="card">
        <h2 class="h3">Impressum</h2>
        {operatorComplete ? (
          <p>
            {operator.name}
            <br />
            {operator.street}
            <br />
            {operator.city}
            <br />
            <a href={`mailto:${operator.email}`}>{operator.email}</a>
          </p>
        ) : (
          <p class="dev-warn card">
            Die Angaben zum Betreiber fehlen noch (Datei <code>src/legal.ts</code>).
          </p>
        )}
      </section>

      <section class="card">
        <h2 class="h3">Bildnachweis</h2>
        <p class="small">
          „Mondnacht am Weyerberg“ und Torfkahn „Moorlilie“: eigene Illustrationen – Gemälde, Malerin, Boot und Glocke sind
          erfunden. Karten: ©{' '}
          <a href="https://www.openstreetmap.org/copyright" rel="noopener">
            OpenStreetMap-Mitwirkende
          </a>
          . Schrift „Special Elite“ (SIL Open Font License).
        </p>
      </section>
    </main>
  );
}
