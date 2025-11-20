import MovieCard from "@/components/MovieCard";

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
    return (
      <div className={view === "grid" 
        ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid gap-3"
      }>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-white/10 bg-white/5">
            <div className={view === "grid" ? "aspect-[2/3] bg-white/10" : "h-20 bg-white/10"} />
            <div className="p-3">
              <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return null;
  }

  if (view === "grid") {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
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

