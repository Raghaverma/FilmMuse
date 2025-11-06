"use client";

import * as React from "react";
import { 
  MoreVertical, 
  Bookmark, 
  Heart, 
  Star, 
  Plus,
  Check,
  ListPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addToWatchlist,
  addToLiked,
  removeFromWatchlist,
  removeFromLiked,
  getUserWatchlist,
  getUserCustomLists,
  addMovieToCustomList,
  rateMovie,
  getUserRatings,
  type MovieItem,
} from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type MovieInteractionProps = {
  movie: MovieItem & { meta?: string };
  onUpdate?: () => void;
  className?: string;
};

export default function MovieInteraction({ movie, onUpdate, className }: MovieInteractionProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showRatingDialog, setShowRatingDialog] = React.useState(false);
  const [showListDialog, setShowListDialog] = React.useState(false);
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [watchlist, setWatchlist] = React.useState<{ watchlist: MovieItem[]; liked: MovieItem[] }>({ watchlist: [], liked: [] });
  const [customLists, setCustomLists] = React.useState<Array<{ id: string; name: string; movies: MovieItem[] }>>([]);
  const [ratings, setRatings] = React.useState<Record<string, { rating: number }>>({});
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const wl = getUserWatchlist();
    setWatchlist(wl);
    const lists = getUserCustomLists();
    setCustomLists(lists);
    const userRatings = getUserRatings();
    setRatings(userRatings);
  }, []);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const inWatchlist = watchlist.watchlist.some(m => m.id === movie.id);
  const inLiked = watchlist.liked.some(m => m.id === movie.id);
  const currentRating = ratings[movie.id]?.rating || 0;

  const handleAddToWatchlist = () => {
    try {
      if (inWatchlist) {
        removeFromWatchlist(movie.id);
        toast.success("Removed from watchlist");
      } else {
        addToWatchlist(movie);
        toast.success("Added to watchlist 🍿", {
          icon: "📽️",
        });
      }
      const wl = getUserWatchlist();
      setWatchlist(wl);
      setIsMenuOpen(false);
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to update watchlist");
    }
  };

  const handleAddToLiked = () => {
    try {
      if (inLiked) {
        removeFromLiked(movie.id);
        toast.success("Removed from liked");
      } else {
        addToLiked(movie);
        toast.success("Added to favorites 💖", {
          icon: "❤️",
        });
      }
      const wl = getUserWatchlist();
      setWatchlist(wl);
      setIsMenuOpen(false);
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to update favorites");
    }
  };

  const handleRate = () => {
    if (selectedRating > 0) {
      try {
        rateMovie(movie.id, movie.title, selectedRating, movie.year, movie.poster);
        toast.success(`Rated ${movie.title} ${selectedRating} stars ⭐`);
        const userRatings = getUserRatings();
        setRatings(userRatings);
        setShowRatingDialog(false);
        setIsMenuOpen(false);
        onUpdate?.();
      } catch (err) {
        toast.error("Failed to rate movie");
      }
    }
  };

  const handleAddToList = (listId: string) => {
    try {
      addMovieToCustomList(listId, movie);
      toast.success("Added to list ✅");
      setShowListDialog(false);
      setIsMenuOpen(false);
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to add to list");
    }
  };

  return (
    <>
      <div ref={menuRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Movie actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-[#1a1a1a] shadow-xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToWatchlist();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors"
                >
                  {inWatchlist ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>In Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToLiked();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors"
                >
                  {inLiked ? (
                    <>
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      <span>Liked</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      <span>Like</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowListDialog(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors"
                >
                  <ListPlus className="h-4 w-4" />
                  <span>Add to List</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedRating(currentRating);
                    setShowRatingDialog(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors"
                >
                  <Star className={`h-4 w-4 ${currentRating > 0 ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  <span>{currentRating > 0 ? `Rated ${currentRating}/5` : "Rate Movie"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10">
          <DialogHeader>
            <DialogTitle>Rate {movie.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= selectedRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-neutral-600 hover:text-yellow-400/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowRatingDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRate}
                disabled={selectedRating === 0}
                className="bg-emerald-400 text-black hover:bg-emerald-300"
              >
                Rate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to List Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10">
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-64 overflow-y-auto">
            {customLists.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">
                No lists yet. Create one in your profile!
              </p>
            ) : (
              <div className="space-y-2">
                {customLists.map((list) => {
                  const alreadyInList = list.movies.some(m => m.id === movie.id);
                  return (
                    <button
                      key={list.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!alreadyInList) {
                          handleAddToList(list.id);
                        }
                      }}
                      disabled={alreadyInList}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors ${
                        alreadyInList ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{list.name}</span>
                        {alreadyInList && (
                          <Check className="h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      <span className="text-xs text-neutral-400">
                        {list.movies.length} movies
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

