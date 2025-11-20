import type { Movie } from "@/types/movies";

export interface MovieSearchParams {
  query?: string;
  genre?: string;
  limit?: number;
  offset?: number;
}

export interface MovieSearchResponse {
  items: Movie[];
  total: number;
  nextOffset: number | null;
  source?: "index" | "fallback";
}

export interface MovieDetails {
  title: string;
  year?: number;
  rated?: string;
  released?: string;
  runtime?: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  plot?: string;
  language?: string;
  country?: string;
  awards?: string;
  poster?: string | null;
  ratings?: Array<{ Source: string; Value: string }>;
  metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  boxOffice?: string;
  production?: string;
}

class MovieService {
  async search(params: MovieSearchParams): Promise<MovieSearchResponse> {
    const url = new URL("/api/search", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (params.query) url.searchParams.set("q", params.query);
    if (params.genre) url.searchParams.set("genre", params.genre);
    url.searchParams.set("limit", String(params.limit || 30));
    url.searchParams.set("offset", String(params.offset || 0));

    const res = await fetch(url.toString(), {
      cache: "force-cache",
    });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("Invalid response type");
    }
    return res.json();
  }

  async getDetails(title: string, year?: number): Promise<MovieDetails> {
    const url = new URL("/api/movie/details", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    url.searchParams.set("title", title);
    if (year) url.searchParams.set("year", String(year));

    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`Failed to fetch movie details: ${res.status}`);
    }

    return res.json();
  }

  async getPoster(title: string, year?: number): Promise<{ poster: string | null }> {
    const url = new URL("/api/poster", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    url.searchParams.set("title", title);
    if (year) url.searchParams.set("year", String(year));

    const res = await fetch(url.toString(), { cache: "force-cache" });

    if (!res.ok) {
      throw new Error(`Failed to fetch poster: ${res.status}`);
    }

    return res.json();
  }

  async getRandom(): Promise<Movie> {
    const url = new URL("/api/movie/random", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`Failed to fetch random movie: ${res.status}`);
    }

    return res.json();
  }

  async getRecommendations(watchlist: Movie[], liked: Movie[]): Promise<{ items: Movie[] }> {
    const url = new URL("/api/recommendations", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchlist, liked }),
    });

    if (!res.ok) {
      throw new Error(`Failed to get recommendations: ${res.status}`);
    }

    return res.json();
  }

  async getRandomRecommendations(): Promise<{ items: Movie[] }> {
    const url = new URL("/api/recommendations/random", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`Failed to get random recommendations: ${res.status}`);
    }

    return res.json();
  }
}

export const movieService = new MovieService();

