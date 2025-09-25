// src/lib/movies.ts
import fs from "fs";
import path from "path";

export type Movie = {
  id: string;
  title: string;
  year?: number;
  genres?: string[];
  cast?: any[];
  meta?: string;
};

let cache: Movie[] | null = null;

export function loadMovies(): Movie[] {
  if (cache) return cache;

  // Prefer JSONL if that’s what you built earlier:
  const jsonl = path.join(process.cwd(), "src/data/movies.raw.jsonl");
  const json = path.join(process.cwd(), "src/data/movies.index.json"); // ok if missing

  if (fs.existsSync(jsonl)) {
    const lines = fs.readFileSync(jsonl, "utf8").trim().split("\n");
    cache = lines.map(l => JSON.parse(l));
    return cache!;
  }

  if (fs.existsSync(json)) {
    cache = JSON.parse(fs.readFileSync(json, "utf8"));
    return cache!;
  }

  throw new Error("No movies dataset found (expected src/data/movies.raw.jsonl or movies.index.json)");
}
