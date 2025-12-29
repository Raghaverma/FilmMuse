"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Film, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SearchResult = {
    id: number;
    title: string;
    release_date?: string;
    poster_path?: string | null;
    overview?: string;
    vote_average?: number;
};

export default function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
                if (
                    (e.target instanceof HTMLElement && e.target.isContentEditable) ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLSelectElement
                ) {
                    return;
                }

                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
        } else {
            // Focus input when opened
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    React.useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results?.slice(0, 5) || []);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (id: number) => {
        setOpen(false);
        router.push(`/movie/${id}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 gap-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-neutral-200 max-w-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-3 border-b border-white/10">
                    <Search className="h-5 w-5 text-neutral-400 mr-3" />
                    <input
                        ref={inputRef}
                        placeholder="Search movies, TV shows, or actors..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-neutral-500"
                    />
                    <div className="flex items-center gap-1 text-xs text-neutral-500 bg-white/5 px-2 py-1 rounded">
                        <span className="text-xs">ESC</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {!query && (
                        <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                            <p>Type to search for movies...</p>
                        </div>
                    )}

                    {query && loading && (
                        <div className="px-4 py-8 text-center text-neutral-500 text-sm animate-pulse">
                            Searching...
                        </div>
                    )}

                    {query && !loading && results.length === 0 && (
                        <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                            No results found for "{query}"
                        </div>
                    )}

                    <div className="space-y-1">
                        {results.map((movie, index) => (
                            <motion.div
                                key={movie.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleSelect(movie.id)}
                                className="group flex items-start gap-4 p-3 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent cursor-pointer transition-colors"
                            >
                                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-800">
                                    {movie.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                            alt={movie.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Film className="h-6 w-6 text-neutral-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-white group-hover:text-emerald-400 truncate">
                                            {movie.title}
                                        </h4>
                                        {movie.vote_average && (
                                            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                                {movie.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                                        {movie.release_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {movie.release_date.split("-")[0]}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs text-neutral-500 line-clamp-1">
                                        {movie.overview}
                                    </p>
                                </div>

                                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-4 w-4 text-emerald-400" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
