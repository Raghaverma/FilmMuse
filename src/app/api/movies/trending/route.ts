import { NextResponse } from "next/server";
import { fetchTrendingMovies } from "@/lib/tmdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeWindow = (searchParams.get("time_window") || "day") as "day" | "week";
    const page = parseInt(searchParams.get("page") || "1");

    const data = await fetchTrendingMovies(timeWindow, page);
    
    if (!data) {
      return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch trending movies";
    return NextResponse.json(
      { error: message, results: [], page: 1, total_pages: 0, total_results: 0 },
      { status: 500 }
    );
  }
}







