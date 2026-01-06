import Image from "next/image";
import { Film, Clock, Calendar } from "lucide-react";
import MovieInteraction from "../MovieInteraction";
import { getUserRatings } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import * as React from "react";

interface MovieHeroProps {
  details: {
    title: string;
    year?: number;
    runtime?: string;
    rated?: string;
    released?: string;
    poster?: string | null;
    genre?: string;
  };
  movie: {
    id: string;
    title: string;
    year?: number;
    poster?: string | null;
  };
  onUpdate?: () => void;
}

export default function MovieHero({ details, movie, onUpdate }: MovieHeroProps) {
  const { user } = useAuth();
  const [, setUserRating] = React.useState(0);

  React.useEffect(() => {
    const loadRating = async () => {
      if (user) {
        try {
          const ratings = await getUserRatings(user.uid);
          setUserRating(ratings[movie.id]?.rating || 0);
        } catch (error) {
          console.error("Error loading rating:", error);
        }
      } else {
        setUserRating(0);
      }
    };
    loadRating();
  }, [user, movie.id]);

  const genreList = details.genre?.split(", ") || [];

  return (
    <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
      {details.poster ? (
        <Image
          src={details.poster}
          alt={details.title}
          fill
          className="object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const img = e.currentTarget;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              const fallback = parent.querySelector('.poster-fallback') as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }
          }}
        />
      ) : null}
      <div className="poster-fallback absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-900/20 to-neutral-900 flex items-center justify-center" style={{ display: details.poster ? 'none' : 'flex' }}>
        <Film className="h-24 w-24 text-neutral-600" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-white mb-2">{details.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-300 mb-4">
              {details.year && <span>{details.year}</span>}
              {details.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {details.runtime}
                </span>
              )}
              {details.rated && (
                <span className="px-2 py-1 rounded bg-white/10 text-xs">{details.rated}</span>
              )}
              {details.released && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {details.released}
                </span>
              )}
            </div>
            {genreList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genreList.map((g, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MovieInteraction
              movie={{ id: movie.id, title: movie.title, year: movie.year, poster: details.poster || movie.poster }}
              onUpdate={async () => {
                if (user) {
                  try {
                    const ratings = await getUserRatings(user.uid);
                    setUserRating(ratings[movie.id]?.rating || 0);
                  } catch (error) {
                    console.error("Error loading rating:", error);
                  }
                }
                onUpdate?.();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

