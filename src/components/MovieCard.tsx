"use client";
import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { getUserRatings } from "@/lib/auth-client";
import MovieInteraction from "./MovieInteraction";
import MovieDetailsModal from "./MovieDetailsModal";

type Props = {
  id: string;
  title: string;
  year?: number;
  poster?: string | null;
  showInteraction?: boolean;
  onUpdate?: () => void;
};

export default function MovieCard({ id, title, year, poster, showInteraction = false, onUpdate }: Props) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [src, setSrc] = React.useState<string | null>(poster ?? null);
  const [loading, setLoading] = React.useState<boolean>(!poster);
  const [tried, setTried] = React.useState<boolean>(false);
  const [userRating, setUserRating] = React.useState<number>(0);

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
      >
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: "2 / 3" }}
        >
        {src ? (
          <motion.img
            src={src}
            alt={title}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onError={() => setSrc(null)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500 bg-white/5">
            {loading ? (
              <div className="animate-pulse">Loading…</div>
            ) : (
              "No image"
            )}
          </div>
        )}
        
        {showInteraction && (
          <div 
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <MovieInteraction
              movie={{ id, title, year, poster }}
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
      </div>

        <div className="mt-3">
          <div className="text-sm text-white/90 truncate font-medium" title={title}>
            {title}
          </div>
          <div className="text-xs text-white/50 mt-1">{year ?? ""}</div>
        </div>
      </motion.div>

      <MovieDetailsModal
        movie={{ id, title, year, poster }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
