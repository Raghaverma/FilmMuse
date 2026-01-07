"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { Sparkles, Shuffle, Play, TrendingUp, Clock, Plus, List } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    const { userProfile } = useAuth();

    const scrollToQueue = () => {
        const queueSection = document.getElementById("smart-queue");
        queueSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section className="relative px-4 lg:px-8 py-6 lg:py-8">
            <div className="max-w-7xl mx-auto">
                {/* Decision-Focused Prompt */}
                <div className="mb-6">
                    <h1 className="text-display mb-3 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                        Pick something for tonight
                    </h1>

                    {/* Primary & Secondary CTAs */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/discover?mode=recommendation"
                            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 focus-strong"
                        >
                            <Sparkles className="h-5 w-5" />
                            Get a Recommendation
                        </Link>

                        <Link
                            href="/discover?mode=random"
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all focus-primary"
                        >
                            <Shuffle className="h-4 w-4" />
                            Surprise Me
                        </Link>

                        <button
                            onClick={scrollToQueue}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all focus-primary"
                        >
                            <Play className="h-4 w-4" />
                            Resume Last Watched
                        </button>
                    </div>
                </div>

                {/* Priority-Based Action Cards */}
                <div className="grid grid-cols-12 gap-3">
                    {/* PRIMARY: Discover - 2x size */}
                    <Link
                        href="/discover"
                        className="group col-span-12 md:col-span-6 glass-card rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5 focus-primary"
                    >
                        <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors flex-shrink-0">
                                <TrendingUp className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-title text-white mb-1">Discover</h3>
                                <p className="text-sm text-gray-300 mb-2">
                                    3 films picked for tonight
                                </p>
                                <p className="text-meta">12 min setup • Personalized</p>
                            </div>
                        </div>
                    </Link>

                    {/* SECONDARY: Watchlist */}
                    <Link
                        href="/watchlist"
                        className="group col-span-6 md:col-span-3 glass-card rounded-2xl p-5 hover:bg-white/10 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5 focus-primary"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                <Clock className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">My Queue</h3>
                                <p className="text-meta">43 unwatched</p>
                                <p className="text-meta mt-1 truncate">Next: Inception</p>
                            </div>
                        </div>
                    </Link>

                    {/* SECONDARY: Trending */}
                    <Link
                        href="/discover?filter=trending"
                        className="group col-span-6 md:col-span-3 glass-card rounded-2xl p-5 hover:bg-white/10 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5 focus-primary"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                                <Play className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Trending</h3>
                                <p className="text-meta">Updated hourly</p>
                                <p className="text-meta mt-1">127 watching now</p>
                            </div>
                        </div>
                    </Link>

                    {/* TERTIARY: New List - Compact */}
                    <Link
                        href="/lists/new"
                        className="group col-span-12 md:col-span-12 glass-card rounded-xl px-5 py-4 hover:bg-white/10 transition-all hover:scale-[1.005] focus-primary flex items-center gap-3"
                    >
                        <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors flex-shrink-0">
                            <Plus className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm">New List</h3>
                            <p className="text-meta">Quick save</p>
                        </div>
                        <List className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
