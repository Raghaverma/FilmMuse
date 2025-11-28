"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  getUserWatchlist,
  getUserCustomLists,
  createCustomList,
  updateCustomList,
  deleteCustomList,
  getUserRatings,
  removeRating,
  getUserData,
  type MovieRating,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserProfile } from "@/lib/firebase/auth";
import { getFriendCount } from "@/lib/firebase/friends";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Share2, Plus, ArrowLeft, Grid3X3, Heart, Bookmark, Star, Users, RefreshCw, BarChart3 } from "lucide-react";
import ShareListDialog from "@/components/ShareListDialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { normalizeList } from "@/lib/profile-helpers";
import { User, Film } from "lucide-react";
import CreateListDialog from "@/components/profile/CreateListDialog";
import EditListDialog from "@/components/profile/EditListDialog";
import TabButton from "@/components/profile/TabButton";
import WatchlistTab from "@/components/profile/WatchlistTab";
import LikedTab from "@/components/profile/LikedTab";
import ListsTab from "@/components/profile/ListsTab";
import RatingsTab from "@/components/profile/RatingsTab";
import FriendsTab from "@/components/profile/FriendsTab";
import { ProfileHeaderSkeleton } from "@/components/ui/skeleton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [viewingUserId, setViewingUserId] = React.useState<string | null>(null);
  const [viewingUserProfile, setViewingUserProfile] = React.useState<typeof userProfile | null>(null);
  const [watchlist, setWatchlist] = React.useState<{ watchlist: Array<{ id: string; title: string; year?: number; poster?: string | null }>; liked: Array<{ id: string; title: string; year?: number; poster?: string | null }> }>({ watchlist: [], liked: [] });
  const [customLists, setCustomLists] = React.useState<Array<{ id: string; name: string; description?: string; createdAt: number; movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>; sharedWith?: string[]; isPublic?: boolean }>>([]);
  const [ratings, setRatings] = React.useState<Record<string, MovieRating>>({});
  const [friendsCount, setFriendsCount] = React.useState(0);
  const [activity, setActivity] = React.useState<Array<{ type: string; movieId?: string; movieTitle?: string; rating?: number; timestamp: number | { toMillis: () => number } }>>([]);
  const [activeTab, setActiveTab] = React.useState<"watchlist" | "liked" | "lists" | "ratings" | "friends" | "history">("watchlist");
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

    // Check for userId query param
    const userIdParam = searchParams.get("userId");
    const targetUserId = userIdParam && userIdParam !== user.uid ? userIdParam : null;
    setViewingUserId(targetUserId);

    const loadData = async () => {
      try {
        const targetUid = targetUserId || user.uid;
        
        // Load friend profile if viewing friend
        if (targetUserId) {
          const friendProfile = await getUserProfile(targetUserId);
          if (friendProfile) {
            setViewingUserProfile(friendProfile);
          } else {
            toast.error("User not found");
            router.replace("/profile");
            return;
          }
        } else {
          setViewingUserProfile(null);
        }

        const wl = await getUserWatchlist(targetUid);
        setWatchlist(wl);
        const lists = await getUserCustomLists(targetUid);
        setCustomLists(lists.map(normalizeList));
        const userRatings = await getUserRatings(targetUid);
        setRatings(userRatings);
        
        // Load friends count
        const count = await getFriendCount(targetUid);
        setFriendsCount(count);
        
        // Load activity
        const userData = await getUserData(targetUid);
        setActivity(userData.activity || []);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router, searchParams]);

  const refreshData = React.useCallback(async () => {
    if (!user) return;
    try {
      const targetUid = viewingUserId || user.uid;
      const wl = await getUserWatchlist(targetUid);
      setWatchlist(wl);
      const lists = await getUserCustomLists(targetUid);
      setCustomLists(lists.map(normalizeList));
      const userRatings = await getUserRatings(targetUid);
      setRatings(userRatings);
      const count = await getFriendCount(targetUid);
      setFriendsCount(count);
      const userData = await getUserData(targetUid);
      setActivity(userData.activity || []);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  }, [user, viewingUserId]);

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

  const displayProfile = viewingUserProfile || userProfile;
  const isOwnProfile = !viewingUserId;

  // Calculate stats
  const totalMovies = React.useMemo(() => {
    const movieIds = new Set<string>();
    watchlist.watchlist.forEach(m => movieIds.add(m.id));
    watchlist.liked.forEach(m => movieIds.add(m.id));
    Object.keys(ratings).forEach(id => movieIds.add(id));
    return movieIds.size;
  }, [watchlist, ratings]);

  const meanScore = React.useMemo(() => {
    const ratingValues = Object.values(ratings).map(r => r.rating);
    if (ratingValues.length === 0) return 0;
    const sum = ratingValues.reduce((acc, val) => acc + val, 0);
    return sum / ratingValues.length;
  }, [ratings]);

  const totalEntries = watchlist.watchlist.length + watchlist.liked.length + Object.keys(ratings).length;

  // Get last movie update
  const lastMovieUpdate = React.useMemo(() => {
    const ratingEntries = Object.entries(ratings)
      .map(([movieId, rating]) => ({
        type: "rated",
        movieId,
        movieTitle: rating.movieTitle,
        rating: rating.rating,
        timestamp: typeof rating.ratedAt === 'number' ? rating.ratedAt : rating.ratedAt.toMillis?.() || Date.now(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (ratingEntries.length > 0) {
      return ratingEntries[0];
    }
    return null;
  }, [ratings]);

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Format join date
  const formatJoinDate = (timestamp: number | { toMillis?: () => number }) => {
    const date = typeof timestamp === 'number' ? timestamp : (timestamp.toMillis?.() || Date.now());
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || isLoading || !user || !displayProfile) {
    return (
      <main className="min-h-screen bg-background text-foreground dark:bg-[#0a0a0a] dark:text-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProfileHeaderSkeleton />
        </div>
      </main>
    );
  }

  const createdAt = typeof displayProfile.createdAt === 'number' 
    ? displayProfile.createdAt 
    : displayProfile.createdAt.toMillis?.() || Date.now();

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
          <div className="flex items-center gap-3">
            {!isOwnProfile && (
              <Button
                onClick={() => router.push("/profile")}
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/15 text-neutral-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                My Profile
              </Button>
            )}
            <h1 className="text-2xl font-semibold">{isOwnProfile ? "My Profile" : `${displayProfile.username}'s Profile`}</h1>
          </div>
          <nav className="flex items-center gap-3 text-sm text-neutral-300">
            {isOwnProfile && <Link href="/account" className="hover:text-white transition-colors">Profile Settings</Link>}
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {isOwnProfile && <Link href="/logout" className="hover:text-white transition-colors">Logout</Link>}
          </nav>
        </motion.header>

        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl font-bold text-black">
                  {displayProfile.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Status */}
              <div className="text-center space-y-1">
                <p className="text-sm text-neutral-400">Last Online: <span className="text-emerald-400">Now</span></p>
                <p className="text-sm text-neutral-400">Joined: {formatJoinDate(createdAt)}</p>
              </div>

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="space-y-2">
                  <Button
                    onClick={() => setActiveTab("watchlist")}
                    className="w-full bg-emerald-400 text-black hover:bg-emerald-300 justify-start"
                    size="sm"
                  >
                    Watchlist
                  </Button>
                  <Button
                    onClick={() => setActiveTab("liked")}
                    className="w-full bg-red-500 text-white hover:bg-red-600 justify-start"
                    size="sm"
                  >
                    Liked Movies
                  </Button>
                  <Button
                    onClick={() => setActiveTab("watchlist")}
                    className="w-full bg-emerald-400 text-black hover:bg-emerald-300 justify-start"
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Statistics
                  </Button>
                </div>
              )}

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("watchlist")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "watchlist" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>Watchlist</span>
                </button>
                <button
                  onClick={() => setActiveTab("liked")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "liked" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>Liked</span>
                </button>
                <button
                  onClick={() => setActiveTab("lists")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "lists" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>My Lists</span>
                </button>
                <button
                  onClick={() => setActiveTab("ratings")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "ratings" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Star className="h-4 w-4" />
                  <span>Ratings</span>
                </button>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => setActiveTab("friends")}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === "friends" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <span>Friends</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === "history" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>History</span>
                    </button>
                  </>
                )}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Movie Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Movie Stats Card */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Movie Stats</h2>
                  <Link href="/profile" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    All Movie Stats
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-4xl font-bold mb-1">{totalMovies}</div>
                    <div className="text-sm text-neutral-400">Total Movies</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-1">{meanScore.toFixed(2)}</div>
                    <div className="text-sm text-neutral-400">Mean Score</div>
                  </div>
                </div>
              </div>

              {/* Last Movie Updates Card */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Last Movie Updates</h2>
                  <Link href="/profile?tab=history" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    Movie History
                  </Link>
                </div>
                {lastMovieUpdate ? (
                  <div className="flex gap-3">
                    <div className="w-16 h-24 bg-white/5 rounded flex-shrink-0 flex items-center justify-center">
                      <Film className="h-8 w-8 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{lastMovieUpdate.movieTitle}</div>
                      <div className="text-sm text-neutral-400 mt-1">Rated {lastMovieUpdate.rating}/5</div>
                      <div className="text-xs text-neutral-500 mt-1">{formatDate(lastMovieUpdate.timestamp)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-neutral-400">No updates yet</div>
                )}
              </div>

              {/* Detailed Movie Stats Card */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Detailed Movie Stats</h2>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-sm">Watchlist: {watchlist.watchlist.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm">Liked: {watchlist.liked.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-sm">Rated: {Object.keys(ratings).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span className="text-sm">Custom Lists: {customLists.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-sm">Friends: {friendsCount}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <div className="text-sm font-medium">Total Entries: {totalEntries}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Content */}
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
                <TabButton
                  label="Friends"
                  count={friendsCount}
                  isActive={activeTab === "friends"}
                  onClick={() => setActiveTab("friends")}
                />
                {isOwnProfile && (
                  <TabButton
                    label="History"
                    count={activity.length}
                    isActive={activeTab === "history"}
                    onClick={() => setActiveTab("history")}
                  />
                )}
                {isOwnProfile && (activeTab === "watchlist" || activeTab === "liked") && (
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
                {isOwnProfile && activeTab === "lists" && (
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
                  <RatingsTab ratings={ratings} onRemoveRating={handleRemoveRating} isOwnProfile={isOwnProfile} />
                )}
                {activeTab === "friends" && (
                  <FriendsTab userId={viewingUserId || undefined} isOwnProfile={isOwnProfile} />
                )}
                {activeTab === "history" && isOwnProfile && (
                  <div className="space-y-3">
                    {activity.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-neutral-400">No activity yet</p>
                      </div>
                    ) : (
                      activity.slice(0, 20).map((item, idx) => {
                        const timestamp = typeof item.timestamp === 'number' ? item.timestamp : item.timestamp.toMillis?.() || Date.now();
                        return (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-neutral-400">{formatDate(timestamp)}</div>
                            <div className="flex-1">
                              {item.type === "movie_rated" && (
                                <span className="text-sm">
                                  Rated <span className="font-medium">{item.movieTitle}</span> {item.rating}/5
                                </span>
                              )}
                              {item.type === "movie_added_to_watchlist" && (
                                <span className="text-sm">
                                  Added <span className="font-medium">{item.movieTitle}</span> to watchlist
                                </span>
                              )}
                              {item.type === "movie_liked" && (
                                <span className="text-sm">
                                  Liked <span className="font-medium">{item.movieTitle}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
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
