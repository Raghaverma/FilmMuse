import "server-only";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

export type Movie = {
  id: string;
  title: string;
  year?: number;
  genres: string[];
  cast: string[];
  director: string;
  keywords: string[];
  overview: string;
  popularity?: number;
  rating?: number;
  poster?: string;
};

let CACHE: Movie[] | null = null;

export async function loadAllMovies(): Promise<Movie[]> {
  if (CACHE) return CACHE;

  const file = path.join(process.cwd(), "src/data/movies.raw.jsonl");
  if (!fs.existsSync(file)) {
    throw new Error("movies.raw.jsonl not found. Run the normalize script first.");
  }

  const rl = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
  const all: Movie[] = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    try { all.push(JSON.parse(line)); } catch {}
  }
  CACHE = all;
  return CACHE;
}
