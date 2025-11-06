// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import moviesRaw from "@/data/movies.index.json";

/**
 * EXPECTED SHAPE in movies.index.json (examples):
 * [
 *   { id: "299534", title: "Avengers: Endgame", year: 2019, genres: ["Action","Adventure","Sci-Fi"], poster: null, meta: "..." },
 *   ...
 * ]
 */

type Movie = {
  id: string;
  title: string;
  year?: number;
  genres?: string[];
  poster?: string | null;
  meta?: string;
};

type Row = Movie & {
  _lcTitle: string;      // lowercased title
  _tokens: string[];     // tokenized title
};

let READY = false;
let ROWS: Row[] = [];
const GENRE_MAP = new Map<string, Row[]>(); // key = lowercased genre

function norm(s: string) {
  return s.trim().toLowerCase();
}

function tokenizeTitle(s: string) {
  return s.toLowerCase().split(/[\s:\-\/.,'"]+/).filter(Boolean);
}

function initOnce() {
  if (READY) return;

  const arr = moviesRaw as Movie[];

  ROWS = arr.map((m) => {
    const _lcTitle = (m.title || "").toLowerCase();
    const _tokens = tokenizeTitle(m.title || "");
    return { ...m, _lcTitle, _tokens };
  });

  GENRE_MAP.clear();
  for (const r of ROWS) {
    for (const g of r.genres ?? []) {
      const key = norm(g); // FORCE normalization to lowercase
      if (!GENRE_MAP.has(key)) GENRE_MAP.set(key, []);
      GENRE_MAP.get(key)!.push(r);
    }
  }

  // Optional: quick sanity peek
  if (process.env.NODE_ENV !== "production") {
    const sample = Array.from(GENRE_MAP.keys()).slice(0, 15).join(", ");
    console.log(`[search] Genres indexed (${GENRE_MAP.size}): ${sample}${GENRE_MAP.size > 15 ? ", ..." : ""}`);
  }

  READY = true;
}

function parseNum(n: string | null, fallback: number, min: number, max: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, v));
}

// Relevance ranking: prefix > substring; stable alphabetical within tiers
function rankAndSort(pool: Row[], qn: string): Row[] {
  if (!qn) {
    // No query → alphabetical
    return [...pool].sort((a, b) => a.title.localeCompare(b.title));
  }

  const prefix: Row[] = [];
  const sub: Row[] = [];

  for (const r of pool) {
    if (r._lcTitle.startsWith(qn)) prefix.push(r);
    else if (r._lcTitle.includes(qn)) sub.push(r);
  }

  const byAlpha = (a: Row, b: Row) => a.title.localeCompare(b.title);
  prefix.sort(byAlpha);
  sub.sort(byAlpha);
  return prefix.concat(sub);
}

export async function GET(req: Request) {
  initOnce();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const limit = parseNum(searchParams.get("limit"), 30, 1, 100);
  const offset = parseNum(searchParams.get("offset"), 0, 0, 1000000);

  let pool: Row[] = ROWS;
  if (genre) {
    const key = norm(genre);
    pool = GENRE_MAP.get(key) ?? [];
  }

  const qn = norm(q);
  const result = qn ? rankAndSort(pool, qn) : [...pool].sort((a, b) => a.title.localeCompare(b.title));

  const total = result.length;
  const slice = result.slice(offset, offset + limit);

  // IMPORTANT: do NOT fetch OMDb here. Only return local fields.
  const items = slice.map((m) => ({
    id: m.id,
    title: m.title,
    year: m.year,
    genres: m.genres ?? [],
    meta: m.meta,
    poster: m.poster ?? null, // may be null → client can lazy-load via /api/poster
  }));

  return NextResponse.json({
    items,
    total,
    nextOffset: offset + limit < total ? offset + limit : null,
    source: "index",
  });
}
