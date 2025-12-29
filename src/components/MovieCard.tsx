"use client";
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Calendar, Film, Play, Plus, Info, Check } from "lucide-react";
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
  onBeforeOpen?: () => void;
};

export default function MovieCard({ id, title, year, poster, meta, showInteraction = false, onUpdate, onBeforeOpen }: Props) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [src, setSrc] = React.useState<string | null>(poster ?? null);
  const [loading, setLoading] = React.useState<boolean>(!poster);
  const [tried, setTried] = React.useState<boolean>(false);
  const [userRating, setUserRating] = React.useState<number>(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Calculate a "Match Score" based on title hash or meta (Mock implementation)
  const matchScore = React.useMemo(() => {
    // Simple hash to get consistent random score between 80-99
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const score = 80 + (Math.abs(hash) % 20);
    return score;
  }, [title]);


  React.useEffect(() => {
    const ratings = getUserRatings();
    setUserRating(ratings[id]?.rating || 0);
  }, [id]);

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
        layoutId={`card-${id}`}
        className="group relative rounded-lg bg-neutral-900 mx-auto w-full cursor-pointer z-0 hover:z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (onBeforeOpen) {
            onBeforeOpen();
            setTimeout(() => setIsModalOpen(true), 100);
          } else {
            setIsModalOpen(true);
          }
        }}
        whileHover={{
          scale: 1.05,
          y: -5
        }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{ aspectRatio: "2/3" }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-xl shadow-black/50">
          {src ? (
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
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500 bg-white/5">
              {loading ? (
                <div className="animate-pulse">Loading…</div>
              ) : (
                <Film className="h-8 w-8 text-neutral-600" />
              )}
            </div>
          )}

          {/* Match Score Badge (Task 4) */}
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-primary/30">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-primary drop-shadow-[0_0_2px_rgba(229,9,20,0.8)]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${matchScore}, 100`}
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white shadow-sm">{matchScore}%</span>
            </div>
            <div className="text-[9px] text-center text-primary font-bold mt-1 drop-shadow-md bg-black/50 rounded px-1">
              MATCH
            </div>
          </div>

          {/* User Rating Badge (Small, Top Left) */}
          {userRating > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full border border-yellow-500/30">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-white">{userRating}</span>
            </div>
          )}

          {/* Quick Action Bar (Task 2) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-[2px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors"
                      title="Play Trailer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Play trailer logic
                        console.log("Play trailer");
                        setIsModalOpen(true);
                      }}
                    >
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </button>
                    <button
                      className="h-8 w-8 rounded-full border-2 border-neutral-400 text-white hover:border-white hover:bg-white/10 flex items-center justify-center transition-colors"
                      title="Add to Watchlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Quick add logic
                        console.log("Add to watchlist");
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    className="h-8 w-8 rounded-full border border-neutral-500/50 bg-black/40 text-neutral-300 hover:border-white hover:text-white flex items-center justify-center transition-colors"
                    title="More Info"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(true);
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs font-semibold text-white/90 truncate drop-shadow-md">
                  {title}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-300">
                  {year && <span>{year}</span>}
                  {matchScore > 90 && <span className="text-primary font-bold">Recommended</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
