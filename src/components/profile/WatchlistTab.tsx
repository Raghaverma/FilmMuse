import { motion } from "framer-motion";
import MovieGrid from "./MovieGrid";
import EmptyState from "./EmptyState";

interface WatchlistTabProps {
  movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>;
  onUpdate: () => void;
}

export default function WatchlistTab({ movies, onUpdate }: WatchlistTabProps) {
  return (
    <motion.div
      key="watchlist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {movies.length === 0 ? (
        <EmptyState
          icon="film"
          title="Your watchlist is empty."
          description="Start by exploring movies and adding them to your watchlist!"
          buttonText="Explore Movies"
          buttonHref="/search"
        />
      ) : (
        <MovieGrid movies={movies} onUpdate={onUpdate} />
      )}
    </motion.div>
  );
}

