"use client";
import React from "react";

type Props = {
  id: string;
  title: string;
  year?: number;
  poster?: string | null; // comes from /api/search, may be null
};

export default function MovieCard({ id, title, year, poster }: Props) {
  const [src, setSrc] = React.useState<string | null>(poster ?? null);
  const [loading, setLoading] = React.useState<boolean>(!poster);
  const [tried, setTried] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (src || tried) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const url = `/api/poster?title=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
        console.log("[MovieCard] fetching poster:", url);
        const res = await fetch(url, { cache: "force-cache" });
        const data = await res.json();
        if (alive && data?.poster) {
          setSrc(data.poster);
        }
      } catch (e) {
        console.warn("Poster fetch failed:", e);
      } finally {
        if (alive) {
          setLoading(false);
          setTried(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [src, tried, title, year]);

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3">
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "2 / 3" }}
      >
        {src ? (
          <img
            src={src}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={() => setSrc(null)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
            {loading ? "Loading…" : "No image"}
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-white/90 truncate">{title}</div>
      <div className="text-xs text-white/50">{year ?? ""}</div>
    </div>
  );
}
