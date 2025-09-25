// scripts/build-raw-from-credits.ts
/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import readline from "readline";

const CANDIDATE_PATHS = [
  path.join(process.cwd(), "data", "credits.csv"),
  path.join(process.cwd(), "src", "data", "credits.csv"),
  path.join(process.cwd(), "credits.csv"),
];

function findCreditsPath(): string | null {
  for (const p of CANDIDATE_PATHS) {
    if (fs.existsSync(p) && fs.statSync(p).size > 0) return p;
  }
  return null;
}

const OUT_DIR = path.join(process.cwd(), "src", "data");
const OUT_JSONL = path.join(OUT_DIR, "movies.raw.jsonl");

// Minimal CSV splitter that respects double quotes.
function* splitCSV(line: string): Generator<string> {
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // toggle quoting (CSV escapes quotes by doubling them "" inside a quoted field)
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++; // skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      yield cur;
      cur = "";
      continue;
    }
    cur += ch;
  }
  yield cur;
}

async function main() {
  const CREDITS_CSV = findCreditsPath();
  if (!CREDITS_CSV) {
    console.error("credits.csv not found. Searched:");
    for (const p of CANDIDATE_PATHS) console.error(" - " + p);
    process.exit(1);
  }

  const size = fs.statSync(CREDITS_CSV).size;
  console.log(`Using: ${CREDITS_CSV} (${size} bytes)`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const inStream = fs.createReadStream(CREDITS_CSV, { encoding: "utf8" });
  const rl = readline.createInterface({ input: inStream, crlfDelay: Infinity });

  let header: string[] | null = null;
  let wrote = 0;
  let lineNo = 0;
  let skippedNoId = 0;
  let skippedNoTitle = 0;
  let colIdName = "movie_id"; // default for Kaggle TMDB credits
  let colTitleName = "title";

  const out = fs.createWriteStream(OUT_JSONL, { encoding: "utf8" });

  for await (const rawLine of rl) {
    const line = rawLine.replace(/^\uFEFF/, ""); // strip BOM if present
    lineNo++;

    if (lineNo === 1) {
      header = Array.from(splitCSV(line)).map((h) => h.trim());
      // Determine column names
      if (!header.includes("movie_id") && header.includes("id")) colIdName = "id";
      console.log("Detected header:", header.join(", "));
      console.log(`Using ID column: ${colIdName}, Title column: ${colTitleName}`);
      continue;
    }
    if (!header) continue;

    const cols = Array.from(splitCSV(line));
    if (cols.length !== header.length) {
      // likely a malformed row; ignore quietly
      continue;
    }

    const row: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = cols[i];

    const id = row[colIdName]?.trim();
    const title = row[colTitleName]?.trim();

    if (!id) {
      skippedNoId++;
      continue;
    }
    if (!title) {
      skippedNoTitle++;
      continue;
    }

    // Keep cast/crew raw JSON strings for now (they contain commas but we preserved them via splitter)
    const castStr = (row["cast"] ?? "[]").trim();
    const crewStr = (row["crew"] ?? "[]").trim();

    const obj = {
      id,                 // string form is fine; you can Number() later if needed
      title,
      release_date: null, // credits.csv doesn't carry this
      genres: [],         // to be enriched later if you have movies_metadata.csv
      cast: castStr,
      crew: crewStr,
      poster: null,
      imdb_id: null,
    };

    out.write(JSON.stringify(obj) + "\n");
    wrote++;
  }

  out.end();
  await new Promise((res) => out.on("close", res));

  console.log(`Wrote ${wrote} lines → ${OUT_JSONL}`);
  console.log(`Skipped with no ${colIdName}: ${skippedNoId}`);
  console.log(`Skipped with no title: ${skippedNoTitle}`);

  if (wrote === 0) {
    console.error(
      "Result is empty. Check that your header has either 'movie_id' or 'id' and a 'title' column, and that rows are populated."
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
