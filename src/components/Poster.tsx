"use client";

import * as React from "react";

type Props = {
  title: string;
  year?: number;
  poster?: string | null;
  className?: string;
  ratio?: `${number}/${number}` | "16/9" | "2/3";
  onError?: () => void;
};

/** Reusable poster component that fetches poster if not provided */
export default function Poster({ title, year, poster, className, ratio = "16/9", onError }: Props) {
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

  const handleError = () => {
    setSrc(null);
    onError?.();
  };

  return (
    <div className={className} style={{ aspectRatio: ratio }}>
      {src ? (
        <img
          src={src}
          alt={`${title} poster`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={handleError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs text-neutral-400">
          {loading ? "Loading…" : "No image"}
        </div>
      )}
    </div>
  );
}


