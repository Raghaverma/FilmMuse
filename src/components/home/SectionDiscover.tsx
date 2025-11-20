"use client";

import * as React from "react";
import { Film } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import MovieCard from "@/components/MovieCard";

export default function SectionDiscover() {
  const { personalizedRecs, randomRecs, loadingPersonalized, loadingRandom, refreshPersonalized } = useRecommendations();

  return (
    <section id="discover" className="relative" aria-labelledby="discover-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {personalizedRecs.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 id="discover-title" className="text-xl font-semibold text-neutral-200 mb-2">
                  Recommended for You
                </h2>
                <p className="text-sm text-neutral-400">
                  Based on your watchlist and liked movies
                </p>
              </div>
            </div>
            {loadingPersonalized ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-white/5 aspect-[2/3]" />
                ))}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {personalizedRecs.slice(0, 8).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    year={movie.year}
                    poster={movie.poster}
                    meta={movie.meta}
                    showInteraction={true}
                    onUpdate={refreshPersonalized}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-200 mb-2">
              {personalizedRecs.length > 0 ? "Discover New Movies" : "Today's curated lineup"}
            </h2>
            <p className="text-sm text-neutral-400">
              {personalizedRecs.length > 0 
                ? "Random recommendations from our collection"
                : "Handpicked films for your viewing pleasure"}
            </p>
          </div>
        </div>
        {loadingRandom ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/5 aspect-[2/3]" />
            ))}
          </div>
        ) : randomRecs.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {randomRecs.slice(0, 8).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                year={movie.year}
                poster={movie.poster}
                meta={movie.meta}
                showInteraction={true}
                onUpdate={refreshPersonalized}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-sm text-neutral-400 mb-2">No recommendations available yet.</p>
            <p className="text-xs text-neutral-500">Start exploring movies to get personalized recommendations!</p>
          </div>
        )}
      </div>
    </section>
  );
}

