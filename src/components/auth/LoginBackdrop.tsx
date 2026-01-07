"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film } from "lucide-react";
import NextImage from "next/image";

interface Movie {
    id: number;
    title: string;
    backdrop_path?: string | null;
    poster_path?: string | null;
    vote_average?: number;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w200";

export default function LoginBackdrop() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch("/api/movies/trending?time_window=week");
                if (res.ok) {
                    const data = await res.json();
                    // Filter for movies with backdrops
                    setMovies(data.results?.filter((m: Movie) => m.backdrop_path).slice(0, 10) || []);
                }
            } catch (error) {
                console.error("Failed to fetch backdrop movies:", error);
            }
        };
        fetchTrending();
    }, []);

    useEffect(() => {
        if (movies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 8000); // 8 seconds per slide
        return () => clearInterval(interval);
    }, [movies.length]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20; // -10 to 10
        const y = (clientY / window.innerHeight - 0.5) * 20; // -10 to 10
        setMousePosition({ x, y });
    };

    const currentMovie = movies[currentIndex];

    if (!currentMovie) return <div className="hidden lg:flex flex-1 bg-black" />;

    return (
        <div
            className="hidden lg:relative lg:flex lg:w-[60%] lg:flex-col justify-between overflow-hidden bg-black text-white"
            onMouseMove={handleMouseMove}
        >
            {/* Dynamic Backdrop */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${IMAGE_BASE_URL}${currentMovie.backdrop_path})`,
                            transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px) scale(1.05)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-black/30" />
                </motion.div>
            </AnimatePresence>

            {/* Content Layer */}
            <div className="relative z-10 flex h-full flex-col justify-between p-12">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm">
                        <Film className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">
                        Film<span className="text-primary">Muse</span>
                    </span>
                </div>

                {/* Center Content */}
                <div className="max-w-lg space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-bold leading-tight"
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-300 leading-relaxed"
                    >
                        Discover films curated to your taste.
                        <br />
                        Continue your cinematic journey.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap gap-3 pt-2"
                    >
                        <FeaturePill icon="🎬" text="10M+ Movies" />
                        <FeaturePill icon="⭐" text="Personalized Lists" />
                        <FeaturePill icon="👥" text="Film Community" />
                    </motion.div>
                </div>

                {/* Bottom Section: Trending Strip */}
                <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Trending Now</p>
                    <div className="flex gap-4 overflow-hidden">
                        {movies.slice(0, 4).map((movie) => (
                            <motion.div
                                key={movie.id}
                                className="relative h-[200px] w-[140px] shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-lg cursor-pointer group"
                                whileHover={{ y: -5, scale: 1.05 }}
                            >
                                <NextImage
                                    src={`${POSTER_BASE_URL}${movie.poster_path}`}
                                    alt={movie.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="140px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute top-2 right-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold">
                                    {Math.round((movie.vote_average || 0) * 10)}%
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeaturePill({ icon, text }: { icon: string; text: string }) {
    return (
        <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
}
