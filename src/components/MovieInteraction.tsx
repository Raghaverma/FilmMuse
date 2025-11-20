"use client";

import * as React from "react";
import { 
  MoreVertical, 
  Bookmark, 
  Heart, 
  Star, 
  Check,
  ListPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addToWatchlist,
  addToLiked,
  removeFromWatchlist,
  removeFromLiked,
  getUserData,
  getUserCustomLists,
  addMovieToCustomList,
  rateMovie,
  getUserRatings,
  type MovieItem,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
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
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showRatingDialog, setShowRatingDialog] = React.useState(false);
  const [showListDialog, setShowListDialog] = React.useState(false);
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [watchlist, setWatchlist] = React.useState<{ watchlist: MovieItem[]; liked: MovieItem[] }>({ watchlist: [], liked: [] });
  const [customLists, setCustomLists] = React.useState<Array<{ id: string; name: string; movies: MovieItem[] }>>([]);
  const [ratings, setRatings] = React.useState<Record<string, { rating: number }>>({});
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; right: number } | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const userData = await getUserData(user.uid);
        setWatchlist({ watchlist: userData.watchlist, liked: userData.liked });
        setRatings(
          Object.fromEntries(
            Object.entries(userData.ratings).map(([k, v]) => [k, { rating: v.rating }])
          )
        );
        const lists = await getUserCustomLists();
        setCustomLists(lists.map(l => ({ id: l.id, name: l.name, movies: l.movies })));
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadData();
  }, [user]);

  React.useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192;
      const menuHeight = 200;
      const padding = 8;
      
      let right = window.innerWidth - rect.right;
      let top = rect.bottom + padding;
      
      if (right < menuWidth) {
        right = window.innerWidth - rect.left;
      }
      
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - padding;
      }
      
      if (right > window.innerWidth - menuWidth) {
        right = window.innerWidth - menuWidth - padding;
      }
      
      if (top < padding) {
        top = padding;
      }
      
      setMenuPosition({ top, right });
    } else {
      setMenuPosition(null);
    }
  }, [isMenuOpen]);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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

  const handleAddToWatchlist = async () => {
    if (!user) {
      toast.error("Please log in to add to watchlist");
      return;
    }
    try {
      if (inWatchlist) {
        await removeFromWatchlist(movie.id);
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(movie);
        toast.success("Added to watchlist 🍿", {
          icon: "📽️",
        });
      }
      const userData = await getUserData(user.uid);
      setWatchlist({ watchlist: userData.watchlist, liked: userData.liked });
      setIsMenuOpen(false);
      onUpdate?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update watchlist";
      toast.error(message);
    }
  };

  const handleAddToLiked = async () => {
    if (!user) {
      toast.error("Please log in to like movies");
      return;
    }
    try {
      if (inLiked) {
        await removeFromLiked(movie.id);
        toast.success("Removed from liked");
      } else {
        await addToLiked(movie);
        toast.success("Added to favorites 💖", {
          icon: "❤️",
        });
      }
      const userData = await getUserData(user.uid);
      setWatchlist({ watchlist: userData.watchlist, liked: userData.liked });
      setIsMenuOpen(false);
      onUpdate?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update favorites";
      toast.error(message);
    }
  };

  const handleRate = async () => {
    if (!user) {
      toast.error("Please log in to rate movies");
      return;
    }
    if (selectedRating > 0) {
      try {
        await rateMovie(movie.id, movie.title, selectedRating, movie.year, movie.poster);
        toast.success(`Rated ${movie.title} ${selectedRating} stars ⭐`);
        const userData = await getUserData(user.uid);
        setRatings(
          Object.fromEntries(
            Object.entries(userData.ratings).map(([k, v]) => [k, { rating: v.rating }])
          )
        );
        setShowRatingDialog(false);
        setIsMenuOpen(false);
        onUpdate?.();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to rate movie";
        toast.error(message);
      }
    }
  };

  const handleAddToList = async (listId: string) => {
    if (!user) {
      toast.error("Please log in to add to lists");
      return;
    }
    try {
      await addMovieToCustomList(listId, movie);
      toast.success("Added to list ✅");
      const lists = await getUserCustomLists();
      setCustomLists(lists.map(l => ({ id: l.id, name: l.name, movies: l.movies })));
      setShowListDialog(false);
      setIsMenuOpen(false);
      onUpdate?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add to list";
      toast.error(message);
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
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
          {isMenuOpen && menuPosition && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed w-48 rounded-lg border border-white/10 bg-[#1a1a1a] shadow-xl z-[9999]"
              style={{
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`,
              }}
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

