import { NextResponse } from "next/server";
import { fetchTmdbOnce } from "@/lib/tmdb";
import { fetchOmdbOnce } from "@/lib/omdb";
import { validateRequest, movieDetailsSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = validateRequest(movieDetailsSchema, {
      title: searchParams.get("title"),
      year: searchParams.get("year"),
    });
    const { title, year } = params;

    // Try TMDb first (primary source)
    let data: any = null;
    let source = "tmdb";
    
    const tmdbData = await fetchTmdbOnce(title, year);
    if (tmdbData) {
      // Map TMDb data to unified format
      data = {
        title: tmdbData.title || title,
        year: tmdbData.year || year,
        runtime: tmdbData.runtime,
        genre: tmdbData.genre,
        director: tmdbData.director,
        writer: tmdbData.writer,
        actors: tmdbData.actors,
        plot: tmdbData.plot,
        language: tmdbData.language,
        country: tmdbData.country,
        production: tmdbData.production,
        poster: tmdbData.poster,
        // Use TMDb's rating as fallback, but prefer actual IMDb rating from OMDb
        imdbRating: tmdbData.imdbRating,
        imdbVotes: tmdbData.imdbVotes,
        imdbID: tmdbData.imdbID,
        backdrop: tmdbData.backdrop,
        tagline: tmdbData.tagline,
        // TMDb doesn't have these fields, leave undefined
        rated: undefined,
        released: undefined,
        awards: undefined,
        ratings: [],
        metascore: undefined,
        boxOffice: undefined,
      };
      
      // Try to get actual IMDb rating from OMDb if we have an IMDb ID
      // This gives us the real IMDb rating instead of TMDb's vote_average
      if (tmdbData.imdbID) {
        try {
          const omdbData = await fetchOmdbOnce(title, year);
          if (omdbData && omdbData.Response === "True" && omdbData.imdbRating && omdbData.imdbRating !== "N/A") {
            // Use actual IMDb rating from OMDb
            data.imdbRating = omdbData.imdbRating;
            data.imdbVotes = omdbData.imdbVotes;
            data.metascore = omdbData.Metascore;
            data.ratings = omdbData.Ratings || [];
          }
        } catch (error) {
          // Silently fail - we already have TMDb data
          console.debug("Failed to fetch OMDb data for IMDb rating:", error);
        }
      }
    } else {
      // Fallback to OMDb
      source = "omdb";
      const omdbData = await fetchOmdbOnce(title, year);
      
      if (omdbData && omdbData.Response === "True") {
        data = {
          title: omdbData.Title || title,
          year: omdbData.Year ? parseInt(omdbData.Year) : year,
          rated: omdbData.Rated,
          released: omdbData.Released,
          runtime: omdbData.Runtime,
          genre: omdbData.Genre,
          director: omdbData.Director,
          writer: omdbData.Writer,
          actors: omdbData.Actors,
          plot: omdbData.Plot,
          language: omdbData.Language,
          country: omdbData.Country,
          awards: omdbData.Awards,
          poster: omdbData.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : null,
          ratings: omdbData.Ratings || [],
          metascore: omdbData.Metascore,
          imdbRating: omdbData.imdbRating,
          imdbVotes: omdbData.imdbVotes,
          imdbID: omdbData.imdbID,
          boxOffice: omdbData.BoxOffice,
          production: omdbData.Production,
        };
      }
    }

    // If both APIs fail, return basic info
    if (!data) {
      return NextResponse.json({
        title,
        year,
        error: `Details not available from TMDb or OMDb API`,
        plot: null,
        poster: null,
        source: "none",
      });
    }

    return NextResponse.json({
      ...data,
      source,
    });
  } catch (error: unknown) {
    // Even on validation error, return basic structure with error message
    // This allows the modal to display something instead of failing completely
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Unknown";
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const message = error instanceof Error ? error.message : "Invalid request";
    
    return NextResponse.json({
      title,
      year,
      error: message,
      plot: null,
      poster: null,
    });
  }
}

