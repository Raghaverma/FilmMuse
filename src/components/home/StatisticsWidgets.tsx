"use client";

import { TrendingDown, Heart, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

export default function StatisticsWidgets() {
    // Mock insights - replace with actual user behavior analysis
    const insights = [
        {
            label: "Completion Pattern",
            insight: "You abandon 32% of movies after 20 min",
            action: "Try shorter films",
            actionHref: "/discover?duration=short",
            icon: TrendingDown,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            hoverBg: "hover:bg-orange-500/20",
        },
        {
            label: "Genre Preference",
            insight: "You rate dramas highest",
            detail: "4.8 avg rating",
            action: "More like this",
            actionHref: "/discover?genre=drama",
            icon: Heart,
            color: "text-pink-500",
            bgColor: "bg-pink-500/10",
            hoverBg: "hover:bg-pink-500/20",
        },
        {
            label: "Queue Health",
            insight: "Your queue grows faster than you watch",
            detail: "+12 this week, -3 watched",
            action: "Clear old items",
            actionHref: "/watchlist?sort=oldest",
            icon: Sparkles,
            color: "text-primary",
            bgColor: "bg-primary/10",
            hoverBg: "hover:bg-primary/20",
        },
        {
            label: "Viewing Habits",
            insight: "You watch most on Friday nights",
            detail: "Peak: 9-11 PM",
            action: "Plan ahead",
            actionHref: "/discover?save=true",
            icon: Calendar,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            hoverBg: "hover:bg-blue-500/20",
        },
    ];

    return (
        <section className="px-4 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-5">
                    <h2 className="text-headline text-white">Insights</h2>
                    <p className="text-meta mt-1">Patterns from your viewing behavior</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {insights.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.label}
                                href={stat.actionHref}
                                className={`glass-card rounded-2xl p-5 transition-all group focus-primary ${stat.hoverBg}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`h-11 w-11 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {stat.label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white mb-1 leading-tight">
                                        {stat.insight}
                                    </p>
                                    {stat.detail && (
                                        <p className="text-meta mb-3">{stat.detail}</p>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                                        <span>{stat.action}</span>
                                        <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
