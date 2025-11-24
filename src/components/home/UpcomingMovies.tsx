"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";
import StaggerList from "@/components/StaggerList";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type UpcomingMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
};

export default function UpcomingMovies() {
  const [movies, setMovies] = React.useState<UpcomingMovie[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/movies/upcoming");
        if (res.ok) {
          const data = await res.json();
          setMovies(data.results?.slice(0, 8) || []);
        }
      } catch (error) {
        console.error("Failed to load upcoming movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) {
    return (
      <section className="relative" aria-labelledby="upcoming-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 id="upcoming-title" className="text-xl font-semibold text-foreground dark:text-neutral-200 mb-2">
              Coming Soon
            </h2>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              Upcoming movie releases
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

  const formatReleaseDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <section className="relative" aria-labelledby="upcoming-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <h2 id="upcoming-title" className="text-xl font-semibold text-foreground dark:text-neutral-200">
              Coming Soon
            </h2>
          </div>
          <p className="text-sm text-muted-foreground dark:text-neutral-400">
            Upcoming movie releases
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
              <div key={movie.id} className="relative">
                <MovieCard
                  id={`tmdb-${movie.id}`}
                  title={movie.title}
                  year={year}
                  poster={poster}
                  showInteraction={true}
                />
                {movie.release_date && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500/90 text-xs font-medium text-white rounded">
                    {formatReleaseDate(movie.release_date)}
                  </div>
                )}
              </div>
            );
          })}
        </StaggerList>
      </div>
    </section>
  );
}




