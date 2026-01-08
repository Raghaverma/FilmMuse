"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Pin, Users } from "lucide-react";

interface SharedMovie {
    id: number;
    poster: string;
    title: string;
}

interface TasteProfile {
    id: string;
    name: string;
    avatar: string;
    similarity: number; // 0-100
    agreement: string; // "Agree on X, disagree on Y"
    commonMovies: SharedMovie[];
    isPinned: boolean;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92";

export default function TasteMatching() {
    const [matches, setMatches] = useState<TasteProfile[]>([
        {
            id: "1",
            name: "Sarah Chen",
            avatar: "SC",
            similarity: 87,
            agreement: "You both love Sci-Fi & Psychological Thrillers",
            commonMovies: [
                { id: 1, title: "Inception", poster: "/9gk7admal4zl241ldb75630v568.jpg" }, // Fake paths
                { id: 2, title: "Arrival", poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
                { id: 3, title: "Dune", poster: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg" },
            ],
            isPinned: true,
        },
        {
            id: "2",
            name: "Mike Ross",
            avatar: "MR",
            similarity: 64,
            agreement: "Agree on Action, disagree on Art House",
            commonMovies: [
                { id: 4, title: "The Dark Knight", poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
                { id: 5, title: "Top Gun: Maverick", poster: "/62HCnUTZIyWcpDaBO2i1DX17dbH.jpg" },
            ],
            isPinned: false,
        },
    ]);

    const togglePin = (id: string) => {
        setMatches(prev => prev.map(m =>
            m.id === id ? { ...m, isPinned: !m.isPinned } : m
        ).sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1))); // Re-sort not implemented here to avoid jumpiness, but logic would go here
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center mb-8">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Find Your Taste Twin</h3>
                <p className="text-secondary text-sm max-w-md mx-auto">
                    We analyze your ratings to find friends who actually share your cinematic DNA.
                    Pin them to boost their recommendations.
                </p>
            </div>

            <div className="grid gap-4">
                {matches.map((match) => (
                    <div key={match.id} className="glass-card p-5 rounded-2xl transition-all hover:bg-white/5 relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {match.avatar}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                        {match.name}
                                        {match.similarity >= 80 && (
                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                                                High Match
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-sm text-primary font-medium">{match.similarity}% Taste Match</p>
                                </div>
                            </div>

                            <button
                                onClick={() => togglePin(match.id)}
                                className={`p-2 rounded-full transition-all ${match.isPinned ? "bg-primary text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                                title={match.isPinned ? "Unpin Taste Anchor" : "Pin as Taste Anchor"}
                            >
                                <Pin className={`h-4 w-4 ${match.isPinned ? "fill-white" : ""}`} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-300 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                                &quot;{match.agreement}&quot;
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-secondary mb-2 uppercase tracking-wider font-semibold">Shared Favorites</p>
                            <div className="flex gap-3">
                                {match.commonMovies.map((movie) => (
                                    <div key={movie.id} className="relative h-20 w-14 rounded-md overflow-hidden bg-gray-800 border border-white/10 group-hover:scale-105 transition-transform duration-300" title={movie.title}>
                                        <NextImage
                                            src={movie.poster.startsWith('/') ? `${IMAGE_BASE_URL}${movie.poster}` : "/placeholder-poster.png"}
                                            alt={movie.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
