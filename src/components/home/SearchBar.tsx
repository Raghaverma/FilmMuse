"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar() {
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

