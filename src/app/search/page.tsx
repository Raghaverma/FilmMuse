"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type Movie = {
  id: string;
  title: string;
  year?: number;
  meta?: string;
  poster?: string;
};

export default function SearchPage() {
  const sp = useSearchParams();
  const initialQ = (sp.get("q") || "").trim();

  const [q, setQ] = React.useState(initialQ);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Movie[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialQ) void runSearch(initialQ);
  }, [initialQ]);

  async function runSearch(query: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items?: Movie[] } | Movie[];
      const items: Movie[] = Array.isArray(data) ? data : data.items ?? [];
      setResults(items);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    void runSearch(query);
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Search</h1>

        <form onSubmit={onSubmit} className="mt-6 flex gap-2">
          <div className="relative grow">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Refine your search…"
              className="bg-white/5 pl-9 border-white/10 focus-visible:ring-emerald-400"
              aria-label="Refine search"
            />
          </div>
          <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300">
            Search
          </Button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-8 text-neutral-400">Searching…</p>
        ) : results.length === 0 ? (
          <p className="mt-8 text-neutral-400">
            {initialQ ? "No results found." : "Type a query to get started."}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-neutral-400">
              {results.length} result{results.length > 1 ? "s" : ""} found
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((m, i) => (
                <article
                  key={m.id || `${m.title}-${i}`}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  aria-label={m.title}
                >
                  <div className="relative aspect-[16/9]">
                    {m.poster ? (
                      <Image
                        src={m.poster}
                        alt={`${m.title} poster`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width:1280px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="text-xs text-neutral-400">
                      {[m.year, m.meta].filter(Boolean).join(" • ") || "—"}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
