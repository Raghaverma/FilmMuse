"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { Play, Plus, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    const { userProfile } = useAuth();

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <section className="relative px-4 lg:px-8 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {greeting}, {userProfile?.username || "Film Lover"}
                    </h1>
                    <p className="text-gray-400 text-lg">What would you like to watch today?</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/discover"
                        className="group glass-card rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Discover</h3>
                                <p className="text-xs text-gray-400">Find new films</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/watchlist"
                        className="group glass-card rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                <Clock className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Watchlist</h3>
                                <p className="text-xs text-gray-400">Your queue</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/discover?filter=trending"
                        className="group glass-card rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                                <Play className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Trending</h3>
                                <p className="text-xs text-gray-400">Popular now</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/lists/new"
                        className="group glass-card rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                <Plus className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">New List</h3>
                                <p className="text-xs text-gray-400">Create collection</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
