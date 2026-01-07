"use client";

import { useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { Star, Plus, Eye, MoreHorizontal } from "lucide-react";

// Mock Data Interfaces
export interface FeedItem {
    id: string;
    type: "rating" | "review" | "watched" | "watchlist_add";
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    movie: {
        id: number;
        title: string;
        poster_path: string;
        year: string;
    };
    rating?: number;
    review?: string;
    timestamp: Date;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

export default function FriendFeed() {
    // Mock Data - In real app, fetch this from API
    // Rules applied: Only ratings >= 3.5 or <= 2.0
    const [feedItems] = useState<FeedItem[]>([
        {
            id: "1",
            type: "review",
            user: { id: "u1", name: "Sarah Chen", avatar: "SC" },
            movie: { id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", year: "1999" },
            rating: 4.5,
            review: "Complex, raw, and utterly completely fascinating. Fincher at his best.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        },
        {
            id: "2",
            type: "rating",
            user: { id: "u2", name: "Mike Ross", avatar: "MR" },
            movie: { id: 157336, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", year: "2014" },
            rating: 5,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
            id: "3",
            type: "watchlist_add",
            user: { id: "u3", name: "Jessica Pearson", avatar: "JP" },
            movie: { id: 693134, title: "Dune: Part Two", poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", year: "2024" },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        },
        {
            id: "4",
            type: "rating",
            user: { id: "u4", name: "Louis Litt", avatar: "LL" },
            movie: { id: 359, title: "Highlander 2", poster_path: "/5aXp2s4l6g5g5g5g5g5g5g.jpg", year: "1991" }, // Fake poster for example
            rating: 1.5, // Low rating (<= 2.0) - Included
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
    ]);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {feedItems.map((item) => (
                <div key={item.id} className="glass-card p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                                {item.user.avatar}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {item.user.name}
                                        <span className="text-gray-400 font-normal ml-1">
                                            {item.type === "rating" && "rated a movie"}
                                            {item.type === "review" && "wrote a review"}
                                            {item.type === "watched" && "watched a movie"}
                                            {item.type === "watchlist_add" && "added to watchlist"}
                                        </span>
                                    </p>
                                    <p className="text-xs text-secondary mt-0.5">{formatTime(item.timestamp)}</p>
                                </div>
                                <button className="text-gray-400 hover:text-white transition-colors">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Movie Card */}
                            <div className="mt-3 flex gap-4 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors group cursor-pointer border border-white/5 hover:border-white/10">
                                <Link href={`/movie/${item.movie.id}`} className="flex-shrink-0 relative h-24 w-16 rounded-lg overflow-hidden">
                                    <NextImage
                                        src={item.movie.poster_path.startsWith('/') ? `${IMAGE_BASE_URL}${item.movie.poster_path}` : "/placeholder-poster.png"}
                                        alt={item.movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                </Link>

                                <div className="flex-1 py-1">
                                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{item.movie.title}</h3>
                                    <p className="text-xs text-gray-400 mb-2">{item.movie.year}</p>

                                    {(item.type === "rating" || item.type === "review") && item.rating && (
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3 w-3 ${i < Math.floor(item.rating!) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                                                />
                                            ))}
                                            <span className={`text-xs font-bold ml-1 ${item.rating >= 4 ? "text-green-400" : item.rating <= 2 ? "text-red-400" : "text-gray-300"}`}>
                                                {item.rating}
                                            </span>
                                        </div>
                                    )}

                                    {item.type === "review" && item.review && (
                                        <div className="mt-2 text-sm text-gray-300 italic">
                                            "{item.review}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex items-center gap-4">
                                <button className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-primary transition-colors">
                                    <Plus className="h-4 w-4" />
                                    Add to Watchlist
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-green-400 transition-colors">
                                    <Eye className="h-4 w-4" />
                                    Mark Watched
                                </button>
                                <button className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">Like</span>
                                    {/* No explicit like button as per rules "No likes-only feed", keeping it minimal */}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="text-center pt-4 text-sm text-gray-500">
                You're all caught up!
            </div>
        </div>
    );
}
