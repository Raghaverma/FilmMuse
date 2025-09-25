// scripts/build-index-with-omdb.ts
/* eslint-disable no-console */
import "dotenv/config";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

// Node 18+ has global fetch
const OMDB_KEY = process.env.OMDB_API_KEY;
if (!OMDB_KEY) {
  console.error("Missing OMDB_API_KEY in .env");
  process.exit(1);
}

type RawMovie = {
  id: string | number;
  title: string;
  release_date?: string | null;
  genres?: string[];     // likely []
  cast?: string;         // raw JSON string from credits.csv
  crew?: string;         // raw JSON string from credits.csv
  poster?: string | null;
  imdb_id?: string | null;
};

type IndexMovie = {
  id: string;
  title: string;
  year: number | null;
  genres: string[];
  poster: string | null;
  imdb_id?: string;
};

const cwd = process.cwd();
const RAW_PATH = path.join(cwd, "src", "data", "movies.raw.jsonl");
const OUT_PATH = path.join(cwd, "src", "data", "movies.index.json");
const CACHE_PATH = path.join(cwd, "src", "data", "omdb.cache.json");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toYear(m: RawMovie): number | null {
  if (m.release_date && /^\d{4}/.test(m.release_date)) return Number(m.release_date.slice(0, 4));
  return null;
}

function normTitle(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadCache(): Promise<Record<string, any>> {
  try {
    const txt = await fsp.readFile(CACHE_PATH, "utf8");
    return JSON.parse(txt);
  } catch {
    return {};
  }
}

async function saveCache(cache: Record<string, any>) {
  await fsp.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fsp.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

async function* iterateRaw(): AsyncGenerator<RawMovie> {
  const data = await fsp.readFile(RAW_PATH, "utf8");
  const lines = data.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line) as RawMovie;
      if (obj && obj.title) yield obj;
    } catch {
      // skip bad JSON line
    }
  }
}

async function fetchOmdbByTitle(title: string, year?: number | null) {
  // Try exact title + year first (if we have year), then fallback to title only
  const queries = year
    ? [
        `https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(title)}&y=${year}`,
        `https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(title)}`,
      ]
    : [`https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(title)}`];

  for (const url of queries) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const json: any = await res.json();
    if (json && json.Response === "True") return json;
  }
  return null;
}

async function main() {
  // sanity
  if (!fs.existsSync(RAW_PATH)) {
    console.error(`Input not found: ${RAW_PATH}`);
    process.exit(1);
  }

  const cache = await loadCache(); // key: normalized title (and optional year), value: {Poster, imdbID} or {miss:true}
  const out: IndexMovie[] = [];

  let total = 0;
  let hits = 0;
  let misses = 0;

  console.log("Building index with OMDb posters…");
  for await (const raw of iterateRaw()) {
    total++;
    const id = String(raw.id);
    const title = raw.title;
    const year = toYear(raw);
    const genres = Array.isArray(raw.genres) ? raw.genres : [];

    let poster: string | null = raw.poster ?? null;
    let imdb_id: string | undefined = raw.imdb_id ?? undefined;

    // If we don't already have a poster, try OMDb
    if (!poster) {
      const cacheKey = year ? `${normTitle(title)}|${year}` : normTitle(title);
      let entry = cache[cacheKey];

      if (!entry) {
        // throttle: ~4 req/sec (adjust if you hit limits)
        await sleep(250);
        entry = await fetchOmdbByTitle(title, year);
        cache[cacheKey] = entry ? { Poster: entry.Poster, imdbID: entry.imdbID } : { miss: true };
        // Persist cache every ~200 items to be safe
        if (total % 200 === 0) await saveCache(cache);
      }

      if (entry && !entry.miss && entry.Poster && entry.Poster !== "N/A") {
        poster = entry.Poster;
        if (entry.imdbID) imdb_id = entry.imdbID;
        hits++;
      } else {
        misses++;
      }
    }

    out.push({
      id,
      title,
      year,
      genres,
      poster: poster ?? null,
      imdb_id,
    });
  }

  await saveCache(cache);
  await fsp.writeFile(OUT_PATH, JSON.stringify(out, null, 2), "utf8");

  console.log(`Processed: ${total}`);
  console.log(`Poster hits from OMDb: ${hits}`);
  console.log(`Poster misses: ${misses}`);
  console.log(`Wrote ${out.length} movies → ${OUT_PATH}`);
  console.log(`Cache saved → ${CACHE_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
