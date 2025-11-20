"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Film,
  Star,
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserWatchlist } from "@/lib/firebase/firestore";
import { loginWithEmail, signupWithEmail } from "@/lib/firebase/auth";
import MovieCard from "@/components/MovieCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Removed hardcoded FILMS - now using dynamic recommendations

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
  const [user, setUser] = React.useState<{ email: string; username: string } | null>(null);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);

  const { user: firebaseUser, userProfile } = useAuth();

  React.useEffect(() => {
    if (firebaseUser && userProfile) {
      setUser({ email: userProfile.email, username: userProfile.username });
    } else {
      setUser(null);
    }
  }, [firebaseUser, userProfile]);

  const handleAuthSuccess = () => {
    if (firebaseUser && userProfile) {
      setUser({ email: userProfile.email, username: userProfile.username });
    }
    setShowAuthDialog(false);
  };

  return (
    <>
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
            {user ? (
              <Link href="/profile" className="hover:text-white">
                Profile
              </Link>
            ) : (
              <>
                <button onClick={() => { setIsLogin(true); setShowAuthDialog(true); }} className="hover:text-white">
                  Log in
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setShowAuthDialog(true); }} 
                  className="rounded-md border border-white/15 px-3 py-1.5 hover:bg-white/10"
                >
                  Sign up
                </button>
              </>
            )}
          </nav>
          <MobileMenu user={user} setIsLogin={setIsLogin} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </header>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {isLogin ? "Log in" : "Create your account"}
            </DialogTitle>
          </DialogHeader>
          {isLogin ? (
            <LoginForm onSuccess={handleAuthSuccess} onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MobileMenu({ user, setIsLogin, setShowAuthDialog }: { 
  user: { email: string; username: string } | null;
  setIsLogin: (val: boolean) => void;
  setShowAuthDialog: (val: boolean) => void;
}) {
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
          {user ? (
            <Link href="/profile">Profile</Link>
          ) : (
            <>
              <button onClick={() => { setIsLogin(true); setShowAuthDialog(true); }}>Log in</button>
              <button onClick={() => { setIsLogin(false); setShowAuthDialog(true); }}>Sign up</button>
            </>
          )}
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
            FilmMuse learns what you like and curates watchlists and hidden
            gems — all without the endless scroll.
          </p>
          <div className="mt-8 w-full max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 text-xs text-neutral-400 sm:grid-cols-3">
            {["Mood graphs", "Smart lists", "Spoiler-free synopses"].map(
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
  const { user } = useAuth();
  const [recommendedMovies, setRecommendedMovies] = React.useState<Array<{ id: string; title: string; year?: number; meta?: string; poster?: string | null }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        // Try to get personalized recommendations if user is logged in
        if (user) {
          try {
            const watchlist = await getUserWatchlist(user.uid);
            const res = await fetch("/api/recommendations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                watchlist: watchlist.watchlist,
                liked: watchlist.liked,
              }),
            });
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              setRecommendedMovies(data.items.slice(0, 8)); // Get top 8 for carousel
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Failed to load personalized recommendations:", error);
          }
        }
        
        // Fallback to random recommendations
        const res = await fetch("/api/recommendations/random");
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setRecommendedMovies(data.items.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user]);

  if (loading) {
    return (
      <div className="relative -mt-6 mx-auto max-w-6xl select-none px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-2 shadow-2xl">
          <div className="relative aspect-[16/9] w-full rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
            <span className="text-neutral-400">Loading recommendations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (recommendedMovies.length === 0) {
    return null;
  }

  return (
    <div className="relative -mt-6 mx-auto max-w-6xl select-none px-4 pb-8 sm:px-6 lg:px-8">
      <motion.div
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-2 shadow-2xl"
      >
        <BannerCarousel items={recommendedMovies} />
      </motion.div>
    </div>
  );
}

function CarouselSlide({
  movie,
  active,
  index,
  total,
  prefersReduced,
  onClick,
}: {
  movie: { id: string; title: string; year?: number; meta?: string; poster?: string | null };
  active: boolean;
  index: number;
  total: number;
  prefersReduced: boolean;
  onClick: () => void;
}) {
  // Check if poster is a valid URL or path
  const isValidPoster = movie.poster && movie.poster !== "N/A" && movie.poster.trim() !== "";
  const [posterSrc, setPosterSrc] = React.useState<string | null>(isValidPoster ? movie.poster! : null);
  const [loading, setLoading] = React.useState(!isValidPoster);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    // If we already have a valid poster, don't fetch
    if (posterSrc && posterSrc !== "N/A") return;
    
    // If we already tried fetching, don't try again
    if (tried) return;
    
    let cancelled = false;

    const fetchPoster = async () => {
      try {
        setLoading(true);
        const url = `/api/poster?title=${encodeURIComponent(movie.title)}${movie.year ? `&year=${movie.year}` : ""}`;
        const res = await fetch(url, { cache: "force-cache" });
        const data = await res.json();
        if (!cancelled && data?.poster && data.poster !== "N/A") {
          setPosterSrc(data.poster);
        }
      } catch (e) {
        console.warn("Poster fetch failed:", e);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTried(true);
        }
      }
    };

    // Fetch poster immediately for all slides (preload)
    fetchPoster();

    return () => {
      cancelled = true;
    };
  }, [posterSrc, tried, movie.title, movie.year]);

  return (
    <motion.div
      className="absolute inset-0"
      role="group"
      aria-roledescription="slide"
      aria-label={`${movie.title} (${index + 1} of ${total})`}
      initial={false}
      animate={
        active
          ? { opacity: 1, scale: prefersReduced ? 1 : 1.0 }
          : { opacity: 0, scale: prefersReduced ? 1 : 1.02 }
      }
      transition={{ duration: prefersReduced ? 0 : 0.5 }}
      style={{ pointerEvents: active ? "auto" : "none" }}
      onClick={onClick}
    >
      <div className="relative h-full w-full">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={`${movie.title} banner`}
            className="w-full h-full object-cover"
            onError={() => setPosterSrc(null)}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ) : loading ? (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-blue-900/20 flex items-center justify-center animate-pulse">
            <Film className="h-16 w-16 text-neutral-600" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-blue-900/20 flex items-center justify-center">
            <Film className="h-16 w-16 text-neutral-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-6">
          <div className="max-w-[80%]">
            <div className="text-lg font-semibold text-neutral-100 sm:text-2xl drop-shadow">
              {movie.title}
            </div>
            <div className="text-xs text-neutral-200/90 sm:text-sm drop-shadow">
              {movie.year ? `${movie.year} • ` : ""}{movie.meta || "Movie"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BannerCarousel({
  items,
  interval = 4500,
}: {
  items: { id: string; title: string; year?: number; meta?: string; poster?: string | null }[];
  interval?: number;
}) {
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
      {/* Slides */}
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
    </div>
    </>
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

/* Discover - Recommendations */
function SectionDiscover() {
  const { user } = useAuth();
  const [personalizedRecs, setPersonalizedRecs] = React.useState<Array<{ id: string; title: string; year?: number; meta?: string; poster?: string | null }>>([]);
  const [randomRecs, setRandomRecs] = React.useState<Array<{ id: string; title: string; year?: number; meta?: string; poster?: string | null }>>([]);
  const [loadingPersonalized, setLoadingPersonalized] = React.useState(true);
  const [loadingRandom, setLoadingRandom] = React.useState(true);

  React.useEffect(() => {
    // Load personalized recommendations
    const loadPersonalized = async () => {
      if (!user) {
        setLoadingPersonalized(false);
        return;
      }
      try {
        const watchlist = await getUserWatchlist(user.uid);
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchlist: watchlist.watchlist,
            liked: watchlist.liked,
          }),
        });
        const data = await res.json();
        setPersonalizedRecs(data.items || []);
      } catch (error) {
        console.error("Failed to load personalized recommendations:", error);
      } finally {
        setLoadingPersonalized(false);
      }
    };

    // Load random recommendations
    const loadRandom = async () => {
      try {
        const res = await fetch("/api/recommendations/random");
        const data = await res.json();
        setRandomRecs(data.items || []);
      } catch (error) {
        console.error("Failed to load random recommendations:", error);
      } finally {
        setLoadingRandom(false);
      }
    };

    loadPersonalized();
    loadRandom();
  }, [user]);

  const handleUpdate = React.useCallback(() => {
    if (!user) return;
    // Reload recommendations when watchlist/liked changes
    const loadPersonalized = async () => {
      try {
        const watchlist = await getUserWatchlist(user.uid);
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchlist: watchlist.watchlist,
            liked: watchlist.liked,
          }),
        });
        const data = await res.json();
        setPersonalizedRecs(data.items || []);
      } catch (error) {
        console.error("Failed to reload recommendations:", error);
      }
    };
    loadPersonalized();
  }, [user]);

  return (
    <section id="discover" className="relative" aria-labelledby="discover-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Personalized Recommendations */}
        {personalizedRecs.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 id="discover-title" className="text-xl font-semibold text-neutral-200 mb-2">
                  Recommended for You
                </h2>
                <p className="text-sm text-neutral-400">
                  Based on your watchlist and liked movies
                </p>
              </div>
            </div>
            {loadingPersonalized ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-white/5 aspect-[2/3]" />
                ))}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {personalizedRecs.slice(0, 8).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    year={movie.year}
                    poster={movie.poster}
                    meta={movie.meta}
                    showInteraction={true}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Random Recommendations */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-200 mb-2">
              {personalizedRecs.length > 0 ? "Discover New Movies" : "Today's curated lineup"}
            </h2>
            <p className="text-sm text-neutral-400">
              {personalizedRecs.length > 0 
                ? "Random recommendations from our collection"
                : "Handpicked films for your viewing pleasure"}
            </p>
          </div>
        </div>
        {loadingRandom ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/5 aspect-[2/3]" />
            ))}
          </div>
        ) : randomRecs.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {randomRecs.slice(0, 8).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                year={movie.year}
                poster={movie.poster}
                meta={movie.meta}
                showInteraction={true}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-sm text-neutral-400 mb-2">No recommendations available yet.</p>
            <p className="text-xs text-neutral-500">Start exploring movies to get personalized recommendations!</p>
          </div>
        )}
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
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-neutral-400" aria-hidden="true" />
          <span className="text-xs">© {new Date().getFullYear()} FilmMuse, Inc.</span>
        </div>
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

/* ───────────────────────── Auth Forms ───────────────────────── */
function LoginForm({ onSuccess, onSwitchToSignup }: { onSuccess: () => void; onSwitchToSignup: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <p className="mb-4 text-sm text-neutral-400">Welcome back to FilmMuse.</p>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-neutral-300">Email</label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-neutral-300">Password</label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" disabled={loading} className="bg-emerald-400 text-black hover:bg-emerald-300">
            {loading ? "Signing in…" : "Log in"}
          </Button>
          <button 
            type="button" 
            onClick={onSwitchToSignup} 
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            Need an account? Sign up
          </button>
        </div>
      </form>
    </div>
  );
}

function SignupForm({ onSuccess, onSwitchToLogin }: { onSuccess: () => void; onSwitchToLogin: () => void }) {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signupWithEmail(email, password, username);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <p className="mb-4 text-sm text-neutral-400">It takes less than a minute.</p>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-neutral-300">Name</label>
          <Input 
            id="name" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-neutral-300">Email</label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-neutral-300">Password</label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" disabled={loading} className="bg-emerald-400 text-black hover:bg-emerald-300">
            {loading ? "Creating…" : "Sign up"}
          </Button>
          <button 
            type="button" 
            onClick={onSwitchToLogin} 
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            Already have an account? Log in
          </button>
        </div>
      </form>
    </div>
  );
}
