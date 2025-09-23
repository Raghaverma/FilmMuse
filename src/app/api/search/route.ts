// OMDb-powered search API
import { NextResponse } from "next/server";

type SearchItem = {
  id: string;
  title: string;
  year?: number;
  meta?: string;   // we’ll stick year here too for now
  poster?: string;
};

const OMDB_URL = "https://www.omdbapi.com/";
const API_KEY = process.env.OMDB_API_KEY; // ← set this in .env.local

export const dynamic = "force-dynamic"; // avoid static caching in dev

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ items: [] });
  }
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing OMDB_API_KEY env var", items: [] },
      { status: 500 },
    );
  }

  // OMDb “search” endpoint returns up to 10 items per page.
  const res = await fetch(
    `${OMDB_URL}?apikey=${API_KEY}&type=movie&s=${encodeURIComponent(q)}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: `OMDb HTTP ${res.status}`, items: [] },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    Response?: "True" | "False";
    Search?: Array<{
      imdbID: string;
      Title: string;
      Year?: string;
      Poster?: string;
      Type?: string;
    }>;
    Error?: string;
  };

  if (data.Response !== "True" || !data.Search) {
    // OMDb returns { Response: "False", Error: "Movie not found!" } on no matches
    return NextResponse.json({ items: [] });
  }

  const items: SearchItem[] = data.Search.map((m) => {
    const y = Number(m.Year) || undefined;
    return {
      id: m.imdbID,
      title: m.Title,
      year: y,
      meta: y ? String(y) : undefined,
      poster: m.Poster && m.Poster !== "N/A" ? m.Poster : undefined,
    };
  });

  return NextResponse.json({ items });
}
