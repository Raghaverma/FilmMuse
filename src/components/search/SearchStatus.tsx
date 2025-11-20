interface SearchStatusProps {
  loading: boolean;
  total: number;
  resultsCount: number;
  genre?: string;
  query?: string;
  usedFallback: boolean;
}

export default function SearchStatus({
  loading,
  total,
  resultsCount,
  genre,
  query,
  usedFallback,
}: SearchStatusProps) {
  if (loading) {
    return <p className="text-sm text-neutral-400">Searching...</p>;
  }

  return (
    <>
      <p className="text-sm text-neutral-400">
        {total > 0 ? (
          <>
            {resultsCount}{total ? ` of ${total}` : ""} result{(total || resultsCount) > 1 ? "s" : ""} found
            {genre && ` • Genre: ${genre}`}
          </>
        ) : genre ? (
          <>
            No results found for genre: <span className="text-emerald-400">{genre}</span>
            <span className="text-xs text-neutral-500 ml-2">(Try a different genre or search by title)</span>
          </>
        ) : query ? (
          "No results found. Try a different search."
        ) : (
          "Enter a search query or select a genre to get started."
        )}
      </p>
      {usedFallback && (
        <span className="text-xs text-amber-300">
          Using starter dataset
        </span>
      )}
    </>
  );
}

