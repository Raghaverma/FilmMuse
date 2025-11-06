"use client";

import * as React from "react";
// NOTE: We’re not using next/image here to avoid remote domain issues while debugging.
// import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import MovieInteraction from "@/components/MovieInteraction";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import Poster from "@/components/Poster";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

type Movie = {
  id: string;
  title: string;
  year?: number;
  meta?: string;
  poster?: string | null; // allow null
};

type ApiResponse = {
  items: Movie[];
  total: number;
  nextOffset: number | null;
  source?: "index" | "fallback";
};

const GENRES = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary","Drama",
  "Family","Fantasy","History","Horror","Music","Mystery","Romance",
  "Sci-Fi","Thriller","War","Western",
] as const;

const PAGE_SIZE = 30;
const DEBOUNCE_MS = 300;


export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const qFromUrl = (sp.get("q") || "").trim();
  const genreFromUrl = (sp.get("genre") || "").trim();

  const [q, setQ] = React.useState(qFromUrl);
  const [genre, setGenre] = React.useState<string>(genreFromUrl);

  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Movie[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [nextOffset, setNextOffset] = React.useState<number | null>(null);
  const [usedFallback, setUsedFallback] = React.useState<boolean>(false);
  const [view, setView] = React.useState<"grid" | "list">("grid");

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);


  // Rotating animated hint
  const HINTS = React.useMemo(
    () => [
      "Discover movies where your favorite actors worked together",
      "Search by mood, vibe or a film you loved",
      "Try: 'space horror', 'courtroom drama', 'classic noir'",
    ],
    []
  );
  const [hintIndex, setHintIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setHintIndex((i) => (i + 1) % HINTS.length), 3000);
    return () => clearInterval(id);
  }, [HINTS]);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const syncUrl = React.useCallback((next: { q?: string; genre?: string }) => {
    const url = new URL(window.location.href);
    if (next.q !== undefined) {
      if (next.q) url.searchParams.set("q", next.q);
      else url.searchParams.delete("q");
    }
    if (next.genre !== undefined) {
      if (next.genre) url.searchParams.set("genre", next.genre);
      else url.searchParams.delete("genre");
    }
    window.history.replaceState(null, "", url.toString());
  }, []);

  function buildApiUrl(args: { q?: string; genre?: string; limit?: number; offset?: number }) {
    const url = new URL(`/api/search`, window.location.origin);
    if (args.q) url.searchParams.set("q", args.q);
    if (args.genre) url.searchParams.set("genre", args.genre);
    url.searchParams.set("limit", String(args.limit ?? PAGE_SIZE));
    url.searchParams.set("offset", String(args.offset ?? 0));
    return url.toString();
  }

  const runSearchRef = React.useRef<((args: { q?: string; genre?: string; offset: number; reset: boolean }) => Promise<void>) | null>(null);

  const runSearch = React.useCallback(async (args: { q?: string; genre?: string; offset: number; reset: boolean }) => {
    const { q: qArg, genre: gArg, offset, reset } = args;
    setError(null);
    setLoading(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const url = buildApiUrl({ q: qArg?.trim(), genre: gArg, limit: PAGE_SIZE, offset });
      const res = await fetch(url, { method: "GET", cache: "no-store", signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as ApiResponse | { items?: Movie[] };
      const items = "items" in data && Array.isArray(data.items) ? data.items : [];
      const apiTotal = "total" in data && typeof data.total === "number" ? data.total : items.length;
      const apiNext = "nextOffset" in data ? (data.nextOffset as number | null) : null;
      const apiSource = "source" in data ? (data.source as "index" | "fallback" | undefined) : undefined;

      setResults((prev) => (reset ? items : [...prev, ...items]));
      setTotal(apiTotal);
      setNextOffset(apiNext);
      setUsedFallback(apiSource === "fallback");
      syncUrl({ q: qArg, genre: gArg });
    } catch (e: unknown) {
      if ((e as any)?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong.");
      if (args.reset) {
        setResults([]);
        setTotal(0);
        setNextOffset(null);
      }
    } finally {
      setLoading(false);
    }
  }, [syncUrl]);

  runSearchRef.current = runSearch;

  React.useEffect(() => {
    if (qFromUrl || genreFromUrl) {
      void runSearch({ q: qFromUrl, genre: genreFromUrl, offset: 0, reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [debouncedQ, setDebouncedQ] = React.useState(q);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  React.useEffect(() => {
    if (!debouncedQ && !genre) return;
    if (runSearchRef.current) {
      void runSearchRef.current({ q: debouncedQ, genre, offset: 0, reset: true });
    }
  }, [debouncedQ, genre]);

  // Keyboard shortcuts: "/" to focus, Esc clears query
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setQ("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch({ q: q.trim(), genre, offset: 0, reset: true });
  };

  const applyFilters = () => {
    void runSearch({ q: q.trim(), genre, offset: 0, reset: true });
  };

  const clearFilters = () => {
    setQ("");
    setGenre("");
    setResults([]);
    setTotal(0);
    setNextOffset(null);
    syncUrl({ q: "", genre: "" });
  };

  const loadMore = () => {
    if (nextOffset == null) return;
    void runSearch({ q: q.trim(), genre, offset: nextOffset, reset: false });
  };

  // ===== Actor Pair Finder =====
  const [actorA, setActorA] = React.useState("");
  const [actorB, setActorB] = React.useState("");
  const submitPair = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!actorA.trim() || !actorB.trim()) return;
    const params = new URLSearchParams();
    params.set("a", actorA.trim());
    params.set("b", actorB.trim());
    router.push(`/pair?${params.toString()}`);
  };

  const handleUpdate = React.useCallback(() => {
    // Refresh can be handled by parent components if needed
  }, []);

  const ResultCard = ({ m }: { m: Movie }) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    
    return (
      <>
        <article
          className="overflow-hidden rounded-xl border border-white/10 bg-white/5 group cursor-pointer"
          aria-label={m.title}
          onClick={() => setIsModalOpen(true)}
        >
          <div className="relative">
            <Poster title={m.title} year={m.year} poster={m.poster ?? null} ratio="16/9" className="w-full" />
            <div 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <MovieInteraction
                movie={{ id: m.id, title: m.title, year: m.year, poster: m.poster ?? null, meta: m.meta }}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium" title={m.title}>{m.title}</div>
                <div className="text-xs text-neutral-400">
                  {[m.year, m.meta].filter(Boolean).join("•") || "—"}
                </div>
              </div>
            </div>
          </div>
        </article>
        <MovieDetailsModal
          movie={{ id: m.id, title: m.title, year: m.year, poster: m.poster ?? null, meta: m.meta }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdate}
        />
      </>
    );
  };

  const ResultRow = ({ m }: { m: Movie }) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    
    return (
      <>
        <article
          className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-2 group cursor-pointer"
          aria-label={m.title}
          onClick={() => setIsModalOpen(true)}
        >
          <Poster
            title={m.title}
            year={m.year}
            poster={m.poster ?? null}
            ratio="16/9"
            className="relative h-20 w-36 shrink-0 overflow-hidden rounded-md bg-white/5"
          />
          <div className="flex w-full items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium" title={m.title}>{m.title}</div>
              <div className="text-xs text-neutral-400">
                {[m.year, m.meta].filter(Boolean).join("•") || "—"}
              </div>
            </div>
            <div 
              className="opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <MovieInteraction
                movie={{ id: m.id, title: m.title, year: m.year, poster: m.poster ?? null, meta: m.meta }}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        </article>
        <MovieDetailsModal
          movie={{ id: m.id, title: m.title, year: m.year, poster: m.poster ?? null, meta: m.meta }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdate}
        />
      </>
    );
  };

  const Skeleton = () => (
    <div className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="aspect-[16/9] bg-white/10" />
      <div className="p-3">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header with Home button */}
        <header className="mb-4 flex items-center justify-between">
          <Link href="/home" aria-label="Go to Home">
            <Button type="button" className="bg-white/10 hover:bg-white/15 text-neutral-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Search</h1>
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm text-neutral-300 hover:text-white">Profile</Link>
            <Link href="/logout" className="text-sm text-neutral-300 hover:text-white">Logout</Link>
          </div>
        </header>

        {/* Controls */}
        <form onSubmit={onSubmit} className="mt-2 grid gap-2 sm:grid-cols-[200px_1fr_auto_auto]">
          {/* Genre */}
          <div className="flex">
            <label className="sr-only" htmlFor="genre">Genre</label>
            <Select value={genre || "all"} onValueChange={(v) => setGenre(v === "all" ? "" : v)}>
              <SelectTrigger id="genre" className="bg-white/5 border-white/10">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] text-neutral-100">
                <SelectItem value="all">All genres</SelectItem>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={view === "grid" ? "default" : "secondary"}
              className={view === "grid" ? "bg-emerald-400 text-black hover:bg-emerald-300" : "bg-white/10 hover:bg-white/15 text-neutral-200"}
              onClick={() => setView("grid")}
            >
              Grid
            </Button>
            <Button
              type="button"
              variant={view === "list" ? "default" : "secondary"}
              className={view === "list" ? "bg-emerald-400 text-black hover:bg-emerald-300" : "bg-white/10 hover:bg-white/15 text-neutral-200"}
              onClick={() => setView("list")}
            >
              List
            </Button>
          </div>

          {/* Search input with animated hint */}
          <div className="relative grow">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              ref={searchInputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder=""
              className="bg-white/5 pl-9 border-white/10 focus-visible:ring-emerald-400"
              aria-label="Search movies"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyFilters();
                }
              }}
            />
            {q.length === 0 && (
              <div className="pointer-events-none absolute left-9 right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500" aria-hidden="true">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={hintIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className={isSearchFocused ? "opacity-60" : ""}
                  >
                    {HINTS[hintIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
            <Button type="button" onClick={clearFilters} className="bg-white/10 hover:bg-white/15 text-neutral-200" disabled={loading && results.length === 0}>
              Clear
            </Button>
          </div>
        </form>

        {/* ===== Actor Pair Finder (inline) ===== */}
        <form onSubmit={submitPair} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            value={actorA}
            onChange={(e) => setActorA(e.target.value)}
            placeholder="Actor A (e.g., Robert Downey Jr.)"
            className="bg-white/5 border-white/10"
            aria-label="Actor A"
          />
          <Input
            value={actorB}
            onChange={(e) => setActorB(e.target.value)}
            placeholder="Actor B (e.g., Chris Evans)"
            className="bg-white/5 border-white/10"
            aria-label="Actor B"
          />
          <Button type="submit" className="bg-white/10 hover:bg-white/15 text-neutral-200">
            Find Pair
          </Button>
        </form>

        {/* Status / Errors */}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-neutral-400">
            {results.length}{total ? ` of ${total}` : ""} result{(total || results.length) > 1 ? "s" : ""} found
            {genre ? ` • Genre: ${genre}` : ""}
          </p>
          {usedFallback && (
            <span className="text-xs text-amber-300">
              Using starter dataset. Add <code>src/data/movies.index.json</code> for full results.
            </span>
          )}
        </div>

        {/* Results */}
        <section className="mt-4">
          {loading && results.length === 0 ? (
            <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-3"}>
              {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} />))}
            </div>
          ) : results.length === 0 ? (
            <p className="mt-8 text-neutral-400">
              {qFromUrl || genreFromUrl ? "No results found." : "Type a query to get started."}
            </p>
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((m) => (<ResultCard key={m.id ?? `${m.title}-${m.year ?? ""}`} m={m} />))}
            </div>
          ) : (
            <div className="grid gap-3">
              {results.map((m) => (<ResultRow key={m.id ?? `${m.title}-${m.year ?? ""}`} m={m} />))}
            </div>
          )}

          {/* Load more */}
          {nextOffset !== null && (
            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={loadMore} disabled={loading} className="bg-white/10 hover:bg-white/15 text-neutral-200">
                {loading ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

