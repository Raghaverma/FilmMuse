"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";
import StaggerList from "@/components/StaggerList";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type PopularMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
};

export default function PopularMovies() {
  const [popularMovies, setPopularMovies] = React.useState<PopularMovie[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPopular = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/movies/popular");
        if (res.ok) {
          const data = await res.json();
          setPopularMovies(data.results?.slice(0, 8) || []);
        }
      } catch (error) {
        console.error("Failed to load popular movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPopular();
  }, []);

  if (loading) {
    return (
      <section className="relative" aria-labelledby="popular-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 id="popular-title" className="text-xl font-semibold text-foreground dark:text-neutral-200 mb-2">
              Popular Movies
            </h2>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              Currently popular films
            </p>
          </div>
          <MovieCardGridSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (popularMovies.length === 0) {
    return null;
  }

  return (
    <section className="relative" aria-labelledby="popular-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <h2 id="popular-title" className="text-xl font-semibold text-foreground dark:text-neutral-200">
              Popular Movies
            </h2>
          </div>
          <p className="text-sm text-muted-foreground dark:text-neutral-400">
            Currently popular films
          </p>
        </div>

        <StaggerList
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          staggerDelay={0.03}
        >
          {popularMovies.map((movie) => {
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




