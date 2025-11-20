"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import SearchForm from "@/components/search/SearchForm";
import SearchStatus from "@/components/search/SearchStatus";
import SearchResults from "@/components/search/SearchResults";
import EmptySearchState from "@/components/search/EmptySearchState";
import { useSearch } from "@/hooks/useSearch";

type Movie = {
  id: string;
  title: string;
  year?: number;
  meta?: string;
  poster?: string | null;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  
  const initialQuery = React.useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);
  const initialGenre = React.useMemo(() => (searchParams.get("genre") || "").trim(), [searchParams]);

  const {
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
  } = useSearch(initialQuery, initialGenre);

  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [randomMovie, setRandomMovie] = React.useState<Movie | null>(null);
  const [isRandomModalOpen, setIsRandomModalOpen] = React.useState(false);

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query.trim(), genre, 0, true);
  }, [query, genre, performSearch]);

  const handleRandom = React.useCallback(async () => {
    try {
      const res = await fetch("/api/movie/random");
      if (!res.ok) throw new Error("Failed to get random movie");
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Invalid response type");
      }
      const movie = await res.json();
      setRandomMovie(movie);
      setIsRandomModalOpen(true);
    } catch (err) {
      console.error("Random movie error:", err);
    }
  }, []);

  const handleGenreChange = React.useCallback((newGenre: string) => {
    setGenre(newGenre);
    if (newGenre) {
      performSearch(query.trim(), newGenre, 0, true);
    } else {
      performSearch(query.trim(), "", 0, true);
    }
  }, [query, setGenre, performSearch]);

  const handleUpdate = React.useCallback(() => {
    // No-op for now
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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

        <SearchForm
          query={query}
          genre={genre}
          loading={loading}
          onQueryChange={setQuery}
          onGenreChange={handleGenreChange}
          onSubmit={handleSubmit}
          onRandom={handleRandom}
          onClear={handleClear}
        />

        <div className="flex items-center gap-2 mb-4">
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

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchStatus
            loading={loading}
            total={total}
            resultsCount={results.length}
            genre={genre}
            query={query}
            usedFallback={usedFallback}
          />
        </div>

        <section>
          {results.length === 0 && !loading ? (
            <EmptySearchState
              genre={genre}
              query={query}
              onClearFilters={() => {
                    setGenre("");
                    setQuery("");
                    handleClear();
                  }}
            />
          ) : (
            <>
              <SearchResults view={view} results={results} loading={loading} onUpdate={handleUpdate} />

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
            </>
          )}
        </section>
      </div>

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
