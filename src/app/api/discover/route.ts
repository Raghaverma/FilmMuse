import { NextResponse } from "next/server";
import { discoverMovies, fetchGenres } from "@/lib/tmdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const genre = searchParams.get("genre") ? parseInt(searchParams.get("genre")!) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const rating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")!) : undefined;
    const language = searchParams.get("language") || undefined;
    const sortBy = searchParams.get("sort_by") || "popularity.desc";
    const page = parseInt(searchParams.get("page") || "1");

    const data = await discoverMovies({
      genre,
      year,
      "vote_average.gte": rating,
      language,
      sort_by: sortBy,
      page,
    });
    
    if (!data) {
      return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to discover movies";
    return NextResponse.json(
      { error: message, results: [], page: 1, total_pages: 0, total_results: 0 },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const genres = await fetchGenres();
    return NextResponse.json({ genres });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch genres";
    return NextResponse.json(
      { error: message, genres: [] },
      { status: 500 }
    );
  }
}

