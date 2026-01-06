"use client";

import { Film, Heart, Star, Users } from "lucide-react";

export default function StatisticsWidgets() {
    // Mock data - replace with actual user stats
    const stats = [
        {
            label: "Movies Watched",
            value: "127",
            icon: Film,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            label: "In Watchlist",
            value: "43",
            icon: Heart,
            color: "text-pink-500",
            bgColor: "bg-pink-500/10",
        },
        {
            label: "Avg Rating",
            value: "4.2",
            icon: Star,
            color: "text-accent",
            bgColor: "bg-accent/10",
        },
        {
            label: "Friends",
            value: "28",
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
    ];

    return (
        <section className="px-4 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Your Stats</h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                    <p className="text-sm text-gray-400">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
