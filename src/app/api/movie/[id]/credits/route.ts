import { NextResponse } from "next/server";
import { fetchMovieCredits } from "@/lib/tmdb";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tmdbId = parseInt(params.id);
    
    if (isNaN(tmdbId)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const data = await fetchMovieCredits(tmdbId);
    
    if (!data) {
      return NextResponse.json({ cast: [], crew: [] });
    }
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch credits";
    return NextResponse.json(
      { error: message, cast: [], crew: [] },
      { status: 500 }
    );
  }
}







