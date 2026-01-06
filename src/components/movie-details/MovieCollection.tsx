"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import MovieCard from "@/components/MovieCard";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

interface MovieCollectionProps {
  collectionId?: number;
  onMovieClick?: () => void;
}

type CollectionPart = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
};

type Collection = {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  parts?: CollectionPart[];
};

export default function MovieCollection({ collectionId, onMovieClick }: MovieCollectionProps) {
  const [collection, setCollection] = React.useState<Collection | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!collectionId) return;

    const loadCollection = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movie/${collectionId}/collection`);
        if (res.ok) {
          const data = await res.json();
          setCollection(data);
        }
      } catch (error) {
        console.error("Failed to load collection:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="h-48 bg-white/5 rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection || !collection.parts || collection.parts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="relative rounded-lg overflow-hidden mb-4 border border-white/10">
        {collection.backdrop_path ? (
          <div className="relative h-64 bg-gradient-to-r from-emerald-900/50 to-neutral-900/50">
            <Image
              src={`${BACKDROP_BASE_URL}${collection.backdrop_path}`}
              alt={collection.name}
              fill
              className="object-cover opacity-30"
            />
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-2xl font-bold text-white">Part of {collection.name}</h3>
              </div>
              {collection.overview && (
                <p className="text-sm text-neutral-300 max-w-2xl line-clamp-2">
                  {collection.overview}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-900/50 to-neutral-900/50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-5 w-5 text-emerald-400" />
              <h3 className="text-2xl font-bold text-white">Part of {collection.name}</h3>
            </div>
            {collection.overview && (
              <p className="text-sm text-neutral-300 max-w-2xl">
                {collection.overview}
              </p>
            )}
          </div>
        )}
      </div>

      <h4 className="text-lg font-semibold text-white mb-4">Collection Movies</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {collection.parts.map((movie) => {
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
            >
              <MovieCard
                id={`tmdb-${movie.id}`}
                title={movie.title}
                year={year}
                poster={poster}

                onBeforeOpen={onMovieClick}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

