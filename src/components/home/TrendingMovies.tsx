"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";
import StaggerList from "@/components/StaggerList";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type TrendingMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
};

export default function TrendingMovies() {
  const [trendingMovies, setTrendingMovies] = React.useState<TrendingMovie[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [timeWindow, setTimeWindow] = React.useState<"day" | "week">("day");

  React.useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movies/trending?time_window=${timeWindow}`);
        if (res.ok) {
          const data = await res.json();
          setTrendingMovies(data.results?.slice(0, 8) || []);
        }
      } catch (error) {
        console.error("Failed to load trending movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, [timeWindow]);

  if (loading) {
    return (
      <section className="relative" aria-labelledby="trending-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 id="trending-title" className="text-xl font-semibold text-foreground dark:text-neutral-200 mb-2">
                Trending Now
              </h2>
              <p className="text-sm text-muted-foreground dark:text-neutral-400">
                Movies that are trending right now
              </p>
            </div>
          </div>
          <MovieCardGridSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (trendingMovies.length === 0) {
    return null;
  }

  return (
    <section className="relative" aria-labelledby="trending-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h2 id="trending-title" className="text-xl font-semibold text-foreground dark:text-neutral-200">
                Trending Now
              </h2>
            </div>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              Movies that are trending right now
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeWindow("day")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeWindow === "day"
                  ? "bg-emerald-400 text-black"
                  : "bg-white/5 text-neutral-300 hover:bg-white/10"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeWindow("week")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeWindow === "week"
                  ? "bg-emerald-400 text-black"
                  : "bg-white/5 text-neutral-300 hover:bg-white/10"
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        <StaggerList
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          staggerDelay={0.03}
        >
          {trendingMovies.map((movie) => {
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
      </div>
    </section>
  );
}




