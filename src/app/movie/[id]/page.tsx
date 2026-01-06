import React from "react";
import { notFound } from "next/navigation";
import { fetchMovieDetails, fetchMovieCredits, fetchSimilarMovies } from "@/lib/tmdb";
import MovieDetailsClient from "@/components/movie-details/MovieDetailsClient";

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch data in parallel
    const [movieData, creditsData, similarData] = await Promise.all([
        fetchMovieDetails(Number(id)),
        fetchMovieCredits(Number(id)),
        fetchSimilarMovies(Number(id))
    ]);

    if (!movieData) {
        notFound();
    }

    return (
        <MovieDetailsClient
            movie={{
                ...movieData,
                backdrop_path: movieData.backdrop_path || null,
                poster_path: movieData.poster_path || null,
                release_date: movieData.release_date || "",
                runtime: movieData.runtime || 0,
                vote_average: movieData.vote_average || 0,
                genres: movieData.genres || [],
                overview: movieData.overview || "",
                budget: movieData.budget || 0,
                original_language: movieData.original_language || "en",
            }}
            credits={
                creditsData
                    ? {
                        cast: creditsData.cast.map(c => ({
                            ...c,
                            character: c.character || "",
                            profile_path: c.profile_path || null,
                        })),
                        crew: creditsData.crew,
                    }
                    : { cast: [], crew: [] }
            }
            similar={similarData ? similarData.results.slice(0, 6) : []}
        />
    );
}
