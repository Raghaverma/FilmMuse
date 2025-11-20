"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import CarouselSlide from "./CarouselSlide";

interface BannerCarouselProps {
  items: { id: string; title: string; year?: number; meta?: string; poster?: string | null }[];
  interval?: number;
}

export default function BannerCarousel({
  items,
  interval = 4500,
}: BannerCarouselProps) {
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [hovering, setHovering] = React.useState(false);
  const [selectedMovie, setSelectedMovie] = React.useState<{ id: string; title: string; year?: number; poster?: string | null; meta?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const total = items.length;

  React.useEffect(() => {
    if (prefersReduced || hovering || total <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), interval);
    return () => clearInterval(id);
  }, [prefersReduced, hovering, total, interval]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);

  const handleMovieClick = (movie: { id: string; title: string; year?: number; poster?: string | null; meta?: string }) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-xl cursor-pointer"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-roledescription="carousel"
        aria-label="Featured film banners"
      >
        <div className="relative aspect-[16/9] w-full">
          {items.map((f, i) => {
            const active = i === index;
            return (
              <CarouselSlide
                key={f.id}
                movie={f}
                active={active}
                index={i}
                total={total}
                prefersReduced={prefersReduced}
                onClick={() => active && handleMovieClick(f)}
              />
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2 sm:p-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Previous slide"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-neutral-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Next slide"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-neutral-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-emerald-400" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMovie(null);
          }}
        />
      )}
    </>
  );
}

