"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Film, Clock } from "lucide-react";

type Suggestion = {
  id: string;
  title: string;
  year?: number;
};

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("filmMuse_recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Debounced search for suggestions
  React.useEffect(() => {
    if (!q.trim() || q.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.items?.slice(0, 5) || []);
      } catch (error) {
        console.error("Search suggestions error:", error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [q]);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("filmMuse_recentSearches", JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    saveRecentSearch(query);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const query = suggestion.title;
    setQ(query);
    saveRecentSearch(query);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleRecentClick = (recent: string) => {
    setQ(recent);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(recent)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (recentSearches.length > 0 && !q.trim() ? recentSearches.length : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      if (selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (recentSearches.length > 0) {
        const recentIndex = selectedIndex - suggestions.length;
        handleRecentClick(recentSearches[recentIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  React.useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[role="option"]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const displaySuggestions = suggestions.length > 0 || (recentSearches.length > 0 && !q.trim());

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-neutral-500" />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSelectedIndex(-1);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay to allow clicks on suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search by mood, vibe, or a film you loved..."
            className="bg-white/5 pl-9 border-white/10 focus-visible:ring-emerald-400"
            aria-label="Search films"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && displaySuggestions}
            role="combobox"
          />
        </div>
        <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300">
          Search
        </Button>
      </form>

      <AnimatePresence>
        {showSuggestions && displaySuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden"
            role="listbox"
          >
            {suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    role="option"
                    aria-selected={selectedIndex === idx}
                    className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors flex items-center gap-3 ${selectedIndex === idx ? "bg-white/10" : ""
                      }`}
                  >
                    <Film className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground dark:text-white truncate">{suggestion.title}</div>
                      {suggestion.year && (
                        <div className="text-xs text-muted-foreground dark:text-neutral-400">{suggestion.year}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {recentSearches.length > 0 && !q.trim() && (
              <div className="border-t border-white/10 py-2">
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {recentSearches.map((recent, idx) => (
                  <button
                    key={recent}
                    type="button"
                    onClick={() => handleRecentClick(recent)}
                    role="option"
                    aria-selected={selectedIndex === suggestions.length + idx}
                    className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${selectedIndex === suggestions.length + idx ? "bg-white/10" : ""
                      }`}
                  >
                    <div className="text-sm text-foreground/80 dark:text-neutral-300">{recent}</div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

