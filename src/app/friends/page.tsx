"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Users, UserPlus, UserMinus, Search, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface Friend {
    uid: string;
    username: string;
    email: string;
    photoURL?: string;
    status: "friends" | "pending" | "requested";
}

export default function FriendsPage() {
    const { user, userProfile } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Mock friends data - replace with actual Firebase calls
        const mockFriends: Friend[] = [
            {
                uid: "1",
                username: "cinephile_alex",
                email: "alex@example.com",
                status: "friends",
            },
            {
                uid: "2",
                username: "movie_buff_sam",
                email: "sam@example.com",
                status: "friends",
            },
            {
                uid: "3",
                username: "film_lover_jordan",
                email: "jordan@example.com",
                status: "pending",
            },
        ];

        setTimeout(() => {
            setFriends(mockFriends);
            setLoading(false);
        }, 500);
    }, [user]);

    const handleAddFriend = (friendId: string, username: string) => {
        toast.success(`Friend request sent to ${username}`);
        // Add Firebase friend request logic here
    };

    const handleRemoveFriend = (friendId: string, username: string) => {
        setFriends(prev => prev.filter(f => f.uid !== friendId));
        toast.success(`Removed ${username} from friends`);
        // Add Firebase remove friend logic here
    };

    const handleAcceptRequest = (friendId: string, username: string) => {
        setFriends(prev =>
            prev.map(f =>
                f.uid === friendId ? { ...f, status: "friends" as const } : f
            )
        );
        toast.success(`You're now friends with ${username}`);
        // Add Firebase accept request logic here
    };

    const handleDeclineRequest = (friendId: string, username: string) => {
        setFriends(prev => prev.filter(f => f.uid !== friendId));
        toast.success(`Declined friend request from ${username}`);
        // Add Firebase decline request logic here
    };

    const filteredFriends = friends.filter(friend => {
        const matchesSearch = friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "friends"
            ? friend.status === "friends"
            : friend.status === "pending";
        return matchesSearch && matchesTab;
    });

    const friendsCount = friends.filter(f => f.status === "friends").length;
    const requestsCount = friends.filter(f => f.status === "pending").length;

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
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-display text-white">Friends</h1>
                            <p className="text-meta mt-1">
                                {friendsCount} {friendsCount === 1 ? 'friend' : 'friends'}
                                {requestsCount > 0 && ` • ${requestsCount} pending`}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg surface-raised text-sm text-white border border-white/10 focus-primary placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab("friends")}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "friends"
                                ? "text-white"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Friends ({friendsCount})
                        {activeTab === "friends" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "requests"
                                ? "text-white"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Requests ({requestsCount})
                        {activeTab === "requests" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-white/10" />
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-48 bg-white/10 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredFriends.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-2">
                            {activeTab === "friends" ? "No friends yet" : "No pending requests"}
                        </p>
                        <p className="text-meta mb-6">
                            {activeTab === "friends"
                                ? "Start connecting with other film lovers"
                                : "Friend requests will appear here"}
                        </p>
                    </div>
                )}

                {/* Friends List */}
                {!loading && filteredFriends.length > 0 && (
                    <div className="space-y-3">
                        {filteredFriends.map((friend) => (
                            <div
                                key={friend.uid}
                                className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Avatar */}
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {friend.username[0].toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">
                                                {friend.username}
                                            </h3>
                                            <p className="text-meta truncate">{friend.email}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {friend.status === "friends" && (
                                            <button
                                                onClick={() => handleRemoveFriend(friend.uid, friend.username)}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all focus-primary"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </button>
                                        )}

                                        {friend.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleAcceptRequest(friend.uid, friend.username)}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-all focus-primary flex items-center gap-2"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleDeclineRequest(friend.uid, friend.username)}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all focus-primary"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Friend CTA */}
                {!loading && activeTab === "friends" && (
                    <div className="mt-8 glass-card rounded-xl p-6 text-center">
                        <UserPlus className="h-12 w-12 text-primary mx-auto mb-3" />
                        <p className="text-gray-300 mb-4">Know someone who loves films?</p>
                        <button
                            onClick={() => toast.info("Friend search coming soon!")}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all focus-strong"
                        >
                            <UserPlus className="h-5 w-5" />
                            Find Friends
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
