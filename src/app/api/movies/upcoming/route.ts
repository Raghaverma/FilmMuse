import { NextResponse } from "next/server";
import { fetchUpcomingMovies } from "@/lib/tmdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");

    const data = await fetchUpcomingMovies(page);
    
    if (!data) {
      return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    
    // Filter out movies that have already been released
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const upcomingResults = data.results?.filter((movie) => {
      if (!movie.release_date) return false;
      
      const releaseDate = new Date(movie.release_date);
      releaseDate.setHours(0, 0, 0, 0);
      
      // Only include movies with release dates in the future
      return releaseDate >= today;
    }) || [];
    
    return NextResponse.json({
      ...data,
      results: upcomingResults,
      total_results: upcomingResults.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch upcoming movies";
    return NextResponse.json(
      { error: message, results: [], page: 1, total_pages: 0, total_results: 0 },
      { status: 500 }
    );
  }
}





