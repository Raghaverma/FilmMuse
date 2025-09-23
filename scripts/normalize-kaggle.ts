// Run: npx tsx scripts/normalize-kaggle.ts data/movies.csv
// Out: src/data/movies.raw.jsonl (one JSON object per line)

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";

type Row = Record<string, string>;

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: tsx scripts/normalize-kaggle.ts <csvFile>");
  process.exit(1);
}

const outPath = path.join(process.cwd(), "src/data/movies.raw.jsonl");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const out = fs.createWriteStream(outPath, { encoding: "utf8" });

function field(obj: Row, ...candidates: string[]) {
  for (const k of candidates) if (obj[k] != null) return String(obj[k]);
  return "";
}

function clean(r: Row, idx: number) {
  const title = field(r, "title", "Title", "name").trim();
  const yearStr = field(r, "year", "Year", "release_year", "release_date");
  const year = yearStr.match(/\d{4}/)?.[0];
  const genres = field(r, "genres", "Genres").split(/[|,]/).map(s=>s.trim()).filter(Boolean);
  const cast = field(r, "cast", "actors", "Actors", "Cast").split(/[|,]/).map(s=>s.trim()).filter(Boolean).slice(0,8);
  const director = field(r, "director", "Director", "directors").split(/[|,]/)[0]?.trim() ?? "";
  const overview = field(r, "overview", "plot", "Plot", "description", "Synopsis").trim();

  return {
    id: field(r, "id", "imdb_id", "movie_id") || `m-${idx}`,
    title,
    year: year ? Number(year) : undefined,
    genres,
    cast,
    director,
    keywords: [] as string[],
    overview,
  };
}

let idx = 0;
fs.createReadStream(csvPath)
  .pipe(parse({ columns: true }))
  .on("data", (row: Row) => {
    const obj = clean(row, idx++);
    if (obj.title) out.write(JSON.stringify(obj) + "\n");
  })
  .on("end", () => { out.end(); console.log(`Wrote ${idx} lines → ${outPath}`); })
  .on("error", (e) => { console.error(e); process.exit(1); });
