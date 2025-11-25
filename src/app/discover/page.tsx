"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";
import StaggerList from "@/components/StaggerList";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";
import DottedBG from "@/components/home/DottedBG";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type Genre = {
  id: number;
  name: string;
};

type DiscoverMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
};

export default function DiscoverPage() {
  const [movies, setMovies] = React.useState<DiscoverMovie[]>([]);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // Filters
  const [selectedGenre, setSelectedGenre] = React.useState<number | undefined>();
  const [selectedYear, setSelectedYear] = React.useState<number | undefined>();
  const [minRating, setMinRating] = React.useState<number | undefined>();
  const [sortBy, setSortBy] = React.useState("popularity.desc");

  React.useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await fetch("/api/discover", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setGenres(data.genres || []);
        }
      } catch (error) {
        console.error("Failed to load genres:", error);
      }
    };

    loadGenres();
  }, []);

  React.useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedGenre) params.append("genre", selectedGenre.toString());
        if (selectedYear) params.append("year", selectedYear.toString());
        if (minRating) params.append("rating", minRating.toString());
        params.append("sort_by", sortBy);
        params.append("page", page.toString());

        const res = await fetch(`/api/discover?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMovies(data.results || []);
          setTotalPages(data.total_pages || 1);
        }
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [selectedGenre, selectedYear, minRating, sortBy, page]);

  const clearFilters = () => {
    setSelectedGenre(undefined);
    setSelectedYear(undefined);
    setMinRating(undefined);
    setSortBy("popularity.desc");
    setPage(1);
  };

  const hasActiveFilters = selectedGenre || selectedYear || minRating || sortBy !== "popularity.desc";

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground selection:bg-emerald-300/20 selection:text-emerald-200 dark:bg-[#0a0a0a] dark:text-neutral-100"
    >
      <DottedBG />
      <NavBar />
      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-neutral-200 mb-2">
                Discover Movies
              </h1>
              <p className="text-muted-foreground dark:text-neutral-400">
                Find your next favorite film
              </p>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Filters Sidebar */}
          <div
            className={`${
              filtersOpen ? "block" : "hidden"
            } md:block mb-6 p-4 bg-white/5 rounded-lg border border-white/10`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGenre || ""}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value ? parseInt(e.target.value) : undefined);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear || ""}
                  onChange={(e) => {
                    setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Min Rating
                </label>
                <select
                  value={minRating || ""}
                  onChange={(e) => {
                    setMinRating(e.target.value ? parseFloat(e.target.value) : undefined);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Any Rating</option>
                  {[6, 7, 8, 9].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}+
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="popularity.desc">Popularity</option>
                  <option value="release_date.desc">Newest</option>
                  <option value="release_date.asc">Oldest</option>
                  <option value="vote_average.desc">Highest Rated</option>
                  <option value="vote_average.asc">Lowest Rated</option>
                  <option value="revenue.desc">Box Office</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <MovieCardGridSkeleton count={8} />
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
            <p className="text-neutral-400">
              Try adjusting your filters to find more movies.
            </p>
          </div>
        ) : (
          <>
            <StaggerList
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              staggerDelay={0.03}
            >
              {movies.map((movie) => {
                const year = movie.release_date
                  ? parseInt(movie.release_date.split("-")[0])
                  : undefined;
                const poster = movie.poster_path
                  ? `${IMAGE_BASE_URL}${movie.poster_path}`
                  : null;

                return (
                  <MovieCard
                    key={movie.id}
                    id={`tmdb-${movie.id}`}
                    title={movie.title}
                    year={year}
                    poster={poster}
                    showInteraction={true}
                  />
                );
              })}
            </StaggerList>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                >
                  Previous
                </button>
                <span className="text-neutral-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </motion.main>
  );
}





