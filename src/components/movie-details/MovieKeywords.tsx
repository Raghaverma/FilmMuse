"use client";

import * as React from "react";
import { Hash } from "lucide-react";
import { motion } from "framer-motion";

type Keyword = {
  id: number;
  name: string;
};

interface MovieKeywordsProps {
  tmdbId?: number;
  onKeywordClick?: (keyword: string) => void;
}

export default function MovieKeywords({ tmdbId, onKeywordClick }: MovieKeywordsProps) {
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!tmdbId) return;

    const loadKeywords = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movie/${tmdbId}/keywords`);
        if (res.ok) {
          const data = await res.json();
          setKeywords(data.keywords || []);
        }
      } catch (error) {
        console.error("Failed to load keywords:", error);
      } finally {
        setLoading(false);
      }
    };

    loadKeywords();
  }, [tmdbId]);

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-24 bg-white/5 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (keywords.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Keywords</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <motion.button
            key={keyword.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => onKeywordClick?.(keyword.name)}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-400/20 text-neutral-300 hover:text-emerald-300 text-sm border border-white/10 hover:border-emerald-400/30 transition-colors"
          >
            {keyword.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}







