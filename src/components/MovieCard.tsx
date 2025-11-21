"use client";
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Calendar, Film } from "lucide-react";
import { getUserRatings } from "@/lib/auth-client";
import MovieInteraction from "./MovieInteraction";
import MovieDetailsModal from "./MovieDetailsModal";

type Props = {
  id: string;
  title: string;
  year?: number;
  poster?: string | null;
  meta?: string;
  showInteraction?: boolean;
  onUpdate?: () => void;
};

export default function MovieCard({ id, title, year, poster, meta, showInteraction = false, onUpdate }: Props) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [src, setSrc] = React.useState<string | null>(poster ?? null);
  const [loading, setLoading] = React.useState<boolean>(!poster);
  const [tried, setTried] = React.useState<boolean>(false);
  const [userRating, setUserRating] = React.useState<number>(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [quickInfo, setQuickInfo] = React.useState<{ genres?: string[]; plot?: string } | null>(null);

  React.useEffect(() => {
    const ratings = getUserRatings();
    setUserRating(ratings[id]?.rating || 0);
  }, [id]);

  // Load quick info on hover
  React.useEffect(() => {
    if (!isHovered || quickInfo) return;
    
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        const url = `/api/movie/details?title=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
        const res = await fetch(url);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data && !cancelled) {
            setQuickInfo({
              genres: data.genre ? data.genre.split(",").map((g: string) => g.trim()) : undefined,
              plot: data.plot && data.plot !== "N/A" ? data.plot.substring(0, 150) + "..." : undefined,
            });
          }
        }
      } catch (error) {
        // Silently fail - this is just for preview
      }
    }, 500); // Delay to avoid unnecessary requests

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isHovered, title, year, quickInfo]);

  React.useEffect(() => {
    if (src || tried) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const url = `/api/poster?title=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response type");
        }
        const data = await res.json();
        if (alive && data?.poster) {
          setSrc(data.poster);
        }
      } catch (e) {
        console.warn("Poster fetch failed:", e);
      } finally {
        if (alive) {
          setLoading(false);
          setTried(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [src, tried, title, year]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative rounded-2xl bg-neutral-900 border border-neutral-800 p-3 hover:border-emerald-400/30 transition-all duration-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: "2 / 3" }}
        >
          {src ? (
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={src}
                alt={title}
                fill
                className="object-cover"
                onError={() => {
                  console.debug(`Poster not available for: ${title}`);
                  setSrc(null);
                }}
                loading="lazy"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </motion.div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500 bg-white/5">
              {loading ? (
                <div className="animate-pulse">Loading…</div>
              ) : (
                <Film className="h-8 w-8 text-neutral-600" />
              )}
            </div>
          )}
          
          {showInteraction && (
            <div 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <MovieInteraction
                movie={{ id, title, year, poster, meta }}
                onUpdate={() => {
                  const ratings = getUserRatings();
                  setUserRating(ratings[id]?.rating || 0);
                  onUpdate?.();
                }}
              />
            </div>
          )}

          {userRating > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-white">{userRating}</span>
            </div>
          )}

          {/* Hover Preview Overlay */}
          <AnimatePresence>
            {isHovered && (quickInfo?.plot || quickInfo?.genres) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 flex flex-col justify-end z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {quickInfo.genres && quickInfo.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {quickInfo.genres.slice(0, 3).map((genre, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {quickInfo.plot && (
                  <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                    {quickInfo.plot}
                  </p>
                )}
                {year && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
                    <Calendar className="h-3 w-3" />
                    <span>{year}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3">
          <div className="text-sm text-white/90 truncate font-medium" title={title}>
            {title}
          </div>
          <div className="text-xs text-white/50 mt-1">{year ?? ""}</div>
        </div>
      </motion.div>

      <MovieDetailsModal
        movie={{ id, title, year, poster, meta }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
