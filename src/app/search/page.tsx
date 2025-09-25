"use client";

import * as React from "react";
// NOTE: We’re not using next/image here to avoid remote domain issues while debugging.
// import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Plus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

type SortKey = "relevance" | "title" | "year";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 30;
const DEBOUNCE_MS = 300;
const LS_LISTS_KEY = "filmmuse_lists_v1";

type ListsStore = Record<string, Movie[]>;

/** Poster that prefers given `poster`, otherwise fetches it from /api/poster */
function Poster({
  title,
  year,
  poster,
  className,
  ratio = "16/9",
}: {
  title: string;
  year?: number;
  poster?: string | null;
  className?: string;
  ratio?: `${number}/${number}` | "16/9" | "2/3";
}) {
  const [src, setSrc] = React.useState<string | null>(poster ?? null);
  const [loading, setLoading] = React.useState<boolean>(!poster);
  const [tried, setTried] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (src || tried) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const url = `/api/poster?title=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
        // Debug: this will prove the card is fetching posters
        console.log("[Poster] fetching:", url);
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data?.poster) setSrc(data.poster as string);
      } catch {
        // ignore
      } finally {
        if (alive) {
          setLoading(false);
          setTried(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [src, tried, title, year]);

  return (
    <div
      className={className}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <img
          src={src}
          alt={`${title} poster`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setSrc(null)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs text-neutral-400">
          {loading ? "Loading…" : "No image"}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const qFromUrl = (sp.get("q") || "").trim();
  const genreFromUrl = (sp.get("genre") || "").trim();
  const sortFromUrl = (sp.get("sort") as SortKey) || "relevance";
  const orderFromUrl = (sp.get("order") as SortOrder) || "asc";

  const [q, setQ] = React.useState(qFromUrl);
  const [genre, setGenre] = React.useState<string>(genreFromUrl);
  const [sort, setSort] = React.useState<SortKey>(sortFromUrl);
  const [order, setOrder] = React.useState<SortOrder>(orderFromUrl);

  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Movie[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [nextOffset, setNextOffset] = React.useState<number | null>(null);
  const [usedFallback, setUsedFallback] = React.useState<boolean>(false);
  const [view, setView] = React.useState<"grid" | "list">("grid");

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // ==== Saved Lists: local storage store ====
  const [lists, setLists] = React.useState<ListsStore>({});
  const listNames = React.useMemo(() => Object.keys(lists).sort(), [lists]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LISTS_KEY);
      setLists(raw ? (JSON.parse(raw) as ListsStore) : {});
    } catch {
      setLists({});
    }
  }, []);
  const persistLists = React.useCallback((next: ListsStore) => {
    setLists(next);
    try {
      localStorage.setItem(LS_LISTS_KEY, JSON.stringify(next));
    } catch {/* ignore */}
  }, []);
  const addToList = React.useCallback((listName: string, movie: Movie) => {
    if (!listName.trim()) return;
    const key = listName.trim();
    setLists(prev => {
      const existing = prev[key] ?? [];
      const had = existing.some(m => m.id === movie.id);
      const next = { ...prev, [key]: had ? existing : [movie, ...existing] };
      try { localStorage.setItem(LS_LISTS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

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

  // initial fetch once (if URL has params)
  React.useEffect(() => {
    if (qFromUrl || genreFromUrl) {
      void runSearch({ q: qFromUrl, genre: genreFromUrl, sort, order, offset: 0, reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce query typing
  const [debouncedQ, setDebouncedQ] = React.useState(q);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  // Auto search when filters/sort change (and debounced query)
  React.useEffect(() => {
    if (!debouncedQ && !genre) return;
    void runSearch({ q: debouncedQ, genre, sort, order, offset: 0, reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, genre, sort, order]);

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

  function syncUrl(next: { q?: string; genre?: string; sort?: SortKey; order?: SortOrder }) {
    const url = new URL(window.location.href);
    const setOrDelete = (k: string, v?: string) => {
      if (v && v.trim()) url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    };
    setOrDelete("q", next.q ?? q);
    setOrDelete("genre", next.genre ?? genre);
    setOrDelete("sort", next.sort ?? sort);
    setOrDelete("order", next.order ?? order);
    window.history.replaceState(null, "", url.toString());
  }

  function buildApiUrl(args: {
    q?: string;
    genre?: string;
    sort?: SortKey;
    order?: SortOrder;
    limit?: number;
    offset?: number;
  }) {
    const url = new URL(`/api/search`, window.location.origin);
    if (args.q) url.searchParams.set("q", args.q);
    if (args.genre) url.searchParams.set("genre", args.genre);
    if (args.sort && args.sort !== "relevance") url.searchParams.set("sort", args.sort);
    if (args.order) url.searchParams.set("order", args.order);
    url.searchParams.set("limit", String(args.limit ?? PAGE_SIZE));
    url.searchParams.set("offset", String(args.offset ?? 0));
    return url.toString();
  }

  async function runSearch(args: {
    q?: string;
    genre?: string;
    sort?: SortKey;
    order?: SortOrder;
    offset: number;
    reset: boolean;
  }) {
    const { q: qArg, genre: gArg, sort: sArg, order: oArg, offset, reset } = args;
    setError(null);
    setLoading(true);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const url = buildApiUrl({
        q: qArg?.trim(),
        genre: gArg,
        sort: sArg,
        order: oArg,
        limit: PAGE_SIZE,
        offset,
      });

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

      syncUrl({ q: qArg, genre: gArg, sort: sArg, order: oArg });
    } catch (e: unknown) {
      if ((e as any)?.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      if (args.reset) {
        setResults([]);
        setTotal(0);
        setNextOffset(null);
      }
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch({ q: q.trim(), genre, sort, order, offset: 0, reset: true });
  };

  const applyFilters = () => {
    void runSearch({ q: q.trim(), genre, sort, order, offset: 0, reset: true });
  };

  const clearFilters = () => {
    setQ("");
    setGenre("");
    setSort("relevance");
    setOrder("asc");
    setResults([]);
    setTotal(0);
    setNextOffset(null);
    syncUrl({ q: "", genre: "", sort: "relevance", order: "asc" });
  };

  const loadMore = () => {
    if (nextOffset == null) return;
    void runSearch({ q: q.trim(), genre, sort, order, offset: nextOffset, reset: false });
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

  // ===== UI Pieces =====
  const ResultCard = ({ m }: { m: Movie }) => (
    <article
      className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
      aria-label={m.title}
    >
      <div className="relative">
        <Poster title={m.title} year={m.year} poster={m.poster ?? null} ratio="16/9" className="w-full" />
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{m.title}</div>
            <div className="text-xs text-neutral-400">
              {[m.year, m.meta].filter(Boolean).join("•") || "—"}
            </div>
          </div>

          {/* Add to List — dialog trigger */}
          <AddToListDialog movie={m} listNames={listNames} onAdd={(name) => addToList(name, m)} />
        </div>
      </div>
    </article>
  );

  const ResultRow = ({ m }: { m: Movie }) => (
    <article
      className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-2"
      aria-label={m.title}
    >
      <Poster
        title={m.title}
        year={m.year}
        poster={m.poster ?? null}
        ratio="16/9"
        className="relative h-20 w-36 shrink-0 overflow-hidden rounded-md bg-white/5"
      />
      <div className="flex w-full items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{m.title}</div>
          <div className="text-xs text-neutral-400">
            {[m.year, m.meta].filter(Boolean).join("•") || "—"}
          </div>
        </div>
        <AddToListDialog movie={m} listNames={listNames} onAdd={(name) => addToList(name, m)} />
      </div>
    </article>
  );

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
          <Link href="/" aria-label="Go to Home">
            <Button type="button" className="bg-white/10 hover:bg-white/15 text-neutral-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Search</h1>
          <div className="w-[84px] sm:w-[96px]" aria-hidden="true" />
        </header>

        {/* Controls */}
        <form onSubmit={onSubmit} className="mt-2 grid gap-2 sm:grid-cols-[200px_auto_1fr_auto_auto_auto]">
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

          {/* Sort */}
          <div className="flex">
            <label className="sr-only" htmlFor="sort">Sort</label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger id="sort" className="bg-white/5 border-white/10">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] text-neutral-100">
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order */}
          <div className="flex">
            <label className="sr-only" htmlFor="order">Order</label>
            <Select value={order} onValueChange={(v) => setOrder(v as SortOrder)}>
              <SelectTrigger id="order" className="bg-white/5 border-white/10">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] text-neutral-100">
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
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
            {sort !== "relevance" ? ` • Sort: ${sort} (${order})` : ""}
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

        {/* Lists summary (optional quick view) */}
        {listNames.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-2 text-lg font-medium">Your Lists</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {listNames.map((name) => (
                <div key={name} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{name}</span>
                    <span className="text-xs text-neutral-400">{lists[name]?.length ?? 0} items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/** Add-to-list dialog component (local-first) */
function AddToListDialog({
  movie,
  listNames,
  onAdd,
}: {
  movie: Movie;
  listNames: string[];
  onAdd: (listName: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"choose" | "create">("choose");
  const [selected, setSelected] = React.useState<string>(listNames[0] ?? "");
  const [newName, setNewName] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSelected((prev) => prev || listNames[0] || "");
    }
  }, [open, listNames]);

  const canSave = mode === "choose" ? !!selected : !!newName.trim();

  const save = () => {
    const name = mode === "choose" ? selected : newName.trim();
    if (!name) return;
    onAdd(name);
    setOpen(false);
    setMode("choose");
    setNewName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-400 text-black hover:bg-emerald-300" title="Add to List">
          <Plus className="mr-1 h-4 w-4" />
          Add to List
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#101010] text-neutral-100 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base">Add “{movie.title}” to a list</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "choose" ? "default" : "secondary"}
              className={mode === "choose" ? "bg-white/15 hover:bg-white/20" : "bg-white/5 hover:bg-white/10 text-neutral-200"}
              onClick={() => setMode("choose")}
            >
              Choose existing
            </Button>
            <Button
              type="button"
              variant={mode === "create" ? "default" : "secondary"}
              className={mode === "create" ? "bg-white/15 hover:bg-white/20" : "bg-white/5 hover:bg-white/10 text-neutral-200"}
              onClick={() => setMode("create")}
            >
              Create new
            </Button>
          </div>

          {mode === "choose" ? (
            listNames.length ? (
              <Select value={selected || (listNames[0] ?? "")} onValueChange={setSelected}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Pick a list" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] text-neutral-100">
                  {listNames.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-neutral-400">No lists yet — switch to “Create new”.</p>
            )
          ) : (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Weekend Watchlist"
              className="bg-white/5 border-white/10"
            />
          )}
        </div>

        <DialogFooter>
          <Button type="button" className="bg-emerald-400 text-black hover:bg-emerald-300" disabled={!canSave} onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
