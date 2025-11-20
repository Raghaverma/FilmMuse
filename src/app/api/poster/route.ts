import { NextResponse } from "next/server";
import { fetchTmdbPoster } from "@/lib/tmdb";
import { fetchOmdbOnce } from "@/lib/omdb";
import { validateRequest, posterSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = validateRequest(posterSchema, {
      title: searchParams.get("title"),
      year: searchParams.get("year"),
    });
    const { title, year } = params;

    // Try TMDb first (primary source)
    let poster: string | null = null;
    let source = "tmdb";
    
    poster = await fetchTmdbPoster(title, year);
    
    // Fallback to OMDb if TMDb fails
    if (!poster) {
      source = "omdb";
      const omdbData = await fetchOmdbOnce(title, year);
      poster = omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : null;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[/api/poster]", { title, year, poster, source });
    }

    return NextResponse.json({ title, year, poster, source });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ poster: null, error: message }, { status: 400 });
  }
}
