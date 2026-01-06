"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Link from "next/link";

interface Movie {
    id: number;
    title: string;
    poster_path?: string | null;
    vote_average?: number;
    release_date?: string;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function RecommendedGrid() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch("/api/movies/trending?time_window=day");
                if (res.ok) {
                    const data = await res.json();
                    setMovies(data.results?.slice(0, 8) || []);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <section className="px-4 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-6" />
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
                    <Link href="/discover" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        See More
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {movies.map((movie) => (
                        <Link
                            key={movie.id}
                            href={`/movie/${movie.id}`}
                            className="group relative rounded-xl overflow-hidden bg-card hover:scale-[1.02] transition-transform"
                        >
                            <div className="relative aspect-[2/3]">
                                <img
                                    src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Rating Badge */}
                                {movie.vote_average && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm">
                                        <Star className="h-3 w-3 text-accent fill-accent" />
                                        <span className="text-xs font-semibold text-white">
                                            {movie.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-3">
                                <h3 className="font-semibold text-white text-sm truncate group-hover:text-primary transition-colors">
                                    {movie.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {movie.release_date?.split("-")[0] || "N/A"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
