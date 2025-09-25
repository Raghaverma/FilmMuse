"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Film,
  Sparkles,
  Heart,
  ListChecks,
  SlidersHorizontal,
  ArrowRight,
  Star,
  Search,
} from "lucide-react";

const FILMS = [
  {
    id: "blade-runner-2049",
    title: "Blade Runner 2049",
    year: 2017,
    meta: "Sci-Fi • Neo-Noir • 2h 44m",
    poster: "/banners/Blade-Runner.jpg",
  },
  {
    id: "demon-slayer-infinity-castle",
    title: "Demon Slayer: Infinity Castle",
    year: 2025,
    meta: "Anime • Action • Fantasy",
    poster: "/banners/Demon%20Slayer%20Infinity%20Castle.jpg",
  },
  {
    id: "get-out",
    title: "Get Out",
    year: 2017,
    meta: "Horror • Mystery • 1h 44m",
    poster: "/banners/getout.jpg",
  },
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    meta: "Sci-Fi • Thriller • 2h 28m",
    poster: "/banners/Inception.jpg",
  },
  {
    id: "mad-max-fury-road",
    title: "Mad Max: Fury Road",
    year: 2015,
    meta: "Action • Adventure • 2h 0m",
    poster: "/banners/madmax.jpg",
  },
  {
    id: "past-lives",
    title: "Past Lives",
    year: 2023,
    meta: "Romance • Drama • 1h 46m",
    poster: "/banners/PastLives.jpeg",
  },
  {
    id: "grand-budapest-hotel",
    title: "The Grand Budapest Hotel",
    year: 2014,
    meta: "Comedy • Drama • 1h 39m",
    poster: "/banners/The%20Grand%20Budapest%20Hotel.jpg",
  },
];

export default function Page() {
  return (
    <main
      id="main"
      className="min-h-screen bg-[#0a0a0a] text-neutral-100 selection:bg-emerald-300/20 selection:text-emerald-200"
    >
      <DottedBG />
      <NavBar />
      <Hero />
      <TrustBar />
      <SectionDiscover />
      <Footer />
    </main>
  );
}

/* ─────────────────────────────────────── Sections ─────────────────────────────────────── */

function NavBar() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur supports-[backdrop-filter]:bg-black/40"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-tight"
          aria-label="FilmMuse home"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-400/10 ring-1 ring-emerald-400/30">
            <Film className="h-4 w-4 text-emerald-300" />
          </span>
          <span className="text-sm uppercase text-neutral-300">FilmMuse</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 text-sm text-neutral-300 md:flex"
        >
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#discover" className="hover:text-white">
            Discover
          </a>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <details className="md:hidden">
      <summary className="list-none">
        <div
          className="rounded-md border border-white/10 p-2"
          role="button"
          aria-label="Open menu"
        >
          <div className="space-y-1">
            <div className="h-0.5 w-6 bg-neutral-400" />
            <div className="h-0.5 w-6 bg-neutral-400" />
            <div className="h-0.5 w-6 bg-neutral-400" />
          </div>
        </div>
      </summary>
      <div className="absolute left-0 right-0 mt-3 border-t border-white/10 bg-black/90 backdrop-blur">
        <nav className="flex flex-col gap-3 px-4 py-4 text-sm" aria-label="Mobile">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#discover">Discover</a>
          <div className="pt-2">
            <Button asChild className="w-full bg-emerald-400 text-black hover:bg-emerald-300">
              <a href="#discover">Try FilmMuse</a>
            </Button>
          </div>
        </nav>
      </div>
    </details>
  );
}

function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            id="hero-title"
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Find the perfect film for your mood.
          </motion.h1>

          <p className="mt-4 max-w-2xl text-neutral-400">
            FilmMuse learns what you like and curates watchlists, trailers, and hidden
            gems — all without the endless scroll.
          </p>

          <div className="mt-8 w-full max-w-xl">
            <SearchBar />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 text-xs text-neutral-400 sm:grid-cols-4">
            {["Mood graphs", "Trailer snapshots", "Smart lists", "Spoiler-free synopses"].map(
              (t) => (
                <div
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                >
                  {t}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
      <HeroVisual />
    </section>
  );
}

/** Updated SearchBar: label "Search" and redirects to /search?q=... */
function SearchBar() {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative grow">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by mood, vibe, or a film you loved..."
          className="bg-white/5 pl-9 border-white/10 focus-visible:ring-emerald-400"
          aria-label="Search films"
        />
      </div>
      <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300">
        Search
      </Button>
    </form>
  );
}

/* ───────────────────────── Hero Visual: Banner Carousel ───────────────────────── */

function HeroVisual() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative -mt-6 mx-auto max-w-6xl select-none px-4 pb-8 sm:px-6 lg:px-8">
      <motion.div
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-2 shadow-2xl"
      >
        <BannerCarousel items={FILMS} />
      </motion.div>
    </div>
  );
}

function BannerCarousel({
  items,
  interval = 4500,
}: {
  items: { id: string; title: string; year: number; meta: string; poster: string }[];
  interval?: number;
}) {
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [hovering, setHovering] = React.useState(false);
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

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-roledescription="carousel"
      aria-label="Featured film banners"
    >
      {/* Slides */}
      <div className="relative aspect-[16/9] w-full">
        {items.map((f, i) => {
          const active = i === index;
          return (
            <motion.div
              key={f.id}
              className="absolute inset-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${f.title} (${i + 1} of ${total})`}
              initial={false}
              animate={
                active
                  ? { opacity: 1, scale: prefersReduced ? 1 : 1.0 }
                  : { opacity: 0, scale: prefersReduced ? 1 : 1.02 }
              }
              transition={{ duration: prefersReduced ? 0 : 0.5 }}
              style={{ pointerEvents: active ? "auto" : "none" }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={f.poster}
                  alt={`${f.title} banner`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width:1280px) 90vw, 1200px"
                  className="object-cover"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-6">
                  <div className="max-w-[80%]">
                    <div className="text-lg font-semibold text-neutral-100 sm:text-2xl drop-shadow">
                      {f.title}
                    </div>
                    <div className="text-xs text-neutral-200/90 sm:text-sm drop-shadow">
                      {f.year} • {f.meta}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
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

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-emerald-400" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* Trust bar */
function TrustBar() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-neutral-500">
        <span>Personalized • No spoilers • Fast</span>
        <span className="hidden sm:inline">|</span>
        <span>Privacy-respecting</span>
        <span className="hidden sm:inline">|</span>
        <span>Built for film lovers</span>
      </div>
    </div>
  );
}

/* Discover */
function SectionDiscover() {
  return (
    <section id="discover" className="relative" aria-labelledby="discover-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="discover-title" className="text-xl font-semibold text-neutral-200">
            Today&apos;s curated lineup
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FILMS.map((f, idx) => (
            <article
              key={f.id}
              className="group overflow-hidden rounded-xl border border-white/10 bg-white/5"
              aria-label={`${f.title} (${f.year})`}
            >
              <div className="relative w-full overflow-hidden rounded-b-none">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={f.poster}
                    alt={`${f.title} banner`}
                    fill
                    priority={idx < 2}
                    sizes="(max-width: 768px) 100vw, (max-width:1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      (e.currentTarget as unknown as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                  <div className="absolute inset-0 hidden bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:opacity-90 sm:block" />
                  <div className="absolute inset-0 sm:hidden bg-[radial-gradient(circle_at_60%_40%,rgba(16,185,129,.15),transparent_50%)]" />
                </div>

                <div className="absolute inset-x-0 bottom-0 z-[1] p-3">
                  <div className="text-sm font-medium text-neutral-100 drop-shadow">
                    {f.title}
                  </div>
                  <div className="text-xs text-neutral-300/90 drop-shadow">
                    {f.year} • {f.meta}
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Star className="h-4 w-4 text-neutral-500" /> Curated for your vibe
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="border-t border-white/5 bg-[#0a0a0a] text-sm text-neutral-500"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-neutral-400" aria-hidden="true" />
          <span className="text-xs">© {new Date().getFullYear()} FilmMuse, Inc.</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs" aria-label="Footer">
          <a href="#" className="hover:text-neutral-300">
            Terms
          </a>
          <a href="#" className="hover:text-neutral-300">
            Privacy
          </a>
          <a href="#" className="hover:text-neutral-300">
            Security
          </a>
          <a href="#" className="hover:text-neutral-300">
            Status
          </a>
          <a href="#" className="hover:text-neutral-300">
            Community
          </a>
          <a href="#" className="hover:text-neutral-300">
            Docs
          </a>
          <a href="#" className="hover:text-neutral-300">
            Contact
          </a>
          <a href="#" className="hover:text-neutral-300">
            Manage cookies
          </a>
        </nav>
      </div>
    </footer>
  );
}

function DottedBG() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_50%_-50%,rgba(16,185,129,0.15),transparent_70%)]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dot" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot)" />
      </svg>
      <div className="pointer-events-none absolute inset-6 grid grid-cols-2 grid-rows-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-emerald-300/30"
            style={{
              borderTopWidth: i < 2 ? 2 : 0,
              borderBottomWidth: i >= 2 ? 2 : 0,
              borderLeftWidth: i % 2 === 0 ? 2 : 0,
              borderRightWidth: i % 2 === 1 ? 2 : 0,
              borderRadius: 12,
            }}
          />
        ))}
      </div>
    </div>
  );
}
