import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import EmptyState from "./EmptyState";
import type { MovieRating } from "@/lib/firebase/firestore";

interface RatingsTabProps {
  ratings: Record<string, MovieRating>;
  onRemoveRating: (movieId: string) => void;
  isOwnProfile?: boolean;
}

export default function RatingsTab({ ratings, onRemoveRating, isOwnProfile = true }: RatingsTabProps) {
  return (
    <motion.div
      key="ratings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {Object.keys(ratings).length === 0 ? (
        <EmptyState
          icon="star"
          title="You haven't rated any movies yet."
          description="Start rating movies you've watched!"
          buttonText="Explore Movies"
          buttonHref="/search"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ratings).map(([movieId, rating]) => (
            <div key={movieId} className="border border-white/10 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {rating.moviePoster ? (
                  <Image
                    src={rating.moviePoster}
                    alt={rating.movieTitle}
                    width={64}
                    height={96}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-24 bg-white/5 rounded flex items-center justify-center text-xs text-neutral-500">
                    No Image
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{rating.movieTitle}</div>
                  {rating.movieYear && (
                    <div className="text-sm text-neutral-400">{rating.movieYear}</div>
                  )}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-neutral-600"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Rated {new Date(typeof rating.ratedAt === 'number' ? rating.ratedAt : rating.ratedAt.toMillis?.() || Date.now()).toLocaleDateString()}
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => onRemoveRating(movieId)}
                      className="mt-2 text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove rating
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

