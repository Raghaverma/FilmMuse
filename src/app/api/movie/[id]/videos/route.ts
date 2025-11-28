import { NextResponse } from "next/server";
import { fetchMovieVideos } from "@/lib/tmdb";

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

    const videos = await fetchMovieVideos(tmdbId);
    
    return NextResponse.json({ videos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch videos";
    return NextResponse.json(
      { error: message, videos: [] },
      { status: 500 }
    );
  }
}







