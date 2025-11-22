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
  type MovieRating,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Share2, Plus } from "lucide-react";
import ShareListDialog from "@/components/ShareListDialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { normalizeList } from "@/lib/profile-helpers";
import { User, Film, Heart, Star, Palette } from "lucide-react";
import CreateListDialog from "@/components/profile/CreateListDialog";
import EditListDialog from "@/components/profile/EditListDialog";
import TabButton from "@/components/profile/TabButton";
import WatchlistTab from "@/components/profile/WatchlistTab";
import LikedTab from "@/components/profile/LikedTab";
import ListsTab from "@/components/profile/ListsTab";
import RatingsTab from "@/components/profile/RatingsTab";
import { ProfileHeaderSkeleton } from "@/components/ui/skeleton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = React.useState<{ watchlist: Array<{ id: string; title: string; year?: number; poster?: string | null }>; liked: Array<{ id: string; title: string; year?: number; poster?: string | null }> }>({ watchlist: [], liked: [] });
  const [customLists, setCustomLists] = React.useState<Array<{ id: string; name: string; description?: string; createdAt: number; movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>; sharedWith?: string[]; isPublic?: boolean }>>([]);
  const [ratings, setRatings] = React.useState<Record<string, MovieRating>>({});
  const [activeTab, setActiveTab] = React.useState<"watchlist" | "liked" | "lists" | "ratings">("watchlist");
  const [showCreateListDialog, setShowCreateListDialog] = React.useState(false);
  const [editingList, setEditingList] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ isOpen: boolean; listId: string | null; listName: string }>({ isOpen: false, listId: null, listName: "" });
  const [shareDialog, setShareDialog] = React.useState<{ open: boolean; listId: string | null; listName: string; sharedWith: string[]; isPublic: boolean }>({ 
    open: false, 
    listId: null, 
    listName: "", 
    sharedWith: [], 
    isPublic: false 
  });

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
        setCustomLists(lists.map(normalizeList));
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
      setCustomLists(lists.map(normalizeList));
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create list";
      toast.error(message);
    }
  };

  const handleUpdateList = async (listId: string, name: string, description?: string) => {
    try {
      await updateCustomList(listId, { name, description });
      await refreshData();
      setEditingList(null);
      toast.success("List updated");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update list";
      toast.error(message);
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
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete list";
        toast.error(message);
      }
    }
  };

  const handleRemoveRating = async (movieId: string) => {
    try {
      await removeRating(movieId);
      await refreshData();
      toast.success("Rating removed");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove rating";
      toast.error(message);
    }
  };

  const handleShareCollection = async (name: string, movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>) => {
    if (movies.length === 0) {
      toast.error("Cannot share an empty collection");
      return;
    }

    try {
      const tempList = await createCustomList(name, `Shared ${name.toLowerCase()}`);
      
      const { addMovieToCustomList } = await import("@/lib/firebase/firestore");
      for (const movie of movies) {
        await addMovieToCustomList(tempList.id, movie);
      }
      
      setShareDialog({
        open: true,
        listId: tempList.id,
        listName: tempList.name,
        sharedWith: tempList.sharedWith || [],
        isPublic: tempList.isPublic || false,
      });
      
      await refreshData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create shareable list";
      toast.error(message);
    }
  };

  const handleShareList = (list: { id: string; name: string; sharedWith?: string[]; isPublic?: boolean }) => {
    setShareDialog({
      open: true,
      listId: list.id,
      listName: list.name,
      sharedWith: list.sharedWith || [],
      isPublic: list.isPublic || false,
    });
  };

  if (authLoading || isLoading || !user || !userProfile) {
    return (
      <main className="min-h-screen bg-background text-foreground dark:bg-[#0a0a0a] dark:text-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProfileHeaderSkeleton />
        </div>
      </main>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground dark:bg-[#0a0a0a] dark:text-neutral-100"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs />
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
          className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-emerald-50/30 to-emerald-50/10 dark:from-white/5 dark:to-white/[0.02] p-6 shadow-sm dark:border-white/10 dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(600px_350px_at_30%_20%,rgba(16,185,129,0.08),transparent_60%)] dark:bg-[radial-gradient(600px_350px_at_30%_20%,rgba(16,185,129,0.1),transparent_60%)]" aria-hidden />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.username}
                    className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-emerald-400/20"
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className={`h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl font-bold text-black shadow-lg ring-4 ring-emerald-400/20 ${userProfile.photoURL ? 'hidden' : ''}`}
                >
                  {userProfile.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-400 border-2 border-background dark:border-[#0a0a0a] flex items-center justify-center">
                  <User className="h-3 w-3 text-black" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-1">{userProfile.username}</h2>
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher inline />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 border border-border dark:bg-white/5 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Film className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Watchlist</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{watchlist.watchlist.length}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 border border-border dark:bg-white/5 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Liked</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{watchlist.liked.length}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 border border-border dark:bg-white/5 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Film className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Lists</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{customLists.length}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 border border-border dark:bg-white/5 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Rated</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{Object.keys(ratings).length}</div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex gap-2 border-b border-white/10 flex-wrap">
            <TabButton
              label="Watchlist"
              count={watchlist.watchlist.length}
              isActive={activeTab === "watchlist"}
              onClick={() => setActiveTab("watchlist")}
            />
            <TabButton
              label="Liked"
              count={watchlist.liked.length}
              isActive={activeTab === "liked"}
              onClick={() => setActiveTab("liked")}
            />
            <TabButton
              label="My Lists"
              count={customLists.length}
              isActive={activeTab === "lists"}
              onClick={() => setActiveTab("lists")}
            />
            <TabButton
              label="Ratings"
              count={Object.keys(ratings).length}
              isActive={activeTab === "ratings"}
              onClick={() => setActiveTab("ratings")}
            />
            {(activeTab === "watchlist" || activeTab === "liked") && (
              <Button
                onClick={() => {
                  const listName = activeTab === "watchlist" ? "My Watchlist" : "My Liked Movies";
                  const movies = activeTab === "watchlist" ? watchlist.watchlist : watchlist.liked;
                  handleShareCollection(listName, movies);
                }}
                className="ml-auto bg-emerald-400 text-black hover:bg-emerald-300"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share {activeTab === "watchlist" ? "Watchlist" : "Liked"}
              </Button>
            )}
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
              <WatchlistTab movies={watchlist.watchlist} onUpdate={refreshData} />
            )}
            {activeTab === "liked" && (
              <LikedTab movies={watchlist.liked} onUpdate={refreshData} />
            )}
            {activeTab === "lists" && (
              <ListsTab
                lists={customLists}
                onCreateClick={() => setShowCreateListDialog(true)}
                onEditClick={setEditingList}
                onDeleteClick={handleDeleteList}
                onShareClick={handleShareList}
                                onUpdate={refreshData}
                              />
            )}
            {activeTab === "ratings" && (
              <RatingsTab ratings={ratings} onRemoveRating={handleRemoveRating} />
            )}
          </AnimatePresence>
        </section>
      </div>

      <CreateListDialog
        open={showCreateListDialog}
        onClose={() => setShowCreateListDialog(false)}
        onCreate={handleCreateList}
      />

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

      {shareDialog.listId && (
        <ShareListDialog
          open={shareDialog.open}
          onClose={() => setShareDialog({ open: false, listId: null, listName: "", sharedWith: [], isPublic: false })}
          listId={shareDialog.listId}
          listName={shareDialog.listName}
          currentSharedWith={shareDialog.sharedWith}
          isPublic={shareDialog.isPublic}
          onUpdate={refreshData}
        />
      )}
    </motion.main>
  );
}
