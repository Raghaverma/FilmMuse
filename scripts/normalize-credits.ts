// Run: npx tsx scripts/normalize-credits.ts data/credits.csv
// Out: src/data/movies.raw.jsonl  (overwrites the previous one)

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";

type Row = { movie_id?: string; id?: string; title?: string; cast?: string; crew?: string };

const csvPath = process.argv[2];
if (!csvPath) { console.error("Usage: tsx scripts/normalize-credits.ts <credits.csv>"); process.exit(1); }

const outPath = path.join(process.cwd(), "src/data/movies.raw.jsonl");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const out = fs.createWriteStream(outPath, { encoding: "utf8" });

function safeJson<T>(s?: string | null, fallback: T = [] as unknown as T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

let idx = 0;
fs.createReadStream(csvPath)
  .pipe(parse({ columns: true }))
  .on("data", (row: Row) => {
    const castArr = safeJson<Array<{ name?: string }>>(row.cast);
    const crewArr = safeJson<Array<{ job?: string; name?: string }>>(row.crew);

    const cast = castArr.map(c => (c.name ?? "").trim()).filter(Boolean).slice(0, 8);
    const director = crewArr.find(c => (c.job ?? "").toLowerCase() === "director")?.name ?? "";

    const obj = {
      id: String(row.movie_id ?? row.id ?? `m-${idx}`),
      title: String(row.title ?? "").trim(),
      year: undefined as number | undefined,   // credits.csv doesn't include year
      genres: [] as string[],
      cast,
      director,
      keywords: [] as string[],
      overview: "",
    };

    if (obj.title) out.write(JSON.stringify(obj) + "\n");
    idx++;
  })
  .on("end", () => { out.end(); console.log(`Wrote ${idx} lines → ${outPath}`); })
  .on("error", (e) => { console.error(e); process.exit(1); });
