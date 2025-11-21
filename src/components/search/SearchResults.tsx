import MovieCard from "@/components/MovieCard";
import { SearchResultSkeleton } from "@/components/ui/skeleton";
import StaggerList from "@/components/StaggerList";

type Movie = {
  id: string;
  title: string;
  year?: number;
  meta?: string;
  poster?: string | null;
};

interface SearchResultsProps {
  view: "grid" | "list";
  results: Movie[];
  loading: boolean;
  onUpdate: () => void;
}

export default function SearchResults({ view, results, loading, onUpdate }: SearchResultsProps) {
  if (loading && results.length === 0) {
    return <SearchResultSkeleton view={view} />;
  }

  if (results.length === 0 && !loading) {
    return null;
  }

  if (view === "grid") {
    return (
      <StaggerList
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        staggerDelay={0.03}
      >
        {results.map((movie) => (
          <MovieCard
            key={movie.id || `${movie.title}-${movie.year}`}
            id={movie.id}
            title={movie.title}
            year={movie.year}
            poster={movie.poster}
            meta={movie.meta}
            showInteraction={true}
            onUpdate={onUpdate}
          />
        ))}
      </StaggerList>
    );
  }

  return (
    <div className="grid gap-3">
      {results.map((movie) => (
        <div
          key={movie.id || `${movie.title}-${movie.year}`}
          className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <MovieCard
            id={movie.id}
            title={movie.title}
            year={movie.year}
            poster={movie.poster}
            meta={movie.meta}
            showInteraction={true}
            onUpdate={onUpdate}
          />
        </div>
      ))}
    </div>
  );
}

