import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shuffle } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
  "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western",
] as const;

interface SearchFormProps {
  query: string;
  genre: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onRandom: () => void;
  onClear: () => void;
}

export default function SearchForm({
  query,
  genre,
  loading,
  onQueryChange,
  onGenreChange,
  onSubmit,
  onRandom,
  onClear,
}: SearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-[200px_1fr_auto]">
        <Select
          value={genre || "all"}
          onValueChange={(v) => onGenreChange(v === "all" ? "" : v)}
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] text-neutral-100">
            <SelectItem value="all">All genres</SelectItem>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by title, mood, or vibe..."
            className="bg-white/5 pl-9 border-white/10 focus-visible:ring-emerald-400"
            aria-label="Search movies"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            className="bg-emerald-400 text-black hover:bg-emerald-300"
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </Button>
          <Button
            type="button"
            onClick={onRandom}
            className="bg-purple-500 hover:bg-purple-600 text-white"
            title="Get a random movie"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={onClear}
            className="bg-white/10 hover:bg-white/15 text-neutral-200"
            disabled={loading}
          >
            Clear
          </Button>
        </div>
      </div>
    </form>
  );
}

