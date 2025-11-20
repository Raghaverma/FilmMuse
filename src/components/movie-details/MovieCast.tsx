interface MovieCastProps {
  actors?: string;
}

export default function MovieCast({ actors }: MovieCastProps) {
  const actorsList = actors?.split(", ").slice(0, 5) || [];

  if (actorsList.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Cast</h3>
      <div className="flex flex-wrap gap-2">
        {actorsList.map((actor, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 text-sm border border-white/10"
          >
            {actor}
          </span>
        ))}
      </div>
    </div>
  );
}

