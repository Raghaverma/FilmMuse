"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserWatchlist } from "@/lib/firebase/firestore";
import BannerCarousel from "./BannerCarousel";

export default function HeroVisual() {
  const prefersReduced = useReducedMotion();
  const { user } = useAuth();
  const [recommendedMovies, setRecommendedMovies] = React.useState<Array<{ id: string; title: string; year?: number; meta?: string; poster?: string | null }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        if (user) {
          try {
            const watchlist = await getUserWatchlist(user.uid);
            const res = await fetch("/api/recommendations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                watchlist: watchlist.watchlist,
                liked: watchlist.liked,
              }),
            });
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }
            const contentType = res.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
              throw new Error("Invalid response type");
            }
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              setRecommendedMovies(data.items.slice(0, 8));
              setLoading(false);
              return;
            }
          } catch (error) {
            // Fall through to random recommendations
          }
        }
        
        const res = await fetch("/api/recommendations/random");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response type");
        }
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setRecommendedMovies(data.items.slice(0, 8));
        }
      } catch (error) {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user]);

  if (loading) {
    return (
      <div className="relative -mt-6 mx-auto max-w-6xl select-none px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-2 shadow-2xl">
          <div className="relative aspect-[16/9] w-full rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
            <span className="text-neutral-400">Loading recommendations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (recommendedMovies.length === 0) {
    return null;
  }

  return (
    <div className="relative -mt-6 mx-auto max-w-6xl select-none px-4 pb-8 sm:px-6 lg:px-8">
      <motion.div
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-2 shadow-2xl"
      >
        <BannerCarousel items={recommendedMovies} />
      </motion.div>
    </div>
  );
}

