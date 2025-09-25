import { NextResponse } from "next/server";
import { fetchOmdbOnce } from "@/lib/omdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

  if (!title) {
    return NextResponse.json({ poster: null, error: "Missing title" }, { status: 400 });
  }

  const data = await fetchOmdbOnce(title, year);
  const poster = data?.Poster && data.Poster !== "N/A" ? data.Poster : null;

  if (process.env.NODE_ENV !== "production") {
    console.log("[/api/poster]", { title, year, poster });
  }

  return NextResponse.json({ title, year, poster });
}
