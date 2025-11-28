// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { validateRequest, movieSearchSchema } from "@/lib/validation";
import moviesRaw from "@/data/movies.index.json";
import { searchMovies, fetchCollection } from "@/lib/tmdb";

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

// Relevance ranking: prefix > token match > substring; stable alphabetical within tiers
function rankAndSort(pool: Row[], qn: string): Row[] {
  if (!qn) {
    // No query → alphabetical
    return [...pool].sort((a, b) => a.title.localeCompare(b.title));
  }

  const prefix: Row[] = [];
  const tokenMatch: Row[] = [];
  const sub: Row[] = [];
  const qnTokens = tokenizeTitle(qn);

  for (const r of pool) {
    if (r._lcTitle.startsWith(qn)) {
      prefix.push(r);
    } else {
      // Check if any token matches
      const hasTokenMatch = qnTokens.some(qt => 
        r._tokens.some(rt => rt.startsWith(qt) || rt.includes(qt))
      );
      
      if (hasTokenMatch) {
        tokenMatch.push(r);
      } else if (r._lcTitle.includes(qn)) {
        sub.push(r);
      }
    }
  }

  const byAlpha = (a: Row, b: Row) => a.title.localeCompare(b.title);
  prefix.sort(byAlpha);
  tokenMatch.sort(byAlpha);
  sub.sort(byAlpha);
  return prefix.concat(tokenMatch).concat(sub);
}

export async function GET(req: Request) {
  initOnce();

  try {
    const { searchParams } = new URL(req.url);
    const params = {
      q: searchParams.get("q") || undefined,
      genre: searchParams.get("genre") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };
    const validated = validateRequest(movieSearchSchema, params);
    const q = validated.q || "";
    const genre = validated.genre || "";
    const limit = validated.limit;
    const offset = validated.offset;

  let pool: Row[] = ROWS;
  if (genre) {
    const key = norm(genre);
    pool = GENRE_MAP.get(key) ?? [];
  }

  const qn = norm(q);
  let result = qn ? rankAndSort(pool, qn) : [...pool].sort((a, b) => a.title.localeCompare(b.title));
  
  // Always search TMDb when there's a query to get comprehensive results
  let tmdbResults: Array<{ id: string; title: string; year?: number; genres: string[]; meta?: string; poster: string | null }> = [];
  let source: "index" | "fallback" | "mixed" = "index";
  const collectionIds = new Set<number>();
  
  if (qn) {
    try {
      // Fetch multiple pages from TMDb to get more results
      const pagesToFetch = 3; // Fetch up to 3 pages (60 movies)
      const allTmdbMovies: Array<{ id: number; title: string; release_date?: string; poster_path?: string | null; overview?: string }> = [];
      
      for (let page = 1; page <= pagesToFetch; page++) {
        const tmdbData = await searchMovies(q.trim(), page);
        if (tmdbData && tmdbData.results.length > 0) {
          allTmdbMovies.push(...tmdbData.results);
          // Stop if we've reached the last page
          if (page >= tmdbData.total_pages) break;
        } else {
          break;
        }
      }
      
      if (allTmdbMovies.length > 0) {
        // Create a set of local movie IDs for deduplication
        const localIds = new Set(result.map(m => m.id.toLowerCase()));
        
        // Convert TMDb results to our format and filter out duplicates
        tmdbResults = allTmdbMovies
          .map((movie) => {
            const year = movie.release_date ? parseInt(movie.release_date.split("-")[0]) : undefined;
            const tmdbId = `tmdb-${movie.id}`;
            
            // Skip if this movie is already in local results
            if (localIds.has(tmdbId.toLowerCase()) || localIds.has(movie.id.toString())) {
              return null;
            }
            
            return {
              id: tmdbId,
              title: movie.title,
              year: year,
              genres: [],
              meta: movie.overview || undefined,
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            };
          })
          .filter((m): m is NonNullable<typeof m> => m !== null);
        
        // Check if any of the first few results belong to collections
        // Fetch full details for first 3 results to check for collections (with timeout)
        const moviesToCheck = allTmdbMovies.slice(0, 3);
        const checkPromises = moviesToCheck.map(async (movie) => {
          try {
            const KEY = process.env.TMDB_API_KEY;
            if (!KEY) return null;
            
            const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${KEY}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            
            try {
              const detailsRes = await fetch(detailsUrl, { signal: controller.signal });
              clearTimeout(timeout);
              if (detailsRes.ok) {
                const details = await detailsRes.json();
                return details.belongs_to_collection?.id || null;
              }
            } catch (error) {
              clearTimeout(timeout);
              return null;
            }
          } catch (error) {
            return null;
          }
          return null;
        });
        
        const collectionIdResults = await Promise.all(checkPromises);
        collectionIdResults.forEach(id => {
          if (id) collectionIds.add(id);
        });
        
        // Fetch collections and include all movies from them
        for (const collectionId of collectionIds) {
          try {
            const collection = await fetchCollection(collectionId);
            if (collection && collection.parts) {
              const existingIds = new Set([
                ...result.map(m => m.id.toLowerCase()),
                ...tmdbResults.map(m => m.id.toLowerCase()),
              ]);
              
              for (const part of collection.parts) {
                const tmdbId = `tmdb-${part.id}`;
                if (!existingIds.has(tmdbId.toLowerCase())) {
                  const year = part.release_date ? parseInt(part.release_date.split("-")[0]) : undefined;
                  tmdbResults.push({
                    id: tmdbId,
                    title: part.title,
                    year: year,
                    genres: [],
                    meta: undefined,
                    poster: part.poster_path ? `https://image.tmdb.org/t/p/w500${part.poster_path}` : null,
                  });
                }
              }
            }
          } catch (error) {
            // Silently fail - collection fetch is optional
            console.debug("[search] Failed to fetch collection:", error);
          }
        }
        
        // Merge results: local first, then TMDb
        result = [...result, ...tmdbResults.map(tr => ({
          id: tr.id,
          title: tr.title,
          year: tr.year,
          genres: tr.genres,
          poster: tr.poster,
          meta: tr.meta,
          _lcTitle: tr.title.toLowerCase(),
          _tokens: tokenizeTitle(tr.title),
        }))];
        
        source = result.length > tmdbResults.length ? "mixed" : "fallback";
      }
    } catch (error) {
      // Silently fail TMDb search - just use local results
      console.debug("[search] TMDb search failed:", error);
    }
  }

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
      source,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
