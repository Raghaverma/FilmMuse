"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Home</h1>
          <nav className="flex items-center gap-3 text-sm text-neutral-300">
            <Link href="/profile" className="hover:text-white">Profile</Link>
            <Link href="/logout" className="hover:text-white">Logout</Link>
          </nav>
        </header>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">Quick Search</h2>
          <p className="mt-1 text-sm text-neutral-400">Search movies by mood, vibe, or title.</p>
          <form onSubmit={onSubmit} className="mt-4 flex gap-2">
            <div className="relative grow">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try: space horror, courtroom drama, classic noir"
                className="bg-white/5 pl-9 border-white/10 focus-visible:ring-emerald-400"
                aria-label="Search films"
              />
            </div>
            <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300">Search</Button>
          </form>

          <div className="mt-4 text-sm text-neutral-400">
            Or explore the full experience on the <Link href="/search" className="text-emerald-300 hover:text-emerald-200">Search page</Link>.
          </div>
        </section>
      </div>
    </main>
  );
}



