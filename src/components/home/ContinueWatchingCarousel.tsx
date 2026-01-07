"use client";

import { useState, useEffect } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { toast } from "react-hot-toast";

interface Movie {
    id: number;
    title: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    runtime?: number;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function ContinueWatchingCarousel() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
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
        const container = document.getElementById("smart-queue-scroll");
        if (!container) return;

        const scrollAmount = 350;
        const newPosition = direction === "left"
            ? Math.max(0, scrollPosition - scrollAmount)
            : scrollPosition + scrollAmount;

        container.scrollTo({ left: newPosition, behavior: "smooth" });
        setScrollPosition(newPosition);
    };

    const handleRemove = (movieId: number, movieTitle: string) => {
        setRemovingId(movieId);

        setTimeout(() => {
            setMovies(prev => prev.filter(m => m.id !== movieId));
            setRemovingId(null);
            toast.success(`Removed "${movieTitle}" from queue`);
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent, movieId: number, movieTitle: string) => {
        if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            handleRemove(movieId, movieTitle);
        }
    };

    // Mock progress data - replace with actual user data
    const getProgress = (movieId: number) => {
        const mockProgress = [45, 23, 67, 12, 89, 34, 56, 78, 15, 92];
        return mockProgress[movieId % 10];
    };

    const getTimeRemaining = (progress: number, runtime: number = 120) => {
        const remaining = Math.ceil((runtime * (100 - progress)) / 100);
        return `${remaining} min left`;
    };

    const getLastWatched = (movieId: number) => {
        const days = [2, 1, 5, 3, 7, 1, 4, 2, 6, 3];
        const daysAgo = days[movieId % 10];
        return daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
    };

    if (movies.length === 0) return null;

    return (
        <section id="smart-queue" className="px-4 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-headline text-white">Resume or Drop</h2>
                        <p className="text-meta mt-1">{movies.length} in progress</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-2 rounded-lg surface-raised hover:bg-white/10 transition-colors focus-primary"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-400" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-2 rounded-lg surface-raised hover:bg-white/10 transition-colors focus-primary"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div
                    id="smart-queue-scroll"
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {movies.map((movie) => {
                        const progress = getProgress(movie.id);
                        const isRemoving = removingId === movie.id;

                        return (
                            <div
                                key={movie.id}
                                className={`group relative flex-shrink-0 w-[220px] transition-all duration-300 ${isRemoving ? "opacity-0 scale-95" : "opacity-100 scale-100"
                                    }`}
                                onKeyDown={(e) => handleKeyDown(e, movie.id, movie.title)}
                                tabIndex={0}
                            >
                                <div className="glass-card rounded-xl overflow-hidden hover:bg-white/10 transition-all">
                                    {/* Compact Poster */}
                                    <div className="relative aspect-video">
                                        <NextImage
                                            src={`${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
                                            alt={movie.title}
                                            fill
                                            className="object-cover"
                                            sizes="220px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                        {/* Thin Progress Indicator */}
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/movie/${movie.id}`}
                                                className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 focus-strong"
                                            >
                                                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                                            </Link>
                                            <button
                                                onClick={() => handleRemove(movie.id, movie.title)}
                                                className="h-12 w-12 rounded-full bg-white/10 hover:bg-destructive/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 focus-strong"
                                                aria-label={`Remove ${movie.title}`}
                                            >
                                                <X className="h-5 w-5 text-white" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info - Increased Density */}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-white text-sm truncate mb-1">
                                            {movie.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-meta">
                                            <span>{progress}% complete</span>
                                            <span>{getTimeRemaining(progress)}</span>
                                        </div>
                                        <p className="text-meta mt-1">{getLastWatched(movie.id)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Keyboard Hint */}
                <p className="text-meta mt-4 text-center">
                    Press <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Delete</kbd> to remove •
                    <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 ml-1">Enter</kbd> to resume
                </p>
            </div>
        </section >
    );
}
