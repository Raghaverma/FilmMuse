"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Movie {
    id: number;
    title: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function ContinueWatchingCarousel() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        // Fetch user's watchlist or recently viewed
        const fetchMovies = async () => {
            try {
                const res = await fetch("/api/movies/trending?time_window=week");
                if (res.ok) {
                    const data = await res.json();
                    setMovies(data.results?.slice(0, 10) || []);
                }
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            }
        };
        fetchMovies();
    }, []);

    const scroll = (direction: "left" | "right") => {
        const container = document.getElementById("continue-watching-scroll");
        if (!container) return;

        const scrollAmount = 400;
        const newPosition = direction === "left"
            ? Math.max(0, scrollPosition - scrollAmount)
            : scrollPosition + scrollAmount;

        container.scrollTo({ left: newPosition, behavior: "smooth" });
        setScrollPosition(newPosition);
    };

    if (movies.length === 0) return null;

    return (
        <section className="px-4 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-400" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div
                    id="continue-watching-scroll"
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {movies.map((movie) => (
                        <Link
                            key={movie.id}
                            href={`/movie/${movie.id}`}
                            className="group relative flex-shrink-0 w-[280px] rounded-xl overflow-hidden bg-card hover:scale-[1.02] transition-transform"
                        >
                            <div className="relative aspect-video">
                                <img
                                    src={`${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-14 w-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                                        <Play className="h-6 w-6 text-white fill-white ml-1" />
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.random() * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-white truncate">{movie.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {Math.floor(Math.random() * 60)} min remaining
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
