"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import MovieCard from "@/components/MovieCard";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import StaggerList from "@/components/StaggerList";

export default function SectionDiscover() {
  const { personalizedRecs, randomRecs, loadingPersonalized, loadingRandom, refreshPersonalized } = useRecommendations();

  return (
    <section id="discover" className="relative" aria-labelledby="discover-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {personalizedRecs.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 id="discover-title" className="text-xl font-semibold text-foreground dark:text-neutral-200 mb-2">
                  Recommended for You
                </h2>
                <p className="text-sm text-muted-foreground dark:text-neutral-400">
                  Based on your watchlist and liked movies
                </p>
              </div>
            </div>
            {loadingPersonalized ? (
              <MovieCardGridSkeleton count={4} />
            ) : (
              <StaggerList
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                staggerDelay={0.03}
              >
                {personalizedRecs.slice(0, 8).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    year={movie.year}
                    poster={movie.poster}


                    onUpdate={refreshPersonalized}
                  />
                ))}
              </StaggerList>
            )}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground dark:text-neutral-200 mb-2">
              {personalizedRecs.length > 0 ? "Discover New Movies" : "Today's curated lineup"}
            </h2>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              {personalizedRecs.length > 0
                ? "Random recommendations from our collection"
                : "Handpicked films for your viewing pleasure"}
            </p>
          </div>
        </div>
        {loadingRandom ? (
          <MovieCardGridSkeleton count={4} />
        ) : randomRecs.length > 0 ? (
          <StaggerList
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            staggerDelay={0.03}
          >
            {randomRecs.slice(0, 8).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                year={movie.year}
                poster={movie.poster}
                meta={movie.meta}

                onUpdate={refreshPersonalized}
              />
            ))}
          </StaggerList>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16"
          >
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/10">
                <Film className="h-12 w-12 text-neutral-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">No recommendations yet</h3>
            <p className="text-sm text-muted-foreground dark:text-neutral-400 mb-6 max-w-md mx-auto">
              Start exploring movies and building your watchlist to get personalized recommendations tailored to your taste!
            </p>
            <Link href="/search">
              <Button className="bg-emerald-400 text-black hover:bg-emerald-300">
                Explore Movies
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

