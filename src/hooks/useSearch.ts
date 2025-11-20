import * as React from "react";

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

const PAGE_SIZE = 30;
const DEBOUNCE_MS = 500;
const CACHE_TTL = 60000;

const searchCache = new Map<string, { data: ApiResponse; timestamp: number }>();

export function useSearch(initialQuery: string, initialGenre: string) {
  const [query, setQuery] = React.useState(initialQuery);
  const [genre, setGenre] = React.useState<string>(initialGenre);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);
  
  const [results, setResults] = React.useState<Movie[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [nextOffset, setNextOffset] = React.useState<number | null>(null);
  const [usedFallback, setUsedFallback] = React.useState<boolean>(false);
  
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const hasSearchedRef = React.useRef(false);
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const getCacheKey = React.useCallback((q: string, g: string, offset: number) => {
    return `${q}::${g}::${offset}`;
  }, []);

  const performSearch = React.useCallback(async (
    searchQuery: string,
    searchGenre: string,
    offset: number = 0,
    reset: boolean = true
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = getCacheKey(searchQuery, searchGenre, offset);
    const cached = searchCache.get(cacheKey);
    
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
        cache: "force-cache",
      });

      if (ac.signal.aborted) return;

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;

      if (ac.signal.aborted) return;

      searchCache.set(cacheKey, { data, timestamp: Date.now() });

      setResults(prev => reset ? data.items : [...prev, ...data.items]);
      setTotal(data.total);
      setNextOffset(data.nextOffset);
      setUsedFallback(data.source === "fallback");

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

  React.useEffect(() => {
    if (initialQuery || initialGenre) {
      hasSearchedRef.current = true;
      performSearch(initialQuery, initialGenre, 0, true);
    }
    isInitialMount.current = false;
  }, []);

  React.useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    if (debouncedQuery || genre) {
      hasSearchedRef.current = true;
      performSearch(debouncedQuery, genre, 0, true);
    } else if (hasSearchedRef.current) {
      setResults([]);
      setTotal(0);
      setNextOffset(null);
      setError(null);
      hasSearchedRef.current = false;
    }
  }, [debouncedQuery, genre, performSearch]);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

  return {
    query,
    setQuery,
    genre,
    setGenre,
    results,
    loading,
    error,
    total,
    nextOffset,
    usedFallback,
    handleClear,
    handleLoadMore,
    performSearch,
  };
}

