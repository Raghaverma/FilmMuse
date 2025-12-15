import { NextResponse } from "next/server";
import { fetchCollection } from "@/lib/tmdb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collectionId = parseInt(id);
    
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const data = await fetchCollection(collectionId);
    
    if (!data) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch collection";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}




