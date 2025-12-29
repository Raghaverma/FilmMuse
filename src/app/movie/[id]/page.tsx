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
            movie={movieData}
            credits={creditsData}
            similar={similarData ? similarData.results.slice(0, 6) : []}
        />
    );
}
