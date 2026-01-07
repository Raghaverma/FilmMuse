"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Shield, Bell } from "lucide-react";

import FriendFeed from "@/components/friends/FriendFeed";
import TasteMatching from "@/components/friends/TasteMatching";
import FriendWatchlists from "@/components/friends/FriendWatchlists";

export default function FriendsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"feed" | "taste" | "watchlists">("feed");
    const [loading, setLoading] = useState(true);

    // Mock initial check
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setTimeout(() => setLoading(false), 500);
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen surface-base px-4 lg:px-8 py-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen surface-base px-4 lg:px-8 py-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-lg mb-4">Please log in to connect with friends</p>
                    <a
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all focus-strong"
                    >
                        Log In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen surface-base px-4 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-display text-white mb-1">Friends</h1>
                        <p className="text-secondary text-sm">See what your circle is watching</p>
                    </div>

                    <div className="flex gap-2">
                        {/* Privacy & Requests Toggles - Minimal */}
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Friend Requests">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Privacy Settings">
                            <Shield className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Friend Requests (Collapsible/Conditional) */}
                {/* <div className="mb-8">
                     <FriendRequestsList /> 
                </div> */}

                {/* Navigation Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl mb-8 w-fit mx-auto lg:mx-0">
                    <button
                        onClick={() => setActiveTab("feed")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "feed"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Activity Feed
                    </button>
                    <button
                        onClick={() => setActiveTab("taste")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "taste"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Taste Match
                    </button>
                    <button
                        onClick={() => setActiveTab("watchlists")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "watchlists"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Watchlists
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === "feed" && <FriendFeed />}
                    {activeTab === "taste" && <TasteMatching />}
                    {activeTab === "watchlists" && <FriendWatchlists />}
                </div>
            </div>
        </div>
    );
}
