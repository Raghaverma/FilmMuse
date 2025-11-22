"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import MovieCard from "@/components/MovieCard";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface MovieSimilarProps {
  tmdbId?: number;
  onMovieClick?: () => void;
}

type SimilarMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
};

export default function MovieSimilar({ tmdbId, onMovieClick }: MovieSimilarProps) {
  const [similarMovies, setSimilarMovies] = React.useState<SimilarMovie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = React.useState<SimilarMovie[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"similar" | "recommended">("similar");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!tmdbId) return;

    const loadMovies = async () => {
      setLoading(true);
      try {
        const [similarRes, recommendedRes] = await Promise.all([
          fetch(`/api/movie/${tmdbId}/similar`),
          fetch(`/api/movie/${tmdbId}/recommendations`),
        ]);

        if (similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilarMovies(similarData.results?.slice(0, 10) || []);
        }

        if (recommendedRes.ok) {
          const recommendedData = await recommendedRes.json();
          setRecommendedMovies(recommendedData.results?.slice(0, 10) || []);
        }
      } catch (error) {
        console.error("Failed to load similar movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [tmdbId]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const currentMovies = activeTab === "similar" ? similarMovies : recommendedMovies;

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">More Like This</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 bg-white/5 rounded-lg animate-pulse"
              style={{ aspectRatio: "2 / 3" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentMovies.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">More Like This</h3>
        {(similarMovies.length > 0 || recommendedMovies.length > 0) && (
          <div className="flex gap-2">
            {similarMovies.length > 0 && (
              <button
                onClick={() => setActiveTab("similar")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === "similar"
                    ? "bg-emerald-400 text-black"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                Similar
              </button>
            )}
            {recommendedMovies.length > 0 && (
              <button
                onClick={() => setActiveTab("recommended")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === "recommended"
                    ? "bg-emerald-400 text-black"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                Recommended
              </button>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        {currentMovies.length > 4 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors hidden md:flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors hidden md:flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          {currentMovies.map((movie) => {
            const year = movie.release_date
              ? parseInt(movie.release_date.split("-")[0])
              : undefined;
            const poster = movie.poster_path
              ? `${IMAGE_BASE_URL}${movie.poster_path}`
              : null;

            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-48"
              >
                <MovieCard
                  id={`tmdb-${movie.id}`}
                  title={movie.title}
                  year={year}
                  poster={poster}
                  showInteraction={false}
                  onBeforeOpen={onMovieClick}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

