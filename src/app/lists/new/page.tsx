"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { createCustomList, addMovieToCustomList, type MovieItem } from "@/lib/firebase/firestore";
import { Plus, Search, X, Lock, Globe, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface SearchResult {
    id: string;
    title: string;
    year?: number;
    poster_path?: string | null;
}

export default function NewListPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [listName, setListName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedMovies, setSelectedMovies] = useState<MovieItem[]>([]);
    const [searching, setSearching] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const res = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.results?.slice(0, 10) || []);
            }
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("Failed to search movies");
        } finally {
            setSearching(false);
        }
    };

    const handleAddMovie = (movie: SearchResult) => {
        const movieItem: MovieItem = {
            id: movie.id,
            title: movie.title,
            year: movie.year,
            poster: movie.poster_path,
        };

        if (!selectedMovies.some(m => m.id === movie.id)) {
            setSelectedMovies(prev => [...prev, movieItem]);
            toast.success(`Added "${movie.title}"`);
        }
    };

    const handleRemoveMovie = (movieId: string) => {
        setSelectedMovies(prev => prev.filter(m => m.id !== movieId));
    };

    const handleCreateList = async () => {
        if (!user) {
            toast.error("Please log in to create a list");
            return;
        }

        if (!listName.trim()) {
            toast.error("Please enter a list name");
            return;
        }

        setCreating(true);
        try {
            const newList = await createCustomList(listName, description);

            // Add all selected movies to the list
            for (const movie of selectedMovies) {
                await addMovieToCustomList(newList.id, movie);
            }

            toast.success(`Created "${listName}" with ${selectedMovies.length} films`);
            router.push("/lists");
        } catch (error) {
            console.error("Failed to create list:", error);
            toast.error("Failed to create list");
        } finally {
            setCreating(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen surface-base px-4 lg:px-8 py-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-lg mb-4">Please log in to create lists</p>
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
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-display text-white">Create New List</h1>
                        <p className="text-meta mt-1">Organize your favorite films</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: List Details */}
                    <div className="space-y-6">
                        {/* List Name */}
                        <div className="glass-card rounded-xl p-6">
                            <label className="block text-sm font-medium text-white mb-2">
                                List Name *
                            </label>
                            <input
                                type="text"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                placeholder="e.g., Best Sci-Fi Films"
                                className="w-full px-4 py-3 rounded-lg surface-raised text-white border border-white/10 focus-primary placeholder:text-gray-500"
                                maxLength={50}
                            />
                            <p className="text-meta mt-2">{listName.length}/50 characters</p>
                        </div>

                        {/* Description */}
                        <div className="glass-card rounded-xl p-6">
                            <label className="block text-sm font-medium text-white mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What makes this list special?"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg surface-raised text-white border border-white/10 focus-primary placeholder:text-gray-500 resize-none"
                                maxLength={200}
                            />
                            <p className="text-meta mt-2">{description.length}/200 characters</p>
                        </div>

                        {/* Privacy */}
                        <div className="glass-card rounded-xl p-6">
                            <label className="block text-sm font-medium text-white mb-4">
                                Privacy
                            </label>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsPublic(false)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all focus-primary ${!isPublic
                                            ? "border-primary bg-primary/10"
                                            : "border-white/10 hover:bg-white/5"
                                        }`}
                                >
                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${!isPublic ? "border-primary" : "border-gray-400"
                                        }`}>
                                        {!isPublic && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <Lock className="h-5 w-5 text-gray-400" />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-white">Private</p>
                                        <p className="text-meta">Only you can see this list</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setIsPublic(true)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all focus-primary ${isPublic
                                            ? "border-primary bg-primary/10"
                                            : "border-white/10 hover:bg-white/5"
                                        }`}
                                >
                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isPublic ? "border-primary" : "border-gray-400"
                                        }`}>
                                        {isPublic && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <Globe className="h-5 w-5 text-gray-400" />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-white">Public</p>
                                        <p className="text-meta">Anyone can view this list</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={handleCreateList}
                            disabled={!listName.trim() || creating}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-strong"
                        >
                            {creating ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check className="h-5 w-5" />
                                    Create List ({selectedMovies.length} films)
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Movie Search & Selection */}
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="glass-card rounded-xl p-6">
                            <label className="block text-sm font-medium text-white mb-3">
                                Add Films
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        placeholder="Search for films..."
                                        className="w-full pl-10 pr-4 py-3 rounded-lg surface-raised text-white border border-white/10 focus-primary placeholder:text-gray-500"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery.trim()}
                                    className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50 focus-primary"
                                >
                                    {searching ? "..." : "Search"}
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                                    {searchResults.map((movie) => (
                                        <div
                                            key={movie.id}
                                            className="flex items-center gap-3 p-3 rounded-lg surface-raised hover:bg-white/5 transition-all"
                                        >
                                            {movie.poster_path ? (
                                                <div className="relative h-16 w-11 flex-shrink-0 rounded overflow-hidden">
                                                    <Image
                                                        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                                                        alt={movie.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="44px"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-11 flex-shrink-0 rounded bg-white/5 flex items-center justify-center">
                                                    <Plus className="h-4 w-4 text-gray-600" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white text-sm truncate">
                                                    {movie.title}
                                                </p>
                                                {movie.year && (
                                                    <p className="text-meta">{movie.year}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleAddMovie(movie)}
                                                disabled={selectedMovies.some(m => m.id === movie.id)}
                                                className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-primary"
                                            >
                                                {selectedMovies.some(m => m.id === movie.id) ? "Added" : "Add"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Movies */}
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-white">
                                    Selected Films ({selectedMovies.length})
                                </h3>
                                {selectedMovies.length > 0 && (
                                    <button
                                        onClick={() => setSelectedMovies([])}
                                        className="text-xs text-gray-400 hover:text-white transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {selectedMovies.length === 0 ? (
                                <div className="text-center py-8">
                                    <Plus className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                                    <p className="text-meta">No films added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {selectedMovies.map((movie) => (
                                        <div
                                            key={movie.id}
                                            className="flex items-center gap-3 p-3 rounded-lg surface-raised group"
                                        >
                                            {movie.poster ? (
                                                <div className="relative h-16 w-11 flex-shrink-0 rounded overflow-hidden">
                                                    <Image
                                                        src={`${IMAGE_BASE_URL}${movie.poster}`}
                                                        alt={movie.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="44px"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-11 flex-shrink-0 rounded bg-white/5" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white text-sm truncate">
                                                    {movie.title}
                                                </p>
                                                {movie.year && (
                                                    <p className="text-meta">{movie.year}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMovie(movie.id)}
                                                className="h-8 w-8 rounded-lg hover:bg-destructive/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all focus-primary"
                                            >
                                                <X className="h-4 w-4 text-gray-400 hover:text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
