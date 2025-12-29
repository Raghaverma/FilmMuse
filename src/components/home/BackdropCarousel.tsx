"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

type TrendingMovie = {
    id: number;
    title: string;
    release_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    overview?: string;
};

export default function BackdropCarousel() {
    const [movies, setMovies] = React.useState<TrendingMovie[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch("/api/movies/trending?time_window=day");
                if (res.ok) {
                    const data = await res.json();
                    // Get top 5 movies that have a backdrop path
                    const topMovies = (data.results || [])
                        .filter((m: TrendingMovie) => m.backdrop_path)
                        .slice(0, 5);
                    setMovies(topMovies);
                }
            } catch (error) {
                console.error("Failed to fetch trending movies for hero:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    // Auto-scroll every 5 seconds
    React.useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [movies.length]);

    if (loading || movies.length === 0) {
        // Return a skeleton or minimal placeholder
        return (
            <div className="relative h-[85vh] w-full bg-neutral-900 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
        );
    }

    const currentMovie = movies[currentIndex];

    return (
        <div className="relative h-[85vh] w-full overflow-hidden group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {currentMovie.backdrop_path && (
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] ease-linear group-hover:scale-105 brightness-50 saturate-150"
                            style={{
                                backgroundImage: `url(${IMAGE_BASE_URL}${currentMovie.backdrop_path})`,
                                maskImage: "linear-gradient(to top, black 20%, transparent 100%)",
                                WebkitMaskImage: "linear-gradient(to top, black 20%, transparent 100%)"
                            }}
                        />
                    )}
                    {/* Gradient Masks */}
                    {/* Bottom fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    {/* Left fade (for text safe zone) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-background/30" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    key={currentMovie.id + "-text"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-2xl space-y-4"
                >
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                        🔥 Trending Now
                    </div>

                    <h1 className="font-bebas text-5xl sm:text-7xl font-bold uppercase tracking-wide text-white drop-shadow-xl text-balance">
                        {currentMovie.title}
                    </h1>

                    <div className="flex items-center gap-3 text-sm text-neutral-300 font-montserrat font-medium">
                        {currentMovie.release_date && (
                            <span>{new Date(currentMovie.release_date).getFullYear()}</span>
                        )}
                        <span className="h-1 w-1 rounded-full bg-neutral-400" />
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span>{currentMovie.vote_average?.toFixed(1) || "N/A"}</span>
                        </div>
                    </div>

                    <p className="line-clamp-3 text-base sm:text-lg text-neutral-200 drop-shadow-md font-montserrat max-w-xl">
                        {currentMovie.overview}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-4">
                        <Link
                            href={`/movie/${currentMovie.id}`}
                            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                        >
                            <Play className="h-5 w-5 fill-current" />
                            Watch Trailer
                        </Link>

                        <button className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-saturate-150 border border-white/10">
                            <Plus className="h-5 w-5" />
                            Add to List
                        </button>

                        <Link
                            href={`/movie/${currentMovie.id}`}
                            className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-saturate-150 border border-white/10"
                        >
                            <Info className="h-5 w-5" />
                            Details
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                {movies.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
                        )}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
