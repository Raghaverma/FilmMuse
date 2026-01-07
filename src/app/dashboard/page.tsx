"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserWatchlist, type MovieItem } from "@/lib/firebase/firestore";
import { BarChart3, Clock, Heart, TrendingUp, Film, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function DashboardPage() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
    const [liked, setLiked] = useState<MovieItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const data = await getUserWatchlist(user.uid);
                setWatchlist(data.watchlist);
                setLiked(data.liked);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Calculate stats
    const totalMovies = watchlist.length;
    const totalLiked = liked.length;
    const recentlyAdded = watchlist.slice(0, 5);

    // Mock data for demonstration
    const thisMonthAdded = Math.floor(totalMovies * 0.3);
    const watchedThisWeek = Math.floor(totalLiked * 0.2);

    if (!user) {
        return (
            <div className="min-h-screen surface-base px-4 lg:px-8 py-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-lg mb-4">Please log in to view your dashboard</p>
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
                <div className="mb-8">
                    <h1 className="text-display text-white mb-2">Dashboard</h1>
                    <p className="text-meta">Welcome back, {user.email?.split('@')[0] || 'Film Enthusiast'}!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total in Queue */}
                    <div className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-accent" />
                            </div>
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{totalMovies}</h3>
                        <p className="text-meta">Films in Queue</p>
                        <p className="text-xs text-green-400 mt-2">+{thisMonthAdded} this month</p>
                    </div>

                    {/* Total Liked */}
                    <div className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                                <Heart className="h-6 w-6 text-destructive" />
                            </div>
                            <Film className="h-5 w-5 text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{totalLiked}</h3>
                        <p className="text-meta">Films Liked</p>
                        <p className="text-xs text-gray-400 mt-2">All time favorites</p>
                    </div>

                    {/* Watched This Week */}
                    <div className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-primary" />
                            </div>
                            <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{watchedThisWeek}</h3>
                        <p className="text-meta">Watched This Week</p>
                        <p className="text-xs text-gray-400 mt-2">Keep it up!</p>
                    </div>

                    {/* Total Hours (Mock) */}
                    <div className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Film className="h-6 w-6 text-purple-400" />
                            </div>
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{totalLiked * 2}h</h3>
                        <p className="text-meta">Watch Time</p>
                        <p className="text-xs text-purple-400 mt-2">Estimated total</p>
                    </div>
                </div>

                {/* Recently Added Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Recently Added</h2>
                        <Link
                            href="/watchlist"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] surface-raised rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : recentlyAdded.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recentlyAdded.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/movie/${movie.id}`}
                                    className="group glass-card rounded-xl overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02] focus-primary"
                                >
                                    <div className="relative aspect-[2/3]">
                                        {movie.poster ? (
                                            <Image
                                                src={`${IMAGE_BASE_URL}${movie.poster}`}
                                                alt={movie.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                <Film className="h-12 w-12 text-gray-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl p-12 text-center">
                            <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No films in your queue yet</p>
                            <p className="text-meta mb-6">Start discovering films to build your watchlist</p>
                            <Link
                                href="/discover"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all focus-strong"
                            >
                                Discover Films
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/discover"
                        className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Film className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Discover Films</h3>
                        <p className="text-meta">Explore trending and popular movies</p>
                    </Link>

                    <Link
                        href="/search"
                        className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BarChart3 className="h-6 w-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Search Movies</h3>
                        <p className="text-meta">Find specific films and add to queue</p>
                    </Link>

                    <Link
                        href="/friends"
                        className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Heart className="h-6 w-6 text-destructive" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Friends Activity</h3>
                        <p className="text-meta">See what your friends are watching</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
