import { NextResponse } from "next/server";
import moviesRaw from "@/data/movies.index.json";

type Movie = {
  id: string;
  title: string;
  year?: number;
  genres?: string[];
  poster?: string | null;
  meta?: string;
};

let READY = false;
let ROWS: Movie[] = [];
const GENRE_MAP = new Map<string, Movie[]>();

function initOnce() {
  if (READY) return;
  ROWS = moviesRaw as Movie[];
  
  GENRE_MAP.clear();
  for (const m of ROWS) {
    for (const g of m.genres ?? []) {
      const key = g.toLowerCase();
      if (!GENRE_MAP.has(key)) GENRE_MAP.set(key, []);
      GENRE_MAP.get(key)!.push(m);
    }
  }
  READY = true;
}

export async function POST(req: Request) {
  initOnce();
  
  try {
    const body = await req.json();
    const { watchlist = [], liked = [] } = body;
    
    // Combine watchlist and liked movies
    const userMovies = [...watchlist, ...liked];
    
    if (userMovies.length === 0) {
      // If no user data, return random movies
      const shuffled = [...ROWS].sort(() => Math.random() - 0.5);
      return NextResponse.json({
        items: shuffled.slice(0, 20).map(m => ({
          id: m.id,
          title: m.title,
          year: m.year,
          genres: m.genres ?? [],
          meta: m.meta,
          poster: m.poster ?? null,
        })),
      });
    }
    
    // Extract genres from user's movies
    const userGenres = new Set<string>();
    for (const movie of userMovies) {
      // Try to find the movie in our database
      const found = ROWS.find(m => 
        m.id === movie.id || 
        (m.title.toLowerCase() === movie.title?.toLowerCase() && 
         (!movie.year || m.year === movie.year))
      );
      if (found?.genres) {
        found.genres.forEach(g => userGenres.add(g.toLowerCase()));
      }
    }
    
    // Find movies with similar genres
    const recommendations: Movie[] = [];
    const seenIds = new Set(userMovies.map(m => m.id));
    
    for (const genre of userGenres) {
      const genreMovies = GENRE_MAP.get(genre) ?? [];
      for (const movie of genreMovies) {
        if (!seenIds.has(movie.id)) {
          recommendations.push(movie);
          seenIds.add(movie.id);
        }
      }
    }
    
    // Shuffle and limit
    const shuffled = recommendations.sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, 30);
    
    return NextResponse.json({
      items: limited.map(m => ({
        id: m.id,
        title: m.title,
        year: m.year,
        genres: m.genres ?? [],
        meta: m.meta,
        poster: m.poster ?? null,
      })),
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    // Fallback to random movies
    const shuffled = [...ROWS].sort(() => Math.random() - 0.5);
    return NextResponse.json({
      items: shuffled.slice(0, 20).map(m => ({
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

