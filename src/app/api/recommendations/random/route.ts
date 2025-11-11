import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

type Movie = {
  id: string;
  title: string;
  year?: number;
  genres?: string[];
  poster?: string | null;
  meta?: string;
};

let cachedMovieIds: string[] | null = null;

async function loadMovieIdsFromCredits(): Promise<string[]> {
  if (cachedMovieIds) return cachedMovieIds;
  
  try {
    const csvPath = join(process.cwd(), "data", "credits.csv");
    const csvContent = await readFile(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    if (lines.length <= 1) {
      // Fallback: get all IDs from movies.index.json
      const moviesRaw = await import("@/data/movies.index.json");
      const allMovies = (moviesRaw.default || moviesRaw) as Movie[];
      cachedMovieIds = allMovies.map(m => m.id);
      return cachedMovieIds;
    }
    
    // Parse CSV header to find ID column
    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const idColIndex = header.findIndex(h => h === "id" || h === "movie_id" || h === "tmdb_id");
    
    const movieIds: string[] = [];
    const seenIds = new Set<string>();
    
    // Extract movie IDs from CSV (skip header)
    for (let i = 1; i < Math.min(lines.length, 1000); i++) { // Limit to first 1000 rows for performance
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Simple CSV parsing - split by comma, but be careful with quoted fields
      const parts = line.split(",");
      if (idColIndex >= 0 && parts[idColIndex]) {
        const id = parts[idColIndex].trim().replace(/^"|"$/g, "");
        if (id && !seenIds.has(id)) {
          movieIds.push(id);
          seenIds.add(id);
        }
      } else if (parts[0]) {
        // Try first column as ID
        const id = parts[0].trim().replace(/^"|"$/g, "");
        if (id && !seenIds.has(id)) {
          movieIds.push(id);
          seenIds.add(id);
        }
      }
    }
    
    cachedMovieIds = movieIds.length > 0 ? movieIds : null;
    
    // If we got IDs from CSV, use them; otherwise fallback to movies.index.json
    if (!cachedMovieIds || cachedMovieIds.length === 0) {
      const moviesRaw = await import("@/data/movies.index.json");
      const allMovies = (moviesRaw.default || moviesRaw) as Movie[];
      cachedMovieIds = allMovies.map(m => m.id);
    }
    
    return cachedMovieIds;
  } catch (error) {
    console.error("Error loading credits CSV:", error);
    // Fallback to movies.index.json
    const moviesRaw = await import("@/data/movies.index.json");
    const allMovies = (moviesRaw.default || moviesRaw) as Movie[];
    cachedMovieIds = allMovies.map(m => m.id);
    return cachedMovieIds;
  }
}

export async function GET() {
  try {
    // Load movie IDs from credits.csv
    const movieIds = await loadMovieIdsFromCredits();
    
    // Load all movies from index
    const moviesRaw = await import("@/data/movies.index.json");
    const allMovies = (moviesRaw.default || moviesRaw) as Movie[];
    
    // Filter to only movies that exist in credits.csv (if we got IDs from CSV)
    // Otherwise, use all movies
    let candidateMovies = allMovies;
    if (cachedMovieIds && cachedMovieIds.length > 0 && cachedMovieIds.length < allMovies.length) {
      const idSet = new Set(movieIds);
      candidateMovies = allMovies.filter(m => idSet.has(m.id));
    }
    
    // If no matches, use all movies
    if (candidateMovies.length === 0) {
      candidateMovies = allMovies;
    }
    
    // Return random selection
    const shuffled = [...candidateMovies].sort(() => Math.random() - 0.5);
    const randomMovies = shuffled.slice(0, 20);
    
    return NextResponse.json({
      items: randomMovies.map(m => ({
        id: m.id,
        title: m.title,
        year: m.year,
        genres: m.genres ?? [],
        meta: m.meta,
        poster: m.poster ?? null,
      })),
    });
  } catch (error) {
    console.error("Error in random recommendations:", error);
    // Fallback to movies.index.json
    const moviesRaw = await import("@/data/movies.index.json");
    const allMovies = (moviesRaw.default || moviesRaw) as Movie[];
    const shuffled = [...allMovies].sort(() => Math.random() - 0.5);
    const randomMovies = shuffled.slice(0, 20);
    
    return NextResponse.json({
      items: randomMovies.map(m => ({
        id: m.id,
        title: m.title,
        year: m.year,
        genres: m.genres ?? [],
        meta: m.meta,
        poster: m.poster ?? null,
      })),
    });
  }
}

