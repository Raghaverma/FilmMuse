"use client";

import * as React from "react";
import Image from "next/image";

type Props = {
  title: string;
  year?: number;
  poster?: string | null;
  className?: string;
  ratio?: `${number}/${number}` | "16/9" | "2/3";
  onError?: () => void;
};

// Global cache to prevent duplicate fetches across component instances
const posterCache = new Map<string, { src: string | null; loading: boolean; promise?: Promise<string | null> }>();

/** Reusable poster component that fetches poster if not provided */
function PosterComponent({ title, year, poster, className, ratio = "16/9", onError }: Props) {
  const [src, setSrc] = React.useState<string | null>(poster ?? null);
  const [loading, setLoading] = React.useState<boolean>(!poster);

  // Create a stable key for this poster
  const currentKey = React.useMemo(() => `${title}::${year ?? ""}`, [title, year]);

  // Update src when poster prop changes
  React.useEffect(() => {
    if (poster !== undefined) {
      setSrc(poster);
      setLoading(!poster);
      if (poster) {
        posterCache.set(currentKey, { src: poster, loading: false });
      }
    }
  }, [poster, currentKey]);

  React.useEffect(() => {
    // If we already have a poster from props, don't fetch
    if (poster) {
      return;
    }

    // Check global cache first
    const cached = posterCache.get(currentKey);
    if (cached) {
      if (cached.src !== null) {
        setSrc(cached.src);
        setLoading(false);
        return;
      }
      // If there's a pending promise, wait for it
      if (cached.promise) {
        cached.promise.then((result) => {
          setSrc(result);
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
        return;
      }
    }

    // Start fetching
    let alive = true;
    setLoading(true);
    posterCache.set(currentKey, { src: null, loading: true });

    const fetchPromise = (async () => {
      try {
        const url = `/api/poster?title=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response type");
        }
        const data = await res.json();
        const result = data?.poster || null;
        if (alive) {
          posterCache.set(currentKey, { src: result, loading: false });
          setSrc(result);
          setLoading(false);
        }
        return result;
      } catch (e) {
        console.warn("Poster fetch failed:", e);
        if (alive) {
          posterCache.set(currentKey, { src: null, loading: false });
          setLoading(false);
        }
        return null;
      }
    })();

    // Store the promise in cache so other instances can wait for it
    const cachedEntry = posterCache.get(currentKey);
    if (cachedEntry) {
      cachedEntry.promise = fetchPromise;
    }

    return () => {
      alive = false;
    };
  }, [title, year, currentKey, poster]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Suppress 404 errors in console
    const img = e.currentTarget;
    if (img.src && !img.src.includes('data:')) {
      // Only log debug message, not error
      console.debug(`Poster not available for: ${title}`);
    }
    setSrc(null);
    onError?.();
  };

  return (
    <div className={className} style={{ aspectRatio: ratio, position: "relative" }}>
      {src ? (
        <Image
          src={src}
          alt={`${title} poster`}
          fill
          className="object-cover"
          onError={handleError}
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs text-neutral-400">
          {loading ? "Loading…" : "No image"}
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default React.memo(PosterComponent);


