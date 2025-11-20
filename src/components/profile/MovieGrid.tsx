import MovieCard from "@/components/MovieCard";

interface Movie {
  id: string;
  title: string;
  year?: number;
  poster?: string | null;
}

interface MovieGridProps {
  movies: Movie[];
  onUpdate: () => void;
}

export default function MovieGrid({ movies, onUpdate }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          id={movie.id}
          title={movie.title}
          year={movie.year}
          poster={movie.poster}
          showInteraction={true}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

