// src/lib/omdb.ts
import "server-only";

const KEY = process.env.OMDB_API_KEY!;
if (!KEY) console.warn("[omdb] OMDB_API_KEY missing");

type OMDb = {
  Poster?: string;
  Plot?: string;
  imdbRating?: string;
  Response?: string;
};

type CacheEntry = { value: OMDb | null; at: number };
const MAX = 1000;                 // max entries in cache (LRU-ish)
const TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<OMDb | null>>();

function k(title: string, year?: number) {
  return `${title.trim().toLowerCase()}::${year ?? ""}`;
}

function getFresh(key: string): OMDb | null | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function setCache(key: string, val: OMDb | null) {
  // simple LRU-ish: delete+set moves to end
  if (cache.has(key)) cache.delete(key);
  cache.set(key, { value: val, at: Date.now() });
  if (cache.size > MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

async function fetchWithTimeout(url: string, ms = 4000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fast, cached OMDb fetcher.
 * - Returns null on any error or if OMDb says Response !== "True".
 * - Strong in-process cache + TTL.
 * - Coalesces concurrent requests for same (title, year).
 */
export async function fetchOmdbOnce(title: string, year?: number): Promise<OMDb | null> {
  const key = k(title, year);

  const fresh = getFresh(key);
  if (fresh !== undefined) return fresh;

  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    if (!KEY) {
      setCache(key, null);
      return null;
    }
    const url =
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}` +
      (year ? `&y=${year}` : "") +
      `&apikey=${KEY}`;

    try {
      const res = await fetchWithTimeout(url, 4000);
      const data = (await res.json()) as OMDb;
      if (data?.Response === "True") {
        setCache(key, data);
        return data;
      }
    } catch {}
    setCache(key, null);
    return null;
  })();

  inflight.set(key, p);
  try {
    return await p;
  } finally {
    inflight.delete(key);
  }
}
