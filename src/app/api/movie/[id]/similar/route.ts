import { NextResponse } from "next/server";
import { fetchSimilarMovies } from "@/lib/tmdb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tmdbId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    
    if (isNaN(tmdbId)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const data = await fetchSimilarMovies(tmdbId, page);
    
    if (!data) {
      return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch similar movies";
    return NextResponse.json(
      { error: message, results: [], page: 1, total_pages: 0, total_results: 0 },
      { status: 500 }
    );
  }
}













