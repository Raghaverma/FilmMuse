// scripts/fetch-posters.mjs
import fs from "fs";
import path from "path";
import { config } from "dotenv";

// force .env values to override any existing system env vars
config({ path: ".env", override: true });

const API_KEY = process.env.OMDB_API_KEY;
if (!API_KEY) {
  console.error("❌ No OMDB_API_KEY found in .env");
  process.exit(1);
}

// mask the key so you can verify it's correct
console.log(`OMDb key loaded: ${API_KEY.slice(0, 3)}******`);

const MOVIES_FILE = path.join(process.cwd(), "src/data/movies.raw.jsonl");
const OUTPUT_FILE = path.join(process.cwd(), "src/data/movies.index.json");

// tiny helper to stay within OMDb free tier rate limits
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function omdbByTitleYear(title, year) {
  const base = "https://www.omdbapi.com/";
  const url1 = `${base}?t=${encodeURIComponent(title)}&y=${encodeURIComponent(
    year ?? ""
  )}&apikey=${API_KEY}`;
  const r1 = await fetch(url1);
  if (!r1.ok) throw new Error(`HTTP ${r1.status} for ${url1}`);
  const j1 = await r1.json();
  if (j1?.Response === "True") return j1;

  // fallback: try without year
  const url2 = `${base}?t=${encodeURIComponent(title)}&apikey=${API_KEY}`;
  const r2 = await fetch(url2);
  if (!r2.ok) throw new Error(`HTTP ${r2.status} for ${url2}`);
  return r2.json();
}

function loadRaw() {
  if (!fs.existsSync(MOVIES_FILE)) {
    console.error(`Missing source file: ${MOVIES_FILE}`);
    process.exit(1);
  }
  const lines = fs.readFileSync(MOVIES_FILE, "utf8").trim().split("\n");
  return lines.map((l) => JSON.parse(l));
}

function loadExistingIndex() {
  if (!fs.existsSync(OUTPUT_FILE)) return [];
  try {
    const text = fs.readFileSync(OUTPUT_FILE, "utf8");
    return JSON.parse(text);
  } catch (e) {
    console.warn("Could not read existing index, starting fresh:", e.message);
    return [];
  }
}

async function buildIndex() {
  const raw = loadRaw();
  const existing = loadExistingIndex();

  // Map existing by id for quick updates/skip
  const byId = new Map(existing.map((m) => [m.id, m]));

  let fetched = 0;
  let skipped = 0;
  let failures = 0;

  for (const m of raw) {
    const prev = byId.get(m.id);

    // Skip if we already have a valid poster
    if (prev?.poster && prev.poster !== "N/A") {
      skipped++;
      continue;
    }

    try {
      const data = await omdbByTitleYear(m.title, m.year);
      if (data?.Response === "True") {
        const poster =
          data.Poster && data.Poster !== "N/A" ? data.Poster : null;

        const updated = {
          id: m.id,
          title: m.title,
          year: m.year ?? data?.Year ? Number(data.Year) : undefined,
          genres: m.genres || [],
          cast: m.cast || [],
          meta: m.meta || undefined,
          poster,
        };
        byId.set(m.id, updated);

        fetched++;
        console.log(
          poster
            ? `Poster ✓  ${m.title}`
            : `No poster  ${m.title} (OMDb returned N/A)`
        );
      } else {
        failures++;
        console.warn(`OMDb miss  ${m.title}: ${data?.Error || "Unknown error"}`);
      }
    } catch (err) {
      failures++;
      console.warn(`Fetch error ${m.title}: ${err.message}`);
    }

    // Respect OMDb free tier: ~1 req/sec
    await sleep(1100);
  }

  // Write merged index (existing + new)
  const out = Array.from(byId.values());
  out.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2));
  console.log(
    `\nDone. Fetched: ${fetched}, Skipped: ${skipped}, Failures: ${failures}\nWrote ${out.length} movies → ${OUTPUT_FILE}`
  );
}

buildIndex();
