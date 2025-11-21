import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Film, X, Sparkles } from "lucide-react";

interface EmptySearchStateProps {
  genre?: string;
  query?: string;
  onClearFilters: () => void;
}

export default function EmptySearchState({ genre, query, onClearFilters }: EmptySearchStateProps) {
  const hasFilters = genre || query;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-16 text-center"
    >
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full" />
        <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/10">
          {hasFilters ? (
            <Search className="h-12 w-12 text-neutral-500" />
          ) : (
            <Sparkles className="h-12 w-12 text-emerald-400" />
          )}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        {genre && !query
          ? "No movies found"
          : query && genre
          ? "No matches found"
          : query
          ? "No results found"
          : "Start your search"}
      </h3>

      <p className="text-neutral-400 mb-6 max-w-md mx-auto">
        {genre && !query
          ? `We couldn't find any movies with the genre "${genre}". Try searching by title instead, or browse our collection.`
          : query && genre
          ? `No results found for "${query}" in the "${genre}" genre. Try adjusting your search terms or clearing filters.`
          : query
          ? `We couldn't find any movies matching "${query}". Try different keywords or browse our collection.`
          : "Search for movies by title, mood, or vibe. Discover your next favorite film!"}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {hasFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-white/30 bg-white/[0.08] text-neutral-100 hover:bg-white/15 hover:border-white/50 hover:text-white transition-all shadow-sm"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
        <Button
          onClick={onClearFilters}
          className="bg-emerald-400 text-black hover:bg-emerald-300 shadow-sm"
        >
          <Film className="h-4 w-4" />
          {hasFilters ? "Browse all movies" : "Explore movies"}
        </Button>
      </div>
    </motion.div>
  );
}

