"use client";

import { useState } from "react";
import { Search, Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <>
            {/* Desktop Header */}
            <header className="hidden lg:block sticky top-0 z-40 glass border-b border-white/5">
                <div className="flex items-center justify-between h-16 px-6">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search movies, shows, people..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none transition-all focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </form>

                    {/* Notifications */}
                    <button className="relative ml-4 p-2.5 rounded-xl hover:bg-white/10 transition-colors group">
                        <Bell className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </button>
                </div>
            </header>

            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 glass border-b border-white/5">
                <div className="flex items-center justify-between h-14 px-4">
                    <h1 className="text-lg font-bold">
                        Film<span className="text-primary">Muse</span>
                    </h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Search className="h-5 w-5 text-gray-400" />
                        </button>
                        <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <Bell className="h-5 w-5 text-gray-400" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Search Overlay */}
            {searchOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 p-4 border-b border-white/10">
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search movies..."
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:bg-white/10 focus:border-primary/50"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Search suggestions could go here */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <p className="text-sm text-gray-500 text-center mt-8">
                                Start typing to search...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
