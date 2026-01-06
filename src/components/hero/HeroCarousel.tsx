"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

type Movie = {
    id: number;
    title: string;
    backdrop_path?: string | null;
    poster_path?: string | null;
    overview?: string;
    vote_average?: number;
    release_date?: string;
};

export default function HeroCarousel() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch trending movies for the carousel
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch("/api/movies/trending?time_window=week");
                if (res.ok) {
                    const data = await res.json();
                    // Take top 5 movies with backdrops
                    setMovies(data.results?.filter((m: Movie) => m.backdrop_path).slice(0, 5) || []);
                }
            } catch (error) {
                console.error("Failed to fetch trending movies:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    // Auto-play
    useEffect(() => {
        if (movies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [movies.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, [movies.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    }, [movies.length]);

    if (isLoading) {
        return (
            <div className="w-full h-[80vh] bg-black animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (movies.length === 0) return null;

    const currentMovie = movies[currentIndex];

    return (
        <section className="relative w-full h-[85vh] overflow-hidden bg-black group">
            {/* Label */}
            <div className="absolute top-24 left-4 md:left-12 z-20">
                <span className="inline-block px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
                    Trending Now
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear scale-105 group-hover:scale-110"
                        style={{
                            backgroundImage: `url(${IMAGE_BASE_URL}${currentMovie.backdrop_path})`
                        }}
                    />
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 pb-20 md:pb-24">
                <div className="max-w-3xl space-y-4">
                    <motion.h1
                        key={`title-${currentMovie.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
                    >
                        {currentMovie.title}
                    </motion.h1>

                    <motion.div
                        key={`meta-${currentMovie.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex items-center gap-4 text-sm md:text-base font-medium text-gray-300"
                    >
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            <span>{currentMovie.vote_average?.toFixed(1)}</span>
                        </div>
                        <span>•</span>
                        <span>{currentMovie.release_date?.split('-')[0]}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 border border-white/20 rounded text-xs text-white">HD</span>
                    </motion.div>

                    <motion.p
                        key={`desc-${currentMovie.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-gray-300 text-sm md:text-lg line-clamp-3 max-w-2xl text-balance"
                    >
                        {currentMovie.overview}
                    </motion.p>

                    <motion.div
                        key={`actions-${currentMovie.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex items-center gap-4 pt-4"
                    >
                        <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg text-lg font-semibold shadow-lg shadow-primary/25 transition-transform hover:scale-105 group/btn">
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Watch Trailer
                        </Button>

                        <Button variant="outline" className="border-white/20 hover:border-white text-white bg-white/5 hover:bg-white/10 h-14 w-14 rounded-full p-0 transition-transform hover:scale-110">
                            <Plus className="w-6 h-6" />
                            <span className="sr-only">Add to List</span>
                        </Button>

                        <Button variant="outline" className="border-white/20 hover:border-white text-white bg-white/5 hover:bg-white/10 h-14 w-14 rounded-full p-0 transition-transform hover:scale-110">
                            <Info className="w-6 h-6" />
                            <span className="sr-only">Details</span>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Pagination / Navigation */}
            <div className="absolute bottom-8 right-8 z-30 flex items-center gap-4">
                {/* Navigation Arrows */}
                <div className="hidden md:flex gap-2 mr-4">
                    <button onClick={handlePrev} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={handleNext} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Dots */}
                <div className="flex gap-2">
                    {movies.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                idx === currentIndex ? "w-8 bg-primary" : "bg-white/30 hover:bg-white/50"
                            )}
                        >
                            <span className="sr-only">Slide {idx + 1}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
