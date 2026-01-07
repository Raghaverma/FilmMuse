"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserWatchlist, removeFromWatchlist, type MovieItem } from "@/lib/firebase/firestore";
import { Clock, Filter, X, Play, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type SortOption = "added" | "oldest" | "title" | "year";
type FilterOption = "all" | "unwatched" | "watched";

export default function WatchlistPage() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
    const [liked, setLiked] = useState<MovieItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>("added");
    const [filterBy, setFilterBy] = useState<FilterOption>("all");
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchWatchlist = async () => {
            try {
                const data = await getUserWatchlist(user.uid);
                setWatchlist(data.watchlist);
                setLiked(data.liked);
            } catch (error) {
                console.error("Failed to fetch watchlist:", error);
                toast.error("Failed to load watchlist");
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, [user]);

    const handleRemove = async (movieId: string, title: string) => {
        setRemovingId(movieId);

        try {
            await removeFromWatchlist(movieId);
            setWatchlist(prev => prev.filter(m => m.id !== movieId));
            toast.success(`Removed "${title}" from queue`);
        } catch (error) {
            console.error("Failed to remove:", error);
            toast.error("Failed to remove from queue");
        } finally {
            setTimeout(() => setRemovingId(null), 300);
        }
    };

    const sortedAndFilteredMovies = () => {
        let movies = [...watchlist];

        // Apply filter
        if (filterBy === "unwatched") {
            // Mock: filter movies not in "watched" state (you can add watched tracking)
            movies = movies.filter(m => !liked.some(l => l.id === m.id));
        } else if (filterBy === "watched") {
            movies = movies.filter(m => liked.some(l => l.id === m.id));
        }

        // Apply sort
        switch (sortBy) {
            case "oldest":
                movies.reverse();
                break;
            case "title":
                movies.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "year":
                movies.sort((a, b) => (b.year || 0) - (a.year || 0));
                break;
            default: // "added"
                break;
        }

        return movies;
    };

    const movies = sortedAndFilteredMovies();

    if (!user) {
        return (
            <div className="min-h-screen surface-base px-4 lg:px-8 py-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-lg mb-4">Please log in to view your queue</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all focus-strong"
                    >
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen surface-base px-4 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-display text-white">My Queue</h1>
                            <p className="text-meta mt-1">{movies.length} {movies.length === 1 ? 'film' : 'films'} in your watchlist</p>
                        </div>
                    </div>

                    {/* Filters & Sort */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                                className="px-3 py-2 rounded-lg surface-raised text-sm text-white border border-white/10 focus-primary"
                            >
                                <option value="all">All Films</option>
                                <option value="unwatched">Unwatched</option>
                                <option value="watched">Watched</option>
                            </select>
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-3 py-2 rounded-lg surface-raised text-sm text-white border border-white/10 focus-primary"
                        >
                            <option value="added">Recently Added</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="year">Year</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] surface-raised rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && movies.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-2">
                            {filterBy === "all" ? "Your queue is empty" : `No ${filterBy} films`}
                        </p>
                        <p className="text-meta mb-6">
                            Start adding films to build your perfect watchlist
                        </p>
                        <Link
                            href="/discover"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all focus-strong"
                        >
                            Discover Films
                        </Link>
                    </div>
                )}

                {/* Movie Grid */}
                {!loading && movies.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {movies.map((movie) => {
                            const isRemoving = removingId === movie.id;

                            return (
                                <div
                                    key={movie.id}
                                    className={`group relative transition-all duration-300 ${isRemoving ? "opacity-0 scale-95" : "opacity-100 scale-100"
                                        }`}
                                >
                                    <Link
                                        href={`/movie/${movie.id}`}
                                        className="block glass-card rounded-xl overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02] focus-primary"
                                    >
                                        <div className="relative aspect-[2/3]">
                                            {movie.poster ? (
                                                <Image
                                                    src={`${IMAGE_BASE_URL}${movie.poster}`}
                                                    alt={movie.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                    <Star className="h-12 w-12 text-gray-600" />
                                                </div>
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="h-14 w-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                                                    <Play className="h-6 w-6 text-white fill-white ml-1" />
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRemove(movie.id, movie.title);
                                                }}
                                                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/70 hover:bg-destructive/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all focus-strong z-10"
                                                aria-label={`Remove ${movie.title}`}
                                            >
                                                <X className="h-4 w-4 text-white" />
                                            </button>
                                        </div>

                                        <div className="p-3">
                                            <h3 className="font-semibold text-white text-sm truncate">
                                                {movie.title}
                                            </h3>
                                            {movie.year && (
                                                <p className="text-meta mt-1">{movie.year}</p>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
