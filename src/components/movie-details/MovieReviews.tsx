"use client";

import * as React from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type Review = {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path?: string | null;
    rating?: number;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
};

interface MovieReviewsProps {
  tmdbId?: number;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w45";

export default function MovieReviews({ tmdbId }: MovieReviewsProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [expandedReviews, setExpandedReviews] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!tmdbId) return;

    const loadReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movie/${tmdbId}/reviews?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.results || []);
          setTotalPages(data.total_pages || 1);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [tmdbId, page]);

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/4 mb-2" />
              <div className="h-4 bg-white/10 rounded w-full mb-2" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Reviews</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-neutral-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const displayContent = isExpanded
            ? review.content
            : truncateContent(review.content);
          const needsTruncation = review.content.length > 300;

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-start gap-3 mb-3">
                {review.author_details.avatar_path ? (
                  <img
                    src={`${IMAGE_BASE_URL}${review.author_details.avatar_path}`}
                    alt={review.author_details.name || review.author}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-semibold text-sm">
                      {(review.author_details.name || review.author).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">
                      {review.author_details.name || review.author}
                    </h4>
                    {review.author_details.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-neutral-400">
                          {review.author_details.rating}/10
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </p>
              {needsTruncation && (
                <button
                  onClick={() => toggleExpand(review.id)}
                  className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}




