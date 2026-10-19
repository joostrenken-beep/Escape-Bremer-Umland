/**
 * Content-Build: content/<stadt>/ → public/tours/<stadt>/
 *
 *  1. Prüft tour.json, stations/*.json und die Codes gegen das JSON-Schema.
 *  2. Prüft Zusammenhänge (fehlende Stationen, Codes, Medien, Texte je Stufe).
 *  3. Ersetzt Klartext-Codes durch Hashes und schreibt ein Paket pro Stadt
 *     plus tours/index.json für die Stadtauswahl.
 *
 * Woher kommen die Klartext-Codes? (in dieser Reihenfolge)
 *  - Umgebungsvariable TOUR_CODES = {"<stadt>": { "codes": … }}  (GitHub-Secret)
 *  - content/<stadt>/codes.json          (lokal, steht in .gitignore)
 *  - content/<stadt>/codes.example.json  (Platzhalter, im Repo – nur zum Entwickeln)
 *
 * Aufruf: npm run content   (läuft auch automatisch bei npm run dev / build)
 */

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv2020, type ValidateFunction } from 'ajv/dist/2020.js';
import type {
  BuiltCode,
  BuiltTour,
  CodesFile,
  Difficulty,
  Leveled,
  StationSource,
  TourSource,
  TourSummary,
} from '../src/content/types.ts';
import { DIFFICULTIES } from '../src/content/types.ts';
import { hashAnswer, obscureReveal } from '../src/game/codes.ts';
import { leveled } from '../src/i18n/text.ts';
import { collectUnverified } from '../src/content/verification.ts';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const MAX_STORY_WORDS = 80;

export interface BuildOptions {
  contentDir?: string;
  outDir?: string;
  /** Codes je Tour, überschreibt Dateien (z. B. aus dem GitHub-Secret). */
  codesOverride?: Record<string, CodesFile>;
  /** Nur prüfen, nichts schreiben (für Tests). */
  dryRun?: boolean;
}

export interface BuildResult {
  tours: BuiltTour[];
  errors: string[];
  warnings: string[];
}

async function readJson<T>(file: string): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch (e) {
    throw new Error(`${relative(ROOT, file)}: ungültiges JSON (${(e as Error).message})`);
  }
}

async function loadValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  for (const name of ['common', 'tour', 'station', 'codes']) {
    ajv.addSchema(await readJson(join(ROOT, 'schema', `${name}.schema.json`)));
  }
  const get = (name: string) =>
    ajv.getSchema(`https://escape-bremer-umland.local/schema/${name}.schema.json`) as ValidateFunction;
  return { tour: get('tour'), station: get('station'), codes: get('codes') };
}

function schemaErrors(file: string, validate: ValidateFunction): string[] {
  return (validate.errors ?? []).map(
    (e) => `${file}: ${e.instancePath || '(Wurzel)'} ${e.message}${e.params ? ' ' + JSON.stringify(e.params) : ''}`,
  );
}

/** Ein LeveledText muss für jede Stufe einen Text liefern (eigene Stufe oder "all"). */
function checkLeveledTexts(node: unknown, path: string, errors: string[]) {
  if (Array.isArray(node)) {
    node.forEach((c, i) => checkLeveledTexts(c, `${path}[${i}]`, errors));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  const keys = Object.keys(obj);
  const isLeveled =
    keys.length > 0 &&
    keys.every((k) => k === 'all' || (DIFFICULTIES as readonly string[]).includes(k)) &&
    keys.every((k) => typeof (obj[k] as { de?: unknown })?.de === 'string');
  if (isLeveled) {
    const missing = DIFFICULTIES.filter((d) => !obj[d] && !obj.all);
    if (missing.length) errors.push(`${path}: kein Text für Stufe ${missing.join(', ')} (und kein "all")`);
    return;
  }
  for (const [k, v] of Object.entries(obj)) checkLeveledTexts(v, path ? `${path}.${k}` : k, errors);
}

function wordCount(s: string) {
  return s.split(/\s+/).filter(Boolean).length;
}

function codeIdsOf(station: StationSource): string[] {
  return station.steps.flatMap((s) => [s.codeId, ...(s.fallback ? [s.fallback.codeId] : [])]);
}

async function listFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full)));
    else if (!entry.name.startsWith('.')) out.push(full);
  }
  return out;
}

async function loadCodes(
  tourDir: string,
  tourId: string,
  override: Record<string, CodesFile> | undefined,
  warnings: string[],
): Promise<{ file: CodesFile; source: BuiltTour['codesSource'] } | null> {
  if (override?.[tourId]) return { file: override[tourId], source: 'secret' };
  const real = join(tourDir, 'codes.json');
  if (existsSync(real)) return { file: await readJson<CodesFile>(real), source: 'local' };
  const example = join(tourDir, 'codes.example.json');
  if (existsSync(example)) {
    warnings.push(`${tourId}: keine echten Codes gefunden – nutze Platzhalter aus codes.example.json`);
    return { file: await readJson<CodesFile>(example), source: 'example' };
  }
  return null;
}

function codesOverrideFromEnv(): Record<string, CodesFile> | undefined {
  const raw = process.env.TOUR_CODES;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Record<string, CodesFile>;
  } catch {
    throw new Error('Umgebungsvariable TOUR_CODES enthält kein gültiges JSON');
  }
}

async function buildTour(
  tourDir: string,
  validators: Awaited<ReturnType<typeof loadValidators>>,
  opts: BuildOptions,
  errors: string[],
  warnings: string[],
): Promise<BuiltTour | null> {
  const rel = relative(ROOT, tourDir);
  const errCount = errors.length;

  const tour = await readJson<TourSource>(join(tourDir, 'tour.json'));
  if (!validators.tour(tour)) {
    errors.push(...schemaErrors(`${rel}/tour.json`, validators.tour));
    return null;
  }
  const folderName = tourDir.split(/[\\/]/).pop();
  if (tour.id !== folderName) errors.push(`${rel}/tour.json: id "${tour.id}" muss dem Ordnernamen "${folderName}" entsprechen`);
  checkLeveledTexts(tour, `${rel}/tour.json`, errors);

  // Stationen
  const stations: StationSource[] = [];
  for (const id of tour.stations) {
    const file = join(tourDir, 'stations', `${id}.json`);
    const relFile = `${rel}/stations/${id}.json`;
    if (!existsSync(file)) {
      errors.push(`${rel}/tour.json: Station "${id}" fehlt (${relFile})`);
      continue;
    }
    const station = await readJson<StationSource>(file);
    if (!validators.station(station)) {
      errors.push(...schemaErrors(relFile, validators.station));
      continue;
    }
    if (station.id !== id) errors.push(`${relFile}: id "${station.id}" muss dem Dateinamen entsprechen`);
    checkLeveledTexts(station, relFile, errors);
    for (const level of DIFFICULTIES) {
      const words = wordCount(leveled(station.story, level));
      if (words > MAX_STORY_WORDS) warnings.push(`${relFile}: Story (${level}) hat ${words} Wörter (Ziel: ≤ ${MAX_STORY_WORDS})`);
    }
    stations.push(station);
  }
  const stepIds = new Set<string>();
  for (const s of stations) for (const step of s.steps) {
    const key = `${s.id}/${step.id}`;
    if (stepIds.has(key)) errors.push(`${rel}: Schritt-ID doppelt: ${key}`);
    stepIds.add(key);
  }

  // Medien müssen existieren
  const mediaRefs = new Set<string>();
  const collectMedia = (node: unknown) => {
    if (typeof node === 'string' && node.startsWith('media/')) mediaRefs.add(node);
    else if (node && typeof node === 'object') Object.values(node).forEach(collectMedia);
  };
  collectMedia(tour);
  stations.forEach(collectMedia);
  for (const m of mediaRefs) {
    if (!existsSync(join(tourDir, m))) errors.push(`${rel}: Mediendatei fehlt: ${m}`);
  }

  // Codes
  const loaded = await loadCodes(tourDir, tour.id, opts.codesOverride, warnings);
  const codesFile = loaded?.file;
  const codes: Record<string, BuiltCode> = {};
  if (!codesFile) {
    errors.push(`${rel}: keine Codes gefunden (codes.json oder codes.example.json)`);
  } else if (!validators.codes(codesFile)) {
    errors.push(...schemaErrors(`${rel}/codes`, validators.codes));
  } else {
    const needed = new Set(stations.flatMap(codeIdsOf));
    for (const codeId of needed) {
      const entry = codesFile.codes[codeId];
      if (!entry) {
        errors.push(`${rel}: Code "${codeId}" wird benutzt, steht aber nicht in den Codes`);
        continue;
      }
      const answers: Leveled<string[]> = Array.isArray(entry.answers) ? { all: entry.answers } : entry.answers;
      const missing = DIFFICULTIES.filter((d: Difficulty) => !answers[d] && !answers.all);
      if (missing.length) errors.push(`${rel}: Code "${codeId}" hat keine Antwort für ${missing.join(', ')}`);
      const hashes: Leveled<string[]> = {};
      for (const [level, list] of Object.entries(answers) as [Difficulty | 'all', string[]][]) {
        hashes[level] = await Promise.all(list.map((a) => hashAnswer(tour.codeSalt, codeId, a)));
      }
      codes[codeId] = { hashes, reveal: await obscureReveal(tour.codeSalt, codeId, entry.reveal) };
    }
    for (const codeId of Object.keys(codesFile.codes)) {
      if (!needed.has(codeId)) warnings.push(`${rel}: Code "${codeId}" wird von keiner Station benutzt`);
    }
  }

  if (errors.length > errCount) return null;

  const unverified = collectUnverified({ tour, stations }).length;
  if (unverified) warnings.push(`${tour.id}: ${unverified} ortsbezogene Angaben noch nicht vor Ort bestätigt (verified: false)`);

  const mediaFiles = (await listFiles(join(tourDir, 'media'))).map((f) => relative(tourDir, f).split('\\').join('/'));
  const { stations: _ids, ...meta } = tour;
  return {
    ...meta,
    stations,
    codes,
    codesSource: loaded?.source ?? 'example',
    files: ['tour.json', ...mediaFiles],
    builtAt: new Date().toISOString(),
  };
}

export async function buildContent(opts: BuildOptions = {}): Promise<BuildResult> {
  const contentDir = opts.contentDir ?? join(ROOT, 'content');
  const outDir = opts.outDir ?? join(ROOT, 'public', 'tours');
  const options = { ...opts, codesOverride: opts.codesOverride ?? codesOverrideFromEnv() };
  const errors: string[] = [];
  const warnings: string[] = [];
  const validators = await loadValidators();

  const tourDirs: string[] = [];
  for (const entry of await readdir(contentDir, { withFileTypes: true })) {
    if (entry.isDirectory() && existsSync(join(contentDir, entry.name, 'tour.json'))) {
      tourDirs.push(join(contentDir, entry.name));
    }
  }

  const tours: BuiltTour[] = [];
  for (const dir of tourDirs.sort()) {
    try {
      const built = await buildTour(dir, validators, options, errors, warnings);
      if (built) tours.push(built);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (!options.dryRun && errors.length === 0) {
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });
    for (const tour of tours) {
      const dest = join(outDir, tour.id);
      await mkdir(dest, { recursive: true });
      await writeFile(join(dest, 'tour.json'), JSON.stringify(tour));
      const media = join(contentDir, tour.id, 'media');
      if (existsSync(media) && (await stat(media)).isDirectory()) {
        await cp(media, join(dest, 'media'), { recursive: true });
      }
    }
    const index: TourSummary[] = tours.map((t) => ({
      id: t.id,
      version: t.version,
      published: t.published,
      town: t.town,
      title: t.title,
      teaser: t.teaser,
      durationMinutes: t.durationMinutes,
      distanceKm: t.distanceKm,
      stationCount: t.stations.length,
      cover: t.cover,
    }));
    await writeFile(join(outDir, 'index.json'), JSON.stringify(index));
  }

  return { tours, errors, warnings };
}

export function report(result: BuildResult, log = console): boolean {
  for (const w of result.warnings) log.warn(`⚠️  ${w}`);
  for (const e of result.errors) log.error(`❌ ${e}`);
  if (result.errors.length === 0) {
    log.log(`✅ Content ok: ${result.tours.map((t) => `${t.id} (${t.stations.length} Stationen)`).join(', ')}`);
  }
  return result.errors.length === 0;
}

// Direkt aufgerufen (npm run content)?
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ok = report(await buildContent());
  process.exit(ok ? 0 : 1);
}
