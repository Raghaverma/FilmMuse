import { NextResponse } from "next/server";
import { fetchOmdbOnce } from "@/lib/omdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const data = await fetchOmdbOnce(title, year);

  // If OMDb fails, return basic info instead of 404
  if (!data || data.Response !== "True") {
    return NextResponse.json({
      title,
      year,
      error: data?.Error || "Details not available",
      plot: null,
      poster: null,
      // Return basic structure so modal can still display
    });
  }

  return NextResponse.json({
    title: data.Title || title,
    year: data.Year ? parseInt(data.Year) : year,
    rated: data.Rated,
    released: data.Released,
    runtime: data.Runtime,
    genre: data.Genre,
    director: data.Director,
    writer: data.Writer,
    actors: data.Actors,
    plot: data.Plot,
    language: data.Language,
    country: data.Country,
    awards: data.Awards,
    poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
    ratings: data.Ratings || [],
    metascore: data.Metascore,
    imdbRating: data.imdbRating,
    imdbVotes: data.imdbVotes,
    imdbID: data.imdbID,
    boxOffice: data.BoxOffice,
    production: data.Production,
  });
}

