// src/lib/tmdb.ts
import "server-only";

const KEY = process.env.TMDB_API_KEY!;
if (!KEY) console.warn("[tmdb] TMDB_API_KEY missing");

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const API_BASE_URL = "https://api.themoviedb.org/3";

type TMDbSearchResult = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
};

type TMDbSearchResponse = {
  results: TMDbSearchResult[];
  total_results: number;
};

type TMDbMovieDetails = {
  id: number;
  title: string;
  release_date?: string;
  runtime?: number;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: Array<{ id: number; name: string }>;
  production_companies?: Array<{ id: number; name: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string }>;
  vote_average?: number;
  vote_count?: number;
  imdb_id?: string;
  budget?: number;
  revenue?: number;
  status?: string;
  tagline?: string;
  credits?: {
    cast?: Array<{ name: string; character?: string; order: number }>;
    crew?: Array<{ name: string; job: string }>;
  };
};

type TMDbMapped = {
  title: string;
  year?: number;
  runtime?: string;
  plot?: string;
  poster?: string | null;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  language?: string;
  country?: string;
  production?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  backdrop?: string | null;
  tagline?: string;
  budget?: number;
  revenue?: number;
};

type CacheEntry = { value: TMDbMapped | null; at: number };
const MAX = 1000;
const TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<TMDbMapped | null>>();

function k(title: string, year?: number) {
  return `tmdb::${title.trim().toLowerCase()}::${year ?? ""}`;
}

function getFresh(key: string): TMDbMapped | null | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function setCache(key: string, val: TMDbMapped | null) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, { value: val, at: Date.now() });
  if (cache.size > MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

async function fetchWithTimeout(url: string, ms = 5000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function findBestMatch(results: TMDbSearchResult[], year?: number): TMDbSearchResult | null {
  if (results.length === 0) return null;
  if (results.length === 1) return results[0];

  // If year is provided, try to find exact match first
  if (year) {
    const exactMatch = results.find((r) => {
      if (!r.release_date) return false;
      const releaseYear = parseInt(r.release_date.split("-")[0]);
      return releaseYear === year;
    });
    if (exactMatch) return exactMatch;
  }

  // Return first result (TMDb orders by relevance)
  return results[0];
}

function mapTMDbToStandard(details: TMDbMovieDetails): TMDbMapped {
  const year = details.release_date
    ? parseInt(details.release_date.split("-")[0])
    : undefined;

  const genre = details.genres?.map((g) => g.name).join(", ");
  const runtime = details.runtime ? `${details.runtime} min` : undefined;
  const poster = details.poster_path
    ? `${IMAGE_BASE_URL}/w500${details.poster_path}`
    : null;
  const backdrop = details.backdrop_path
    ? `${IMAGE_BASE_URL}/original${details.backdrop_path}`
    : null;

  const director =
    details.credits?.crew?.find((c) => c.job === "Director")?.name;
  const writers = details.credits?.crew
    ?.filter((c) => c.job === "Writer" || c.job === "Screenplay")
    .map((c) => c.name)
    .slice(0, 3)
    .join(", ");
  const actors = details.credits?.cast
    ?.slice(0, 5)
    .map((c) => c.name)
    .join(", ");

  const language = details.spoken_languages
    ?.map((l) => l.name)
    .join(", ");
  const country = details.production_countries
    ?.map((c) => c.name)
    .join(", ");
  const production = details.production_companies
    ?.map((c) => c.name)
    .join(", ");

  // TMDb vote_average is already on a 0-10 scale, so we don't need to divide
  // However, TMDb doesn't provide actual IMDb ratings - this is TMDb's own rating
  // We'll use it but note that actual IMDb rating should come from OMDb when available
  const imdbRating = details.vote_average
    ? details.vote_average.toFixed(1)
    : undefined;
  const imdbVotes = details.vote_count?.toString();

  return {
    title: details.title,
    year,
    runtime,
    plot: details.overview || undefined,
    poster,
    backdrop,
    genre,
    director,
    writer: writers,
    actors,
    language,
    country,
    production,
    imdbRating,
    imdbVotes,
    imdbID: details.imdb_id,
    tagline: details.tagline,
    budget: details.budget,
    revenue: details.revenue,
  };
}

/**
 * Fast, cached TMDb fetcher.
 * - Returns null on any error.
 * - Strong in-process cache + TTL.
 * - Coalesces concurrent requests for same (title, year).
 * - Uses search API first, then fetches full details.
 */
export async function fetchTmdbOnce(
  title: string,
  year?: number
): Promise<TMDbMapped | null> {
  const key = k(title, year);

  const fresh = getFresh(key);
  if (fresh !== undefined) return fresh;

  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    if (!KEY) {
      setCache(key, null);
      return null;
    }

    try {
      // Step 1: Search for movie
      const searchUrl = `${API_BASE_URL}/search/movie?api_key=${KEY}&query=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
      const searchRes = await fetchWithTimeout(searchUrl, 5000);

      if (!searchRes.ok) {
        setCache(key, null);
        return null;
      }

      const contentType = searchRes.headers.get("content-type");
      if (
        !contentType?.includes("application/json") &&
        !contentType?.includes("text/json")
      ) {
        setCache(key, null);
        return null;
      }

      const searchData = (await searchRes.json()) as TMDbSearchResponse;

      if (!searchData.results || searchData.results.length === 0) {
        setCache(key, null);
        return null;
      }

      // Step 2: Find best match
      const bestMatch = findBestMatch(searchData.results, year);
      if (!bestMatch) {
        setCache(key, null);
        return null;
      }

      // Step 3: Fetch full movie details
      const detailsUrl = `${API_BASE_URL}/movie/${bestMatch.id}?api_key=${KEY}&append_to_response=credits`;
      const detailsRes = await fetchWithTimeout(detailsUrl, 5000);

      if (!detailsRes.ok) {
        setCache(key, null);
        return null;
      }

      const detailsContentType = detailsRes.headers.get("content-type");
      if (
        !detailsContentType?.includes("application/json") &&
        !detailsContentType?.includes("text/json")
      ) {
        setCache(key, null);
        return null;
      }

      const detailsData = (await detailsRes.json()) as TMDbMovieDetails;

      // Step 4: Map to standard format
      const mapped = mapTMDbToStandard(detailsData);
      setCache(key, mapped);
      return mapped;
    } catch (error) {
      // Handle rate limits, network errors, etc.
      console.warn("[tmdb] Fetch error:", error);
      setCache(key, null);
      return null;
    }
  })();

  inflight.set(key, p);
  try {
    return await p;
  } finally {
    inflight.delete(key);
  }
}

/**
 * Fetch poster only (lighter weight, uses search API)
 */
export async function fetchTmdbPoster(
  title: string,
  year?: number
): Promise<string | null> {
  if (!KEY) return null;

  try {
    const searchUrl = `${API_BASE_URL}/search/movie?api_key=${KEY}&query=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
    const searchRes = await fetchWithTimeout(searchUrl, 5000);

    if (!searchRes.ok) return null;

    const contentType = searchRes.headers.get("content-type");
    if (
      !contentType?.includes("application/json") &&
      !contentType?.includes("text/json")
    ) {
      return null;
    }

    const searchData = (await searchRes.json()) as TMDbSearchResponse;

    if (!searchData.results || searchData.results.length === 0) return null;

    const bestMatch = findBestMatch(searchData.results, year);
    if (!bestMatch || !bestMatch.poster_path) return null;

    return `${IMAGE_BASE_URL}/w500${bestMatch.poster_path}`;
  } catch {
    return null;
  }
}

