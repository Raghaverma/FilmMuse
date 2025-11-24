"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchUsers } from "@/lib/firebase/follows";
import { User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserSearchProps {
  onUserSelect?: (userId: string) => void;
  showFollowButton?: boolean;
}

export default function UserSearch({ onUserSelect, showFollowButton = false }: UserSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await searchUsers(query);
        setResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Search users by username or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10"
        />
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[#0b0b0d] border border-white/10 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {results.map((user) => (
              <div
                key={user.uid}
                className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                onClick={() => onUserSelect?.(user.uid)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.username}</div>
                    <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-[#0b0b0d] border border-white/10 rounded-lg p-3 text-center text-sm text-neutral-400">
          Searching...
        </div>
      )}
    </div>
  );
}

