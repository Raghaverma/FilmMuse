import "server-only";

const KEY = process.env.OMDB_API_KEY!;
type OMDb = { Poster?: string; Plot?: string; imdbRating?: string; Response?: string };

const cache = new Map<string, OMDb>();

export async function fetchOmdbOnce(title: string, year?: number): Promise<OMDb | null> {
  const k = `${title.toLowerCase().trim()}::${year ?? ""}`;
  if (cache.has(k)) return cache.get(k)!;

  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}${year ? `&y=${year}` : ""}&apikey=${KEY}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as OMDb;
    if (data?.Response === "True") { cache.set(k, data); return data; }
  } catch {}
  cache.set(k, { Response: "False" });
  return null;
}
