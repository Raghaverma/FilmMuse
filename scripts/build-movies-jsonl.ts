// scripts/build-movies-jsonl.ts
import { promises as fs } from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type Row = Record<string, string>;

function safeParseGenres(input: string | undefined): string[] {
  if (!input) return [];
  // Kaggle movies_metadata.csv stores genres as a stringified JSON array of objects
  // like: [{"id": 28, "name": "Action"}, ...]
  try {
    const arr = JSON.parse(input) as Array<{ name?: string }>;
    return arr.map((g) => g?.name).filter(Boolean) as string[];
  } catch {
    // fallback: "Action|Adventure"
    return input.split(/[|;,]/).map((s) => s.trim()).filter(Boolean);
  }
}

function yearFromDate(d?: string): number | undefined {
  if (!d) return undefined;
  const m = d.match(/^(\d{4})/);
  return m ? Number(m[1]) : undefined;
}

async function main() {
  const inPath = process.argv[2] || path.join(process.cwd(), "data", "movies_metadata.csv");
  const outPath = path.join(process.cwd(), "src", "data", "movies.raw.jsonl");

  const csv = await fs.readFile(inPath, "utf8");
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }) as Row[];

  const out: string[] = [];

  for (const r of rows) {
    const id = (r["id"] || r["movie_id"] || r["imdb_id"] || r["tconst"] || "").toString().trim();
    const title = (r["title"] || r["original_title"] || r["name"] || "").toString().trim();
    if (!title) continue;

    const genres = safeParseGenres(r["genres"]);
    const runtime = Number(r["runtime"]) || undefined;
    const metaPieces = [
      genres.length ? genres.join(", ") : undefined,
      typeof runtime === "number" && runtime > 0 ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : undefined,
    ].filter(Boolean);

    const obj = {
      id: id || title.toLowerCase().replace(/\s+/g, "-"),
      title,
      year: (yearFromDate(r["release_date"]) ?? Number(r["release_year"])) || undefined,
      meta: metaPieces.join(" • ") || undefined,
      poster: r["poster_path"] && r["poster_path"].startsWith("/")
        ? r["poster_path"]
        : undefined,
    };

    out.push(JSON.stringify(obj));
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, out.join("\n"), "utf8");
  console.log(`Wrote ${out.length} lines → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
