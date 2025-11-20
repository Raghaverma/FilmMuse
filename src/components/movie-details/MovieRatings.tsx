import { Star } from "lucide-react";

interface MovieRatingsProps {
  imdbRating?: string;
  metascore?: string;
  userRating: number;
}

export default function MovieRatings({ imdbRating, metascore, userRating }: MovieRatingsProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-white/10">
      {imdbRating && (
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <div>
            <div className="text-lg font-semibold text-white">IMDb</div>
            <div className="text-sm text-neutral-400">{imdbRating}/10</div>
          </div>
        </div>
      )}
      {metascore && metascore !== "N/A" && (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 font-bold text-sm">{metascore}</span>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">Metascore</div>
            <div className="text-sm text-neutral-400">/100</div>
          </div>
        </div>
      )}
      {userRating > 0 && (
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-emerald-400 text-emerald-400" />
          <div>
            <div className="text-lg font-semibold text-white">Your Rating</div>
            <div className="text-sm text-neutral-400">{userRating}/5</div>
          </div>
        </div>
      )}
    </div>
  );
}

