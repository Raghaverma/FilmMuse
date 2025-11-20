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

type ScoredMovie = Movie & { score: number };

// Global state - initialized once
let READY = false;
let ROWS: Movie[] = [];
const GENRE_MAP = new Map<string, Movie[]>(); // genre -> movies[]
const MOVIE_BY_ID = new Map<string, Movie>(); // id -> movie (O(1) lookup)
const MOVIE_BY_TITLE_YEAR = new Map<string, Movie>(); // "title|year" -> movie (O(1) lookup)
let GENRE_FREQUENCY = new Map<string, number>(); // genre -> count (for IDF weighting)

/**
 * Initialize data structures once on first request
 * Creates optimized lookup maps for O(1) access
 */
function initOnce() {
  if (READY) return;
  
  ROWS = moviesRaw as Movie[];
  
  // Clear all maps
  GENRE_MAP.clear();
  MOVIE_BY_ID.clear();
  MOVIE_BY_TITLE_YEAR.clear();
  GENRE_FREQUENCY.clear();
  
  // Build genre map and frequency counter
  for (const m of ROWS) {
    // Index by ID
    MOVIE_BY_ID.set(m.id, m);
    
    // Index by title+year for fallback lookup
    const titleKey = `${(m.title || "").toLowerCase()}|${m.year || ""}`;
    MOVIE_BY_TITLE_YEAR.set(titleKey, m);
    
    // Build genre index and count frequency
    for (const g of m.genres ?? []) {
      const key = g.toLowerCase();
      
      if (!GENRE_MAP.has(key)) {
        GENRE_MAP.set(key, []);
      }
      GENRE_MAP.get(key)!.push(m);
      
      // Count genre frequency (for IDF weighting)
      GENRE_FREQUENCY.set(key, (GENRE_FREQUENCY.get(key) || 0) + 1);
    }
  }
  
  READY = true;
}

/**
 * Fast O(1) movie lookup by ID or title+year
 */
function findMovie(movie: { id?: string; title?: string; year?: number }): Movie | null {
  // Try ID first (fastest)
  if (movie.id && MOVIE_BY_ID.has(movie.id)) {
    return MOVIE_BY_ID.get(movie.id)!;
  }
  
  // Fallback to title+year lookup
  if (movie.title) {
    const titleKey = `${movie.title.toLowerCase()}|${movie.year || ""}`;
    if (MOVIE_BY_TITLE_YEAR.has(titleKey)) {
      return MOVIE_BY_TITLE_YEAR.get(titleKey)!;
    }
  }
  
  return null;
}

/**
 * Calculate Inverse Document Frequency (IDF) weight for a genre
 * Rare genres get higher weight, common genres get lower weight
 */
function getGenreWeight(genre: string, totalMovies: number): number {
  const genreCount = GENRE_FREQUENCY.get(genre) || 1;
  // IDF = log(total / genre_count)
  // Higher for rare genres, lower for common ones
  return Math.log(totalMovies / genreCount);
}

/**
 * Fisher-Yates shuffle algorithm - proper random shuffle
 * More efficient and truly random than sort(() => Math.random() - 0.5)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Optimized recommendation algorithm with scoring system
 * 
 * Algorithm:
 * 1. Extract genres from user's watchlist/liked movies (O(n) with O(1) lookups)
 * 2. Calculate genre frequency in user preferences
 * 3. Score all candidate movies based on:
 *    - Number of matching genres (more = higher score)
 *    - Genre frequency weighting (user's preferred genres = higher weight)
 *    - Genre rarity (rare genres = higher weight via IDF)
 * 4. Sort by score (descending)
 * 5. Apply diversity: limit movies per genre to ensure variety
 * 6. Return top recommendations
 */
import { validateRequest, recommendationsSchema } from "@/lib/validation";

export async function POST(req: Request) {
  initOnce();
  
  try {
    const body = await req.json();
    const validated = validateRequest(recommendationsSchema, body);
    const { watchlist = [], liked = [] } = validated;
    
    // Combine watchlist and liked movies
    const userMovies = [...watchlist, ...liked];
    
    // If no user data, return random movies using Fisher-Yates shuffle
    if (userMovies.length === 0) {
      const shuffled = shuffleArray(ROWS);
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
    
    // Step 1: Extract genres from user's movies with O(1) lookups
    const userGenreFrequency = new Map<string, number>(); // genre -> count in user's list
    const userMovieIds = new Set<string>(userMovies.map(m => m.id));
    const totalMovies = ROWS.length;
    
    for (const movie of userMovies) {
      const found = findMovie(movie);
      if (found?.genres) {
        for (const g of found.genres) {
          const key = g.toLowerCase();
          userGenreFrequency.set(key, (userGenreFrequency.get(key) || 0) + 1);
        }
      }
    }
    
    // If no genres found, return random
    if (userGenreFrequency.size === 0) {
      const shuffled = shuffleArray(ROWS);
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
    
    // Step 2: Score all candidate movies
    const scoredMovies = new Map<string, ScoredMovie>(); // id -> scored movie
    
    // Iterate through user's preferred genres
    for (const [genre, userFreq] of userGenreFrequency.entries()) {
      const genreMovies = GENRE_MAP.get(genre) ?? [];
      const genreWeight = getGenreWeight(genre, totalMovies);
      const userPreferenceWeight = Math.log(userFreq + 1); // Log scale for user frequency
      
      // Score each movie in this genre
      for (const movie of genreMovies) {
        if (userMovieIds.has(movie.id)) continue; // Skip user's own movies
        
        const existing = scoredMovies.get(movie.id);
        
        // Calculate score components
        const matchingGenres = (movie.genres ?? []).filter(g => 
          userGenreFrequency.has(g.toLowerCase())
        ).length;
        
        // Score = (matching genres) * (genre rarity) * (user preference)
        const score = matchingGenres * genreWeight * userPreferenceWeight;
        
        if (existing) {
          // Movie already scored from another genre - add to score
          existing.score += score;
        } else {
          scoredMovies.set(movie.id, { ...movie, score });
        }
      }
    }
    
    // Step 3: Convert to array and sort by score (descending)
    const recommendations = Array.from(scoredMovies.values())
      .sort((a, b) => b.score - a.score);
    
    // Step 4: Apply diversity - limit movies per genre to ensure variety
    const genreCounts = new Map<string, number>(); // genre -> count in results
    const MAX_PER_GENRE = 5; // Max movies per genre in final results
    const diverseRecommendations: ScoredMovie[] = [];
    
    for (const movie of recommendations) {
      if (diverseRecommendations.length >= 30) break; // Early termination
      
      const movieGenres = movie.genres ?? [];
      let canAdd = true;
      
      // Check if adding this movie would exceed genre limits
      for (const g of movieGenres) {
        const key = g.toLowerCase();
        const count = genreCounts.get(key) || 0;
        if (count >= MAX_PER_GENRE) {
          canAdd = false;
          break;
        }
      }
      
      if (canAdd) {
        diverseRecommendations.push(movie);
        // Update genre counts
        for (const g of movieGenres) {
          const key = g.toLowerCase();
          genreCounts.set(key, (genreCounts.get(key) || 0) + 1);
        }
      }
    }
    
    // If we don't have enough diverse recommendations, fill with top-scoring movies
    if (diverseRecommendations.length < 30) {
      const remaining = recommendations
        .filter(m => !diverseRecommendations.some(d => d.id === m.id))
        .slice(0, 30 - diverseRecommendations.length);
      diverseRecommendations.push(...remaining);
    }
    
    // Step 5: Final shuffle for variety (optional, but adds randomness)
    const finalResults = shuffleArray(diverseRecommendations.slice(0, 30));
    
    return NextResponse.json({
      items: finalResults.map(m => ({
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
    const shuffled = shuffleArray(ROWS);
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

