"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Shuffle } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Movie = {
  id: string;
  title: string;
  year?: number;
  meta?: string;
  poster?: string | null;
};

type ApiResponse = {
  items: Movie[];
  total: number;
  nextOffset: number | null;
  source?: "index" | "fallback";
};

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
  "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western",
] as const;

const PAGE_SIZE = 30;
const DEBOUNCE_MS = 500;

// Cache to prevent duplicate fetches
const searchCache = new Map<string, { data: ApiResponse; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

export default function SearchPage() {
  const searchParams = useSearchParams();
  
  // Get initial values from URL
  const initialQuery = React.useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);
  const initialGenre = React.useMemo(() => (searchParams.get("genre") || "").trim(), [searchParams]);

  const [query, setQuery] = React.useState(initialQuery);
  const [genre, setGenre] = React.useState<string>(initialGenre);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  
  const [results, setResults] = React.useState<Movie[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [nextOffset, setNextOffset] = React.useState<number | null>(null);
  const [usedFallback, setUsedFallback] = React.useState<boolean>(false);
  
  const [randomMovie, setRandomMovie] = React.useState<Movie | null>(null);
  const [isRandomModalOpen, setIsRandomModalOpen] = React.useState(false);
  
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const hasSearchedRef = React.useRef(false);

  // Debounce query input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Build cache key
  const getCacheKey = React.useCallback((q: string, g: string, offset: number) => {
    return `${q}::${g}::${offset}`;
  }, []);

  // Search function with caching
  const performSearch = React.useCallback(async (
    searchQuery: string,
    searchGenre: string,
    offset: number = 0,
    reset: boolean = true
  ) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = getCacheKey(searchQuery, searchGenre, offset);
    const cached = searchCache.get(cacheKey);
    
    // Check cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const data = cached.data;
      setResults(prev => reset ? data.items : [...prev, ...data.items]);
      setTotal(data.total);
      setNextOffset(data.nextOffset);
      setUsedFallback(data.source === "fallback");
      setLoading(false);
      setError(null);
      return;
    }

    // Create new abort controller
    const ac = new AbortController();
    abortControllerRef.current = ac;

    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/search", window.location.origin);
      if (searchQuery) url.searchParams.set("q", searchQuery);
      if (searchGenre) url.searchParams.set("genre", searchGenre);
      url.searchParams.set("limit", String(PAGE_SIZE));
      url.searchParams.set("offset", String(offset));

      const res = await fetch(url.toString(), {
        method: "GET",
        signal: ac.signal,
        cache: "force-cache", // Use cache for same requests
      });

      if (ac.signal.aborted) return;

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;

      if (ac.signal.aborted) return;

      // Cache the result
      searchCache.set(cacheKey, { data, timestamp: Date.now() });

      setResults(prev => reset ? data.items : [...prev, ...data.items]);
      setTotal(data.total);
      setNextOffset(data.nextOffset);
      setUsedFallback(data.source === "fallback");

      // Update URL without triggering navigation
      const newUrl = new URL(window.location.href);
      if (searchQuery) {
        newUrl.searchParams.set("q", searchQuery);
      } else {
        newUrl.searchParams.delete("q");
      }
      if (searchGenre) {
        newUrl.searchParams.set("genre", searchGenre);
      } else {
        newUrl.searchParams.delete("genre");
      }
      window.history.replaceState({}, "", newUrl.toString());

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      
      if (reset) {
        setResults([]);
        setTotal(0);
        setNextOffset(null);
      }
    } finally {
      if (!ac.signal.aborted) {
        setLoading(false);
      }
    }
  }, [getCacheKey]);

  // Track if we've done initial search
  const isInitialMount = React.useRef(true);

  // Initial search from URL params (only once on mount)
  React.useEffect(() => {
    if (initialQuery || initialGenre) {
      hasSearchedRef.current = true;
      performSearch(initialQuery, initialGenre, 0, true);
    }
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Search when debounced query or genre changes (but not on initial mount)
  React.useEffect(() => {
    // Skip initial mount - handled by the effect above
    if (isInitialMount.current) {
      return;
    }

    // Search if there's a query OR a genre selected
    if (debouncedQuery || genre) {
      hasSearchedRef.current = true;
      performSearch(debouncedQuery, genre, 0, true);
    } else if (hasSearchedRef.current) {
      // Clear results if both are empty and we've searched before
      setResults([]);
      setTotal(0);
      setNextOffset(null);
      setError(null);
      hasSearchedRef.current = false;
    }
  }, [debouncedQuery, genre, performSearch]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query.trim(), genre, 0, true);
  }, [query, genre, performSearch]);

  const handleClear = React.useCallback(() => {
    setQuery("");
    setGenre("");
    setResults([]);
    setTotal(0);
    setNextOffset(null);
    setError(null);
    hasSearchedRef.current = false;
    
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("q");
    newUrl.searchParams.delete("genre");
    window.history.replaceState({}, "", newUrl.toString());
  }, []);

  const handleLoadMore = React.useCallback(() => {
    if (nextOffset !== null && !loading) {
      performSearch(debouncedQuery, genre, nextOffset, false);
    }
  }, [nextOffset, loading, debouncedQuery, genre, performSearch]);

  const handleRandom = React.useCallback(async () => {
    try {
      const res = await fetch("/api/movie/random");
      if (!res.ok) throw new Error("Failed to get random movie");
      const movie = await res.json();
      setRandomMovie(movie);
      setIsRandomModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get random movie");
    }
  }, []);

  const handleUpdate = React.useCallback(() => {
    // No-op for now
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <Link href="/" aria-label="Go to Home">
            <Button type="button" className="bg-white/10 hover:bg-white/15 text-neutral-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Search</h1>
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm text-neutral-300 hover:text-white">
              Profile
            </Link>
            <Link href="/logout" className="text-sm text-neutral-300 hover:text-white">
              Logout
            </Link>
          </div>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[200px_1fr_auto]">
            {/* Genre Filter */}
            <Select
              value={genre || "all"}
              onValueChange={(v) => {
                const newGenre = v === "all" ? "" : v;
                setGenre(newGenre);
                // Immediately trigger search when genre changes
                if (newGenre) {
                  performSearch(query.trim(), newGenre, 0, true);
                } else {
                  performSearch(query.trim(), "", 0, true);
                }
              }}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] text-neutral-100">
                <SelectItem value="all">All genres</SelectItem>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, mood, or vibe..."
                className="bg-white/5 pl-9 border-white/10 focus-visible:ring-emerald-400"
                aria-label="Search movies"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                className="bg-emerald-400 text-black hover:bg-emerald-300"
                disabled={loading}
              >
                {loading ? "Searching…" : "Search"}
              </Button>
              <Button
                type="button"
                onClick={handleRandom}
                className="bg-purple-500 hover:bg-purple-600 text-white"
                title="Get a random movie"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                className="bg-white/10 hover:bg-white/15 text-neutral-200"
                disabled={loading && results.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={view === "grid" ? "default" : "secondary"}
              className={view === "grid" ? "bg-emerald-400 text-black hover:bg-emerald-300" : "bg-white/10 hover:bg-white/15 text-neutral-200"}
              onClick={() => setView("grid")}
            >
              Grid
            </Button>
            <Button
              type="button"
              variant={view === "list" ? "default" : "secondary"}
              className={view === "list" ? "bg-emerald-400 text-black hover:bg-emerald-300" : "bg-white/10 hover:bg-white/15 text-neutral-200"}
              onClick={() => setView("list")}
            >
              List
            </Button>
          </div>
        </form>

        {/* Status */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {loading ? (
            <p className="text-sm text-neutral-400">Searching...</p>
          ) : (
            <>
              <p className="text-sm text-neutral-400">
                {total > 0 ? (
                  <>
                    {results.length}{total ? ` of ${total}` : ""} result{(total || results.length) > 1 ? "s" : ""} found
                    {genre && ` • Genre: ${genre}`}
                  </>
                ) : genre ? (
                  <>
                    No results found for genre: <span className="text-emerald-400">{genre}</span>
                    <span className="text-xs text-neutral-500 ml-2">(Try a different genre or search by title)</span>
                  </>
                ) : query ? (
                  "No results found. Try a different search."
                ) : (
                  "Enter a search query or select a genre to get started."
                )}
              </p>
              {usedFallback && (
                <span className="text-xs text-amber-300">
                  Using starter dataset
                </span>
              )}
            </>
          )}
        </div>

        {/* Results */}
        <section>
          {loading && results.length === 0 ? (
            <div className={view === "grid" 
              ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid gap-3"
            }>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-white/10 bg-white/5">
                  <div className={view === "grid" ? "aspect-[2/3] bg-white/10" : "h-20 bg-white/10"} />
                  <div className="p-3">
                    <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-12 text-center">
              <p className="text-neutral-400 mb-2">
                {genre && !query 
                  ? `No movies found with genre "${genre}". The movie database may not have genre information populated. Try searching by title instead.`
                  : query && genre
                  ? `No results found for "${query}" in genre "${genre}". Try a different search or genre.`
                  : query
                  ? `No results found for "${query}". Try a different search.`
                  : "Enter a search query or select a genre to get started."
                }
              </p>
              {genre && (
                <Button
                  onClick={() => {
                    setGenre("");
                    setQuery("");
                    handleClear();
                  }}
                  className="mt-4 bg-emerald-400 text-black hover:bg-emerald-300"
                >
                  Clear filters and show all movies
                </Button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((movie) => (
                <MovieCard
                  key={movie.id || `${movie.title}-${movie.year}`}
                  id={movie.id}
                  title={movie.title}
                  year={movie.year}
                  poster={movie.poster}
                  meta={movie.meta}
                  showInteraction={true}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {results.map((movie) => (
                <div
                  key={movie.id || `${movie.title}-${movie.year}`}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    year={movie.year}
                    poster={movie.poster}
                    meta={movie.meta}
                    showInteraction={true}
                    onUpdate={handleUpdate}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {nextOffset !== null && !loading && (
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                onClick={handleLoadMore}
                className="bg-white/10 hover:bg-white/15 text-neutral-200"
              >
                Load more
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Random Movie Modal */}
      {randomMovie && (
        <MovieDetailsModal
          movie={{
            id: randomMovie.id,
            title: randomMovie.title,
            year: randomMovie.year,
            poster: randomMovie.poster ?? null,
            meta: randomMovie.meta,
          }}
          isOpen={isRandomModalOpen}
          onClose={() => {
            setIsRandomModalOpen(false);
            setRandomMovie(null);
          }}
          onUpdate={handleUpdate}
        />
      )}
    </main>
  );
}
