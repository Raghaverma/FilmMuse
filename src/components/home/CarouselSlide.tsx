"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";

interface CarouselSlideProps {
  movie: { id: string; title: string; year?: number; meta?: string; poster?: string | null };
  active: boolean;
  index: number;
  total: number;
  prefersReduced: boolean;
  onClick: () => void;
}

export default function CarouselSlide({
  movie,
  active,
  index,
  total,
  prefersReduced,
  onClick,
}: CarouselSlideProps) {
  const isValidPoster = movie.poster && movie.poster !== "N/A" && movie.poster.trim() !== "";
  const [posterSrc, setPosterSrc] = React.useState<string | null>(isValidPoster ? movie.poster! : null);
  const [loading, setLoading] = React.useState(!isValidPoster);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (posterSrc && posterSrc !== "N/A") return;
    if (tried) return;
    
    let cancelled = false;

    const fetchPoster = async () => {
      try {
        setLoading(true);
        const url = `/api/poster?title=${encodeURIComponent(movie.title)}${movie.year ? `&year=${movie.year}` : ""}`;
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response type");
        }
        const data = await res.json();
        if (!cancelled && data?.poster && data.poster !== "N/A") {
          setPosterSrc(data.poster);
        }
      } catch (e) {
        // Silently handle poster fetch failures
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTried(true);
        }
      }
    };

    fetchPoster();

    return () => {
      cancelled = true;
    };
  }, [posterSrc, tried, movie.title, movie.year]);

  return (
    <motion.div
      className="absolute inset-0"
      role="group"
      aria-roledescription="slide"
      aria-label={`${movie.title} (${index + 1} of ${total})`}
      initial={false}
      animate={
        active
          ? { opacity: 1, scale: prefersReduced ? 1 : 1.0 }
          : { opacity: 0, scale: prefersReduced ? 1 : 1.02 }
      }
      transition={{ duration: prefersReduced ? 0 : 0.5 }}
      style={{ pointerEvents: active ? "auto" : "none" }}
      onClick={onClick}
    >
      <div className="relative h-full w-full">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={`${movie.title} banner`}
            className="w-full h-full object-cover"
            onError={() => setPosterSrc(null)}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ) : loading ? (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-blue-900/20 flex items-center justify-center animate-pulse">
            <Film className="h-16 w-16 text-neutral-600" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-blue-900/20 flex items-center justify-center">
            <Film className="h-16 w-16 text-neutral-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-6">
          <div className="max-w-[80%]">
            <div className="text-lg font-semibold text-neutral-100 sm:text-2xl drop-shadow">
              {movie.title}
            </div>
            <div className="text-xs text-neutral-200/90 sm:text-sm drop-shadow">
              {movie.year ? `${movie.year} • ` : ""}{movie.meta || "Movie"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

