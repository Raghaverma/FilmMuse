"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Plus,
    Calendar,
    Clock,
    Star as StarIcon,
    ChevronLeft
} from "lucide-react";
import { motion } from "framer-motion";
import MovieCard from "@/components/MovieCard";

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
};

// Helper for runtime formatting
const formatRuntime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order?: number;
}



interface Movie {
    id: number;
    title: string;
    backdrop_path: string | null;
    tagline?: string;
    release_date: string;
    runtime: number;
    vote_average: number;
    genres: { id: number; name: string }[];
    overview: string;
    budget: number;
    original_language: string;
    poster_path?: string | null;
}

type Props = {
    movie: Movie;
    credits: {
        crew: Array<{ job: string; name: string }>;
        cast: CastMember[];
    };
    similar: Array<{ id: number; title: string; release_date?: string; poster_path?: string | null }>;
};

export default function MovieDetailsClient({ movie, credits, similar }: Props) {
    const router = useRouter();

    const director = credits?.crew?.find((person: { job: string; name: string }) => person.job === "Director");
    // writers casting to avoid undefined errors if crew is missing (handled by optional chaining mostly but good to be safe)
    const cast = credits?.cast?.slice(0, 10) || [];

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            {/* Immersive Backdrop */}
            <div className="relative h-[85vh] w-full">
                {/* Backdrop Image */}
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                        alt={movie.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    {/* Cinematic Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
                </div>

                {/* Content Container */}
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="absolute top-24 left-4 sm:left-8 flex items-center gap-2 text-neutral-300 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-4xl space-y-6"
                    >
                        {/* Title & Tagline */}
                        <div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2 leading-tight text-pretty">
                                {movie.title}
                            </h1>
                            {movie.tagline && (
                                <p className="text-xl md:text-2xl text-neutral-300 font-light italic text-pretty">
                                    &quot;{movie.tagline}&quot;
                                </p>
                            )}
                        </div>

                        {/* Meta Data Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-neutral-300">
                            {movie.release_date && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {new Date(movie.release_date).getFullYear()}
                                </div>
                            )}
                            {movie.runtime > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {formatRuntime(movie.runtime)}
                                </div>
                            )}
                            {movie.vote_average > 0 && (
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-500 border border-yellow-500/20">
                                    <StarIcon className="w-4 h-4 fill-current" />
                                    <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                                </div>
                            )}

                            {/* Genres */}
                            <div className="flex items-center gap-2">
                                {movie.genres?.map((g: { id: number; name: string }) => (
                                    <Badge key={g.id} variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-neutral-200">
                                        {g.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Overview */}
                        <p className="text-lg text-neutral-300 leading-relaxed max-w-2xl text-pretty">
                            {movie.overview}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-14 rounded-full shadow-[0_0_30px_-5px_var(--primary)] text-lg transition-transform hover:scale-105 active:scale-95">
                                <Play className="w-5 h-5 mr-2 fill-current" />
                                Watch Trailer
                            </Button>
                            <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white h-14 rounded-full px-6 backdrop-blur-md border border-white/10">
                                <Plus className="w-5 h-5 mr-2" />
                                Add to List
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Details Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">

                {/* Top Cast */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Top Cast</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {cast.map((actor: CastMember) => (
                            <div key={actor.id} className="group relative">
                                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-neutral-900 border border-white/5">
                                    {actor.profile_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                                            alt={actor.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, 20vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-500 bg-neutral-800">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="mt-3 space-y-1">
                                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{actor.name}</h3>
                                    <p className="text-sm text-neutral-400">{actor.character}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Info Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <div>
                        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Director</h3>
                        <p className="text-lg font-semibold text-white">{director?.name || "Unknown"}</p>
                    </div>
                    <div>
                        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Original Language</h3>
                        <p className="text-lg font-semibold text-white uppercase">{movie.original_language}</p>
                    </div>
                    <div>
                        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Budget</h3>
                        <p className="text-lg font-semibold text-white">{movie.budget > 0 ? formatCurrency(movie.budget) : "N/A"}</p>
                    </div>
                </section>

                {/* Similar Movies */}
                {similar.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">You May Also Like</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {similar.map((movie: { id: number; title: string; release_date?: string; poster_path?: string | null }) => (
                                <MovieCard
                                    key={movie.id}
                                    id={`tmdb-${movie.id}`}
                                    title={movie.title}
                                    year={movie.release_date ? parseInt(movie.release_date.split('-')[0]) : undefined}
                                    poster={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
