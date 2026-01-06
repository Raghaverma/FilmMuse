import { NextResponse } from "next/server";
import { fetchMovieKeywords } from "@/lib/tmdb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tmdbId = parseInt(id);

    if (isNaN(tmdbId)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const keywords = await fetchMovieKeywords(tmdbId);

    return NextResponse.json({ keywords });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch keywords";
    return NextResponse.json(
      { error: message, keywords: [] },
      { status: 500 }
    );
  }
}













