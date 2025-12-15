"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";
import StaggerList from "@/components/StaggerList";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type NowPlayingMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
};

export default function NowPlayingMovies() {
  const [movies, setMovies] = React.useState<NowPlayingMovie[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/movies/now-playing");
        if (res.ok) {
          const data = await res.json();
          setMovies(data.results?.slice(0, 8) || []);
        }
      } catch (error) {
        console.error("Failed to load now playing movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) {
    return (
      <section className="relative" aria-labelledby="now-playing-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 id="now-playing-title" className="text-xl font-semibold text-foreground dark:text-neutral-200 mb-2">
              In Theaters
            </h2>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              Movies currently playing in theaters
            </p>
          </div>
          <MovieCardGridSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="relative" aria-labelledby="now-playing-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-5 w-5 text-blue-400" />
            <h2 id="now-playing-title" className="text-xl font-semibold text-foreground dark:text-neutral-200">
              In Theaters
            </h2>
          </div>
          <p className="text-sm text-muted-foreground dark:text-neutral-400">
            Movies currently playing in theaters
          </p>
        </div>

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
      </div>
    </section>
  );
}














