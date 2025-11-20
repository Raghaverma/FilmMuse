"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Film } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserRatings } from "@/lib/firebase/firestore";
import MovieHero from "./movie-details/MovieHero";
import MovieRatings from "./movie-details/MovieRatings";
import MovieDetailsGrid from "./movie-details/MovieDetailsGrid";
import MovieCast from "./movie-details/MovieCast";
import MovieAwards from "./movie-details/MovieAwards";

type MovieDetails = {
  title: string;
  year?: number;
  rated?: string;
  released?: string;
  runtime?: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  plot?: string;
  language?: string;
  country?: string;
  awards?: string;
  poster?: string | null;
  ratings?: Array<{ Source: string; Value: string }>;
  metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  boxOffice?: string;
  production?: string;
};

type Props = {
  movie: {
    id: string;
    title: string;
    year?: number;
    poster?: string | null;
    meta?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
};

export default function MovieDetailsModal({ movie, isOpen, onClose, onUpdate }: Props) {
  const { user } = useAuth();
  const [details, setDetails] = React.useState<MovieDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userRating, setUserRating] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen) {
      setDetails(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/movie/details?title=${encodeURIComponent(movie.title)}${movie.year ? `&year=${movie.year}` : ""}`;
        const res = await fetch(url);
        
        if (cancelled) return;
        
        // Always try to parse JSON, even if status is not ok
        // The API now returns 200 even with errors
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response type");
        }
        
        const data = await res.json();
        
        if (cancelled) return;
        
        // Always set details if we have data, even if it contains an error
        // This allows the modal to display basic info (title, year)
        if (data && data.title) {
          setDetails(data);
          if (data.error) {
            setError(data.error);
          }
        } else {
          // If no data at all, show error
          setError("Failed to load movie details");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Movie details fetch error:", err);
          // Even on error, try to show basic info
          setDetails({
            title: movie.title,
            year: movie.year,
            error: err instanceof Error ? err.message : "Failed to load movie details",
            plot: null,
            poster: movie.poster || null,
          });
          setError("Failed to load movie details");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setDetails(null);
    setError(null);
    fetchDetails();

    const loadRating = async () => {
      if (user) {
        try {
          const ratings = await getUserRatings(user.uid);
          setUserRating(ratings[movie.id]?.rating || 0);
        } catch (error) {
          console.error("Error loading rating:", error);
        }
      } else {
        setUserRating(0);
      }
    };
    loadRating();

    return () => {
      cancelled = true;
    };
  }, [isOpen, movie.id, movie.title, movie.year, user]);

  const handleClose = React.useCallback(() => {
    setDetails(null);
    setError(null);
    setLoading(false);
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-4 z-50 mx-auto max-w-4xl overflow-y-auto rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-400 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-neutral-400">Loading movie details...</p>
                </div>
              </div>
            ) : details ? (
              <div className="relative">
                <MovieHero details={details} movie={movie} onUpdate={onUpdate} />

                <div className="p-8">
                  <MovieRatings
                    imdbRating={details.imdbRating}
                    metascore={details.metascore}
                    userRating={userRating}
                  />

                  {details.plot && details.plot !== "N/A" ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                      <p className="text-neutral-300 leading-relaxed">{details.plot}</p>
                    </div>
                  ) : details.error ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                      <p className="text-neutral-400 italic">Plot summary not available from TMDb or OMDb API.</p>
                      {error && (
                        <p className="text-xs text-amber-400 mt-2">{error}</p>
                      )}
                    </div>
                  ) : null}

                  {(details.director || details.writer || details.language || details.country || details.boxOffice || details.production) && (
                    <MovieDetailsGrid
                      director={details.director}
                      writer={details.writer}
                      language={details.language}
                      country={details.country}
                      boxOffice={details.boxOffice}
                      production={details.production}
                    />
                  )}

                  {details.actors && <MovieCast actors={details.actors} />}

                  {details.awards && <MovieAwards awards={details.awards} />}
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <p className="text-neutral-400 mb-2">{error}</p>
                  <p className="text-sm text-neutral-500">Movie: {movie.title}{movie.year ? ` (${movie.year})` : ""}</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-neutral-400">No details available</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
