import { NextResponse } from "next/server";
import moviesRaw from "@/data/movies.index.json";

type Movie = {
  id: string;
  title: string;
  year?: number;
  genres?: string[];
  poster?: string | null;
  meta?: string;
};

let READY = false;
let ROWS: Movie[] = [];

function initOnce() {
  if (READY) return;
  ROWS = moviesRaw as Movie[];
  READY = true;
}

export async function GET() {
  initOnce();
  
  if (ROWS.length === 0) {
    return NextResponse.json({ error: "No movies available" }, { status: 404 });
  }
  
  const randomIndex = Math.floor(Math.random() * ROWS.length);
  const randomMovie = ROWS[randomIndex];
  
  return NextResponse.json({
    id: randomMovie.id,
    title: randomMovie.title,
    year: randomMovie.year,
    genres: randomMovie.genres ?? [],
    meta: randomMovie.meta,
    poster: randomMovie.poster ?? null,
  });
}







