"use client";

import { useState } from "react";
import { Download, ChevronRight, Filter, Search, Clock } from "lucide-react";

interface FriendWatchlist {
    id: string;
    owner: {
        name: string;
        avatar: string;
    };
    filmCount: number;
    lastUpdated: string;
    topGenres: string[];
    recentAdditions: string[]; // Poster URLs
}

export default function FriendWatchlists() {
    const [watchlists] = useState<FriendWatchlist[]>([
        {
            id: "1",
            owner: { name: "Sarah Chen", avatar: "SC" },
            filmCount: 42,
            lastUpdated: "2d ago",
            topGenres: ["Sci-Fi", "Thriller"],
            recentAdditions: ["/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"]
        },
        {
            id: "2",
            owner: { name: "Mike Ross", avatar: "MR" },
            filmCount: 156,
            lastUpdated: "4h ago",
            topGenres: ["Action", "Comedy"],
            recentAdditions: ["/62HCnUTZIyWcpDaBO2i1DX17dbH.jpg"]
        }
    ]);

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Search & Sort Header */}
            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search friend's lists..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Sort</span>
                </button>
            </div>

            <div className="grid gap-4">
                {watchlists.map((list) => (
                    <div key={list.id} className="glass-card rounded-2xl p-5 hover:bg-white/5 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                                    {list.owner.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">{list.owner.name}'s Watchlist</h3>
                                    <div className="flex items-center gap-2 text-xs text-secondary">
                                        <span>{list.filmCount} films</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Updated {list.lastUpdated}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100" title="Import All">
                                <Download className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {list.topGenres.map(genre => (
                                    <span key={genre} className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/5 text-gray-300">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                                Browse
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
