/* 
  Build FilmMuse index from movies.raw.jsonl
  Input : src/data/movies.raw.jsonl   (one JSON object per line)
  Output: src/data/movies.index.json  (array used by /api/search)
*/

import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";

type Raw = {
  id?: string;
  imdb_id?: string;
  tmdb_id?: string;
  title?: string;
  year?: number | string;
  release_date?: string;
  runtime?: number | string;      // minutes
  genres?: string[] | string;     // array or CSV string
  meta?: string;                  // if present
  poster?: string | null;
  // …any other fields you may have
};

type Out = {
  id: string;
  title: string;
  year?: number;
  meta?: string;
  poster?: string;
  genres?: string[];
};

const ROOT = process.cwd();
const IN = path.join(ROOT, "src", "data", "movies.raw.jsonl");
const OUT = path.join(ROOT, "src", "data", "movies.index.json");

// Map/normalize a raw record to the output shape
function normalize(r: Raw): Out | null {
  const title = (r.title || "").toString().trim();
  if (!title) return null;

  // year
  let year: number | undefined = undefined;
  if (r.year !== undefined && r.year !== null && r.year !== "") {
    const n = Number(r.year);
    if (!Number.isNaN(n)) year = n;
  } else if (r.release_date) {
    const y = Number(String(r.release_date).slice(0, 4));
    if (!Number.isNaN(y)) year = y;
  }

  // id
  const baseId =
    (r.id && String(r.id)) ||
    (r.imdb_id && String(r.imdb_id)) ||
    (title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") +
      (year ? `-${year}` : ""));

  // genres -> array of neat strings
  let genres: string[] | undefined;
  if (Array.isArray(r.genres)) {
    genres = r.genres.filter(Boolean).map((g) => String(g).trim());
  } else if (typeof r.genres === "string") {
    genres = r.genres
      .split(/[•,/|;-]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    genres = undefined;
  }

  // runtime
  let runtimeMin: number | undefined = undefined;
  if (r.runtime !== undefined && r.runtime !== null && r.runtime !== "") {
    const n = Number(r.runtime);
    if (!Number.isNaN(n)) runtimeMin = n;
  }

  // meta: prefer provided, else compose: "<Genre1 • Genre2 • Xh Ym>"
  let meta: string | undefined = r.meta;
  if (!meta) {
    const parts: string[] = [];
    if (genres?.length) parts.push(genres.join(" • "));
    if (runtimeMin && runtimeMin > 0) {
      const h = Math.floor(runtimeMin / 60);
      const m = runtimeMin % 60;
      parts.push(`${h > 0 ? `${h}h ` : ""}${m}m`.trim());
    }
    if (parts.length) meta = parts.join(" • ");
  }

  // poster: keep if present, else leave undefined (client shows fallback)
  const poster = r.poster || undefined;

  return {
    id: baseId,
    title,
    year,
    meta,
    poster,
    genres,
  };
}

async function main() {
  if (!fs.existsSync(IN)) {
    console.error(`Input not found: ${IN}`);
    process.exit(1);
  }

  const seen = new Set<string>(); // dedupe by id
  const items: Out[] = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(IN, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let lineNo = 0;
  for await (const line of rl) {
    lineNo++;
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed) as Raw;
      const mapped = normalize(obj);
      if (!mapped) continue;
      if (seen.has(mapped.id)) continue;
      seen.add(mapped.id);
      items.push(mapped);
    } catch (err) {
      // skip bad lines but log once in a while
      if (lineNo < 5) {
        console.warn(`Skipping bad line ${lineNo}: ${err}`);
      }
    }
  }

  // Write pretty JSON (you can switch to minified if you prefer)
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(items, null, 2), "utf-8");

  console.log(`Wrote ${items.length} movies → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
