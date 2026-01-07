"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";

interface Activity {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    type: "liked" | "rated" | "reviewed";
    movie: {
        id: number;
        title: string;
        poster: string;
    };
    rating?: number;
    comment?: string;
    timestamp: string;
}

export default function FriendActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        // Mock data - replace with actual API call
        const mockActivities: Activity[] = [
            {
                id: "1",
                user: { name: "Sarah Chen", avatar: "SC" },
                type: "rated",
                movie: { id: 550, title: "Fight Club", poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
                rating: 5,
                timestamp: "2 hours ago",
            },
            {
                id: "2",
                user: { name: "Mike Johnson", avatar: "MJ" },
                type: "liked",
                movie: { id: 13, title: "Forrest Gump", poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
                timestamp: "5 hours ago",
            },
            {
                id: "3",
                user: { name: "Emma Davis", avatar: "ED" },
                type: "reviewed",
                movie: { id: 278, title: "The Shawshank Redemption", poster: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg" },
                comment: "An absolute masterpiece! The storytelling is phenomenal.",
                timestamp: "1 day ago",
            },
        ];
        setActivities(mockActivities);
    }, []);

    const getActivityIcon = (type: Activity["type"]) => {
        switch (type) {
            case "liked":
                return <Heart className="h-4 w-4 text-primary fill-primary" />;
            case "rated":
                return <Star className="h-4 w-4 text-accent fill-accent" />;
            case "reviewed":
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
        }
    };

    const getActivityText = (activity: Activity) => {
        switch (activity.type) {
            case "liked":
                return "liked";
            case "rated":
                return `rated ${activity.rating}/5`;
            case "reviewed":
                return "reviewed";
        }
    };

    if (activities.length === 0) return null;

    return (
        <section className="px-4 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Friend Activity</h2>
                    <Link href="/friends" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        View All
                    </Link>
                </div>

                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="glass-card rounded-xl p-4 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex gap-4">
                                {/* User Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                                        {activity.user.avatar}
                                    </div>
                                </div>

                                {/* Activity Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-white">{activity.user.name}</span>
                                        {getActivityIcon(activity.type)}
                                        <span className="text-gray-400">{getActivityText(activity)}</span>
                                        <Link
                                            href={`/movie/${activity.movie.id}`}
                                            className="text-primary hover:underline truncate"
                                        >
                                            {activity.movie.title}
                                        </Link>
                                    </div>

                                    {activity.comment && (
                                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                                            &quot;{activity.comment}&quot;
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                </div>

                                {/* Movie Poster */}
                                <Link
                                    href={`/movie/${activity.movie.id}`}
                                    className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden hover:scale-105 transition-transform"
                                >
                                    <NextImage
                                        src={`https://image.tmdb.org/t/p/w92${activity.movie.poster}`}
                                        alt={activity.movie.title}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
