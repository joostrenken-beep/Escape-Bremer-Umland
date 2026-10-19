/**
 * Legt eine neue Stadt aus der Vorlage an.
 *
 *   npm run new-city -- lilienthal "Lilienthal"
 *
 * Erzeugt content/lilienthal/ mit tour.json (unveröffentlicht), einer
 * Beispiel-Station und Platzhalter-Codes. Danach Inhalte ausfüllen und mit
 * `npm run content` prüfen. Im Testmodus ist die Tour sofort spielbar.
 */
import { cp, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

export async function createCity(id: string, name: string, contentDir = join(ROOT, 'content')): Promise<string> {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('ID nur aus Kleinbuchstaben, Ziffern und Bindestrichen, z. B. "osterholz-scharmbeck"');
  const dest = join(contentDir, id);
  if (existsSync(dest)) throw new Error(`content/${id} gibt es schon`);
  await cp(join(ROOT, 'templates', 'neue-stadt'), dest, { recursive: true });
  const tourFile = join(dest, 'tour.json');
  const tour = (await readFile(tourFile, 'utf8'))
    .replace('__ID__', id)
    .replace('__NAME__', name)
    .replace('__SALT__', randomBytes(12).toString('hex'));
  await writeFile(tourFile, tour);
  return dest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [id, ...nameParts] = process.argv.slice(2);
  if (!id) {
    console.error('Aufruf: npm run new-city -- <id> "<Name>"   z. B. npm run new-city -- lilienthal "Lilienthal"');
    process.exit(1);
  }
  const name = nameParts.join(' ') || id.charAt(0).toUpperCase() + id.slice(1);
  try {
    const dest = await createCity(id, name);
    console.log(`✅ Neue Stadt angelegt: ${dest}\n   Nächste Schritte: siehe README → „Neue Stadt anlegen“`);
  } catch (e) {
    console.error(`❌ ${(e as Error).message}`);
    process.exit(1);
  }
}
