import { motion } from "framer-motion";
import MovieGrid from "./MovieGrid";
import EmptyState from "./EmptyState";

interface LikedTabProps {
  movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>;
  onUpdate: () => void;
}

export default function LikedTab({ movies, onUpdate }: LikedTabProps) {
  return (
    <motion.div
      key="liked"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {movies.length === 0 ? (
        <EmptyState
          icon="film"
          title="You haven't liked any movies yet."
          description="Start exploring and like movies you enjoy!"
          buttonText="Explore Movies"
          buttonHref="/search"
        />
      ) : (
        <MovieGrid movies={movies} onUpdate={onUpdate} />
      )}
    </motion.div>
  );
}

