"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  getUserWatchlist,
  getUserCustomLists,
  createCustomList,
  updateCustomList,
  deleteCustomList,
  getUserRatings,
  removeRating,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import MovieCard from "@/components/MovieCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, Plus, Edit, Trash2, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = React.useState<{ watchlist: Array<{ id: string; title: string; year?: number; poster?: string | null }>; liked: Array<{ id: string; title: string; year?: number; poster?: string | null }> }>({ watchlist: [], liked: [] });
  const [customLists, setCustomLists] = React.useState<Array<{ id: string; name: string; description?: string; createdAt: number; movies: Array<{ id: string; title: string; year?: number; poster?: string | null }> }>>([]);
  const [ratings, setRatings] = React.useState<Record<string, { movieId: string; movieTitle: string; movieYear?: number; moviePoster?: string | null; rating: number; ratedAt: number }>>({});
  const [activeTab, setActiveTab] = React.useState<"watchlist" | "liked" | "lists" | "ratings">("watchlist");
  const [showCreateListDialog, setShowCreateListDialog] = React.useState(false);
  const [editingList, setEditingList] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ isOpen: boolean; listId: string | null; listName: string }>({ isOpen: false, listId: null, listName: "" });

  React.useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace("/?next=/profile");
      return;
    }

    const loadData = async () => {
      try {
        const wl = await getUserWatchlist(user.uid);
        setWatchlist(wl);
        const lists = await getUserCustomLists(user.uid);
        setCustomLists(lists.map(l => ({
          id: l.id,
          name: l.name,
          description: l.description,
          createdAt: typeof l.createdAt === 'number' ? l.createdAt : Date.now(),
          movies: l.movies
        })));
        const userRatings = await getUserRatings(user.uid);
        setRatings(userRatings);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  const refreshData = React.useCallback(async () => {
    if (!user) return;
    try {
      const wl = await getUserWatchlist(user.uid);
      setWatchlist(wl);
      const lists = await getUserCustomLists(user.uid);
      setCustomLists(lists.map(l => ({
        id: l.id,
        name: l.name,
        description: l.description,
        createdAt: typeof l.createdAt === 'number' ? l.createdAt : Date.now(),
        movies: l.movies
      })));
      const userRatings = await getUserRatings(user.uid);
      setRatings(userRatings);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  }, [user]);


  const handleCreateList = async (name: string, description?: string) => {
    try {
      await createCustomList(name, description);
      await refreshData();
      setShowCreateListDialog(false);
      toast.success("List created");
    } catch (error: any) {
      toast.error(error.message || "Failed to create list");
    }
  };

  const handleUpdateList = async (listId: string, name: string, description?: string) => {
    try {
      await updateCustomList(listId, { name, description });
      await refreshData();
      setEditingList(null);
      toast.success("List updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update list");
    }
  };

  const handleDeleteList = (listId: string, listName: string) => {
    setDeleteConfirm({ isOpen: true, listId, listName });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.listId) {
      try {
        await deleteCustomList(deleteConfirm.listId);
        await refreshData();
        setDeleteConfirm({ isOpen: false, listId: null, listName: "" });
        toast.success("List deleted");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete list");
      }
    }
  };

  const handleRemoveRating = async (movieId: string) => {
    try {
      await removeRating(movieId);
      await refreshData();
      toast.success("Rating removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove rating");
    }
  };

  if (authLoading || isLoading || !user || !userProfile) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </main>
    );
  }


  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0a0a0a] text-neutral-100"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex items-center justify-between"
        >
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <nav className="flex items-center gap-3 text-sm text-neutral-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/logout" className="hover:text-white transition-colors">Logout</Link>
          </nav>
        </motion.header>

        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
        >
          <h2 className="text-lg font-medium mb-2">User Information</h2>
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-neutral-400">Username:</span> <span className="text-white">{userProfile.username}</span>
            </div>
            <div>
              <span className="text-neutral-400">Email:</span> <span className="text-white">{userProfile.email}</span>
            </div>
          </div>
        </motion.section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex gap-2 border-b border-white/10 flex-wrap">
            <button
              onClick={() => setActiveTab("watchlist")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "watchlist"
                  ? "border-b-2 border-emerald-400 text-emerald-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Watchlist ({watchlist.watchlist.length})
            </button>
            <button
              onClick={() => setActiveTab("liked")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "liked"
                  ? "border-b-2 border-emerald-400 text-emerald-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Liked ({watchlist.liked.length})
            </button>
            <button
              onClick={() => setActiveTab("lists")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "lists"
                  ? "border-b-2 border-emerald-400 text-emerald-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              My Lists ({customLists.length})
            </button>
            <button
              onClick={() => setActiveTab("ratings")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "ratings"
                  ? "border-b-2 border-emerald-400 text-emerald-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Ratings ({Object.keys(ratings).length})
            </button>
            {activeTab === "lists" && (
              <Button
                onClick={() => setShowCreateListDialog(true)}
                className="ml-auto bg-emerald-400 text-black hover:bg-emerald-300"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create List
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "watchlist" && (
              <motion.div
                key="watchlist"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {watchlist.watchlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-sm text-neutral-400 mb-2">Your watchlist is empty.</p>
                    <p className="text-xs text-neutral-500">Start by exploring movies and adding them to your watchlist!</p>
                    <Link href="/search">
                      <Button className="mt-4 bg-emerald-400 text-black hover:bg-emerald-300">
                        Explore Movies
                      </Button>
                    </Link>
                  </div>
                ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {watchlist.watchlist.map((movie) => (
                    <MovieCard 
                      key={movie.id} 
                      id={movie.id} 
                      title={movie.title} 
                      year={movie.year} 
                      poster={movie.poster}
                      showInteraction={true}
                      onUpdate={refreshData}
                    />
                  ))}
                </div>
                )}
              </motion.div>
            )}

            {activeTab === "liked" && (
              <motion.div
                key="liked"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {watchlist.liked.length === 0 ? (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-sm text-neutral-400 mb-2">You haven&apos;t liked any movies yet.</p>
                    <p className="text-xs text-neutral-500">Start exploring and like movies you enjoy!</p>
                    <Link href="/search">
                      <Button className="mt-4 bg-emerald-400 text-black hover:bg-emerald-300">
                        Explore Movies
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {watchlist.liked.map((movie) => (
                      <MovieCard 
                        key={movie.id} 
                        id={movie.id} 
                        title={movie.title} 
                        year={movie.year} 
                        poster={movie.poster}
                        showInteraction={true}
                        onUpdate={refreshData}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "lists" && (
              <motion.div
                key="lists"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {customLists.length === 0 ? (
                  <div className="text-center py-8">
                    <Film className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-sm text-neutral-400 mb-4">You haven&apos;t created any custom lists yet.</p>
                    <Button
                      onClick={() => setShowCreateListDialog(true)}
                      className="bg-emerald-400 text-black hover:bg-emerald-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First List
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {customLists.map((list) => (
                      <div key={list.id} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{list.name}</h3>
                            {list.description && (
                              <p className="text-sm text-neutral-400 mt-1">{list.description}</p>
                            )}
                            <p className="text-xs text-neutral-500 mt-1">{list.movies.length} movies</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingList(list.id)}
                              className="p-2 hover:bg-white/10 rounded"
                              title="Edit list"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteList(list.id, list.name)}
                              className="p-2 hover:bg-red-500/20 rounded text-red-400"
                              title="Delete list"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {list.movies.length === 0 ? (
                          <p className="text-sm text-neutral-400 py-4">This list is empty.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {list.movies.map((movie) => (
                              <MovieCard 
                                key={movie.id} 
                                id={movie.id} 
                                title={movie.title} 
                                year={movie.year} 
                                poster={movie.poster}
                                showInteraction={true}
                                onUpdate={refreshData}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "ratings" && (
              <motion.div
                key="ratings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {Object.keys(ratings).length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-sm text-neutral-400 mb-2">You haven&apos;t rated any movies yet.</p>
                    <p className="text-xs text-neutral-500">Start rating movies you&apos;ve watched!</p>
                    <Link href="/search">
                      <Button className="mt-4 bg-emerald-400 text-black hover:bg-emerald-300">
                        Explore Movies
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(ratings).map(([movieId, rating]) => (
                      <div key={movieId} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {rating.moviePoster ? (
                            <img
                              src={rating.moviePoster}
                              alt={rating.movieTitle}
                              className="w-16 h-24 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-24 bg-white/5 rounded flex items-center justify-center text-xs text-neutral-500">
                              No Image
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{rating.movieTitle}</div>
                            {rating.movieYear && (
                              <div className="text-sm text-neutral-400">{rating.movieYear}</div>
                            )}
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= rating.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-neutral-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                              Rated {new Date(rating.ratedAt).toLocaleDateString()}
                            </div>
                            <button
                              onClick={() => handleRemoveRating(movieId)}
                              className="mt-2 text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove rating
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </div>

      {/* Create List Dialog */}
      <CreateListDialog
        open={showCreateListDialog}
        onClose={() => setShowCreateListDialog(false)}
        onCreate={handleCreateList}
      />

      {/* Edit List Dialog */}
      {editingList && (
        <EditListDialog
          list={customLists.find(l => l.id === editingList)!}
          open={!!editingList}
          onClose={() => setEditingList(null)}
          onUpdate={handleUpdateList}
        />
      )}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete List"
        message={`Are you sure you want to delete "${deleteConfirm.listName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, listId: null, listName: "" })}
        variant="danger"
      />
    </motion.main>
  );
}

function CreateListDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, description?: string) => void }) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">List Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Action Movies"
              className="bg-white/5 border-white/10"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your list..."
              className="bg-white/5 border-white/10"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditListDialog({ list, open, onClose, onUpdate }: { 
  list: { id: string; name: string; description?: string };
  open: boolean;
  onClose: () => void;
  onUpdate: (listId: string, name: string, description?: string) => void;
}) {
  const [name, setName] = React.useState(list.name);
  const [description, setDescription] = React.useState(list.description || "");

  React.useEffect(() => {
    setName(list.name);
    setDescription(list.description || "");
  }, [list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdate(list.id, name.trim(), description.trim() || undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">List Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
