import { Button } from "@/components/ui/button";

interface EmptySearchStateProps {
  genre?: string;
  query?: string;
  onClearFilters: () => void;
}

export default function EmptySearchState({ genre, query, onClearFilters }: EmptySearchStateProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-neutral-400 mb-2">
        {genre && !query 
          ? `No movies found with genre "${genre}". The movie database may not have genre information populated. Try searching by title instead.`
          : query && genre
          ? `No results found for "${query}" in genre "${genre}". Try a different search or genre.`
          : query
          ? `No results found for "${query}". Try a different search.`
          : "Enter a search query or select a genre to get started."
        }
      </p>
      {genre && (
        <Button
          onClick={onClearFilters}
          className="mt-4 bg-emerald-400 text-black hover:bg-emerald-300"
        >
          Clear filters and show all movies
        </Button>
      )}
    </div>
  );
}

