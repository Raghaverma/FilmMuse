"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, Calendar, Globe, Award, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieInteraction from "./MovieInteraction";
import { getUserRatings } from "@/lib/auth-client";

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
  const [details, setDetails] = React.useState<MovieDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userRating, setUserRating] = React.useState(0);

  // Fetch details when modal opens or movie changes
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
        
        const data = await res.json();
        
        if (cancelled) return;
        
        // Always set details, even if there's an error - we'll show what we have
        if (data) {
          setDetails(data);
          if (data.error) {
            setError(data.error);
          }
        } else {
          setError("Failed to load movie details");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Movie details fetch error:", err);
          setError("Failed to load movie details");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Reset state and fetch
    setDetails(null);
    setError(null);
    fetchDetails();

    // Load user rating
    const ratings = getUserRatings();
    setUserRating(ratings[movie.id]?.rating || 0);

    return () => {
      cancelled = true;
    };
  }, [isOpen, movie.id]);

  const handleClose = React.useCallback(() => {
    setDetails(null);
    setError(null);
    setLoading(false);
    onClose();
  }, [onClose]);

  // Close on Escape key
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

  const genreList = details?.genre?.split(", ") || [];
  const actorsList = details?.actors?.split(", ").slice(0, 5) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-4 z-50 mx-auto max-w-4xl overflow-y-auto rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
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
                {/* Hero Section with Poster */}
                <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
                  {details.poster ? (
                    <img
                      src={details.poster}
                      alt={details.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Suppress 404 errors in console
                        const img = e.currentTarget;
                        img.style.display = 'none';
                        // Show fallback by triggering parent to show placeholder
                        const parent = img.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.poster-fallback') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }
                      }}
                      loading="lazy"
                    />
                  ) : null}
                  {/* Fallback placeholder - shown when image fails to load */}
                  <div className="poster-fallback absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-900/20 to-neutral-900 flex items-center justify-center" style={{ display: details.poster ? 'none' : 'flex' }}>
                    <Film className="h-24 w-24 text-neutral-600" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                  
                  {/* Title and Basic Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-4xl font-bold text-white mb-2">{details.title}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-300 mb-4">
                          {details.year && <span>{details.year}</span>}
                          {details.runtime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {details.runtime}
                            </span>
                          )}
                          {details.rated && (
                            <span className="px-2 py-1 rounded bg-white/10 text-xs">{details.rated}</span>
                          )}
                          {details.released && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {details.released}
                            </span>
                          )}
                        </div>
                        {genreList.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {genreList.map((g, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-medium"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <MovieInteraction
                          movie={{ id: movie.id, title: movie.title, year: movie.year, poster: details.poster || movie.poster }}
                          onUpdate={() => {
                            const ratings = getUserRatings();
                            setUserRating(ratings[movie.id]?.rating || 0);
                            onUpdate?.();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                  {/* Ratings */}
                  <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-white/10">
                    {details.imdbRating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <div>
                          <div className="text-lg font-semibold text-white">IMDb</div>
                          <div className="text-sm text-neutral-400">{details.imdbRating}/10</div>
                        </div>
                      </div>
                    )}
                    {details.metascore && details.metascore !== "N/A" && (
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-400 font-bold text-sm">{details.metascore}</span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-white">Metascore</div>
                          <div className="text-sm text-neutral-400">/100</div>
                        </div>
                      </div>
                    )}
                    {userRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-emerald-400 text-emerald-400" />
                        <div>
                          <div className="text-lg font-semibold text-white">Your Rating</div>
                          <div className="text-sm text-neutral-400">{userRating}/5</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plot */}
                  {details.plot && details.plot !== "N/A" ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                      <p className="text-neutral-300 leading-relaxed">{details.plot}</p>
                    </div>
                  ) : details.error ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                      <p className="text-neutral-400 italic">Plot summary not available from OMDb API.</p>
                      {error && (
                        <p className="text-xs text-amber-400 mt-2">{error}</p>
                      )}
                    </div>
                  ) : null}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {details.director && details.director !== "N/A" && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Director</h4>
                        <p className="text-white">{details.director}</p>
                      </div>
                    )}
                    {details.writer && details.writer !== "N/A" && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Writer</h4>
                        <p className="text-white">{details.writer}</p>
                      </div>
                    )}
                    {details.language && details.language !== "N/A" && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Language</h4>
                        <p className="text-white">{details.language}</p>
                      </div>
                    )}
                    {details.country && details.country !== "N/A" && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Country</h4>
                        <p className="text-white">{details.country}</p>
                      </div>
                    )}
                    {details.boxOffice && details.boxOffice !== "N/A" && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Box Office</h4>
                        <p className="text-white">{details.boxOffice}</p>
                      </div>
                    )}
                    {details.production && details.production !== "N/A" && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Production</h4>
                        <p className="text-white">{details.production}</p>
                      </div>
                    )}
                  </div>

                  {/* Cast */}
                  {actorsList.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Cast</h3>
                      <div className="flex flex-wrap gap-2">
                        {actorsList.map((actor, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 text-sm border border-white/10"
                          >
                            {actor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Awards */}
                  {details.awards && details.awards !== "N/A" && (
                    <div className="flex items-start gap-2 p-4 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                      <Award className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-emerald-300 mb-1">Awards</h4>
                        <p className="text-sm text-neutral-300">{details.awards}</p>
                      </div>
                    </div>
                  )}
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

