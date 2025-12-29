"use client";

import * as React from "react";
import { Ticket, TrendingUp, Star, Calendar } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";
import StaggerList from "@/components/StaggerList";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type Movie = {
    id: number;
    title: string;
    release_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    overview?: string;
};

type MovieRowProps = {
    title: string;
    description?: string;
    endpoint: string;
    icon?: "ticket" | "trending" | "star" | "calendar";
};

const ICONS = {
    ticket: Ticket,
    trending: TrendingUp,
    star: Star,
    calendar: Calendar,
};

export default function MovieRow({ title, description, endpoint, icon }: MovieRowProps) {
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [loading, setLoading] = React.useState(true);
    const Icon = icon ? ICONS[icon] : null;

    React.useEffect(() => {
        let active = true;
        const loadMovies = async () => {
            setLoading(true);
            try {
                const res = await fetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    if (active) {
                        setMovies(data.results?.slice(0, 8) || []);
                    }
                }
            } catch (error) {
                console.error(`Failed to load movies for ${title}:`, error);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadMovies();
        return () => { active = false; };
    }, [endpoint, title]);

    if (loading) {
        return (
            <section className="relative" aria-labelledby={`title-${title}`}>
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h2 id={`title-${title}`} className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                            {Icon && <Icon className="h-5 w-5 text-primary" />}
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-neutral-400">
                                {description}
                            </p>
                        )}
                    </div>
                    <MovieCardGridSkeleton count={4} />
                </div>
            </section>
        );
    }

    if (movies.length === 0) {
        return null;
    }

    return (
        <section className="relative" aria-labelledby={`title-${title}`}>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                        <h2 id={`title-${title}`} className="text-xl font-semibold text-white">
                            {title}
                        </h2>
                    </div>
                    {description && (
                        <p className="text-sm text-neutral-400">
                            {description}
                        </p>
                    )}
                </div>

                <StaggerList
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    staggerDelay={0.03}
                >
                    {movies.map((movie) => {
                        const year = movie.release_date
                            ? parseInt(movie.release_date.split("-")[0])
                            : undefined;
                        const poster = movie.poster_path
                            ? `${IMAGE_BASE_URL}${movie.poster_path}`
                            : null;

                        return (
                            <MovieCard
                                key={movie.id}
                                id={`tmdb-${movie.id}`}
                                title={movie.title}
                                year={year}
                                poster={poster}
                                showInteraction={true}
                            />
                        );
                    })}
                </StaggerList>
            </div>
        </section>
    );
}
