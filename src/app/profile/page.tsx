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
  type MovieRating,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserProfile } from "@/lib/firebase/auth";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Share2, Plus, User, Film, Heart, Star, UserPlus, History, Bookmark, BarChart3 } from "lucide-react";
import ShareListDialog from "@/components/ShareListDialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { normalizeList } from "@/lib/profile-helpers";
import CreateListDialog from "@/components/profile/CreateListDialog";
import EditListDialog from "@/components/profile/EditListDialog";
import WatchlistTab from "@/components/profile/WatchlistTab";
import LikedTab from "@/components/profile/LikedTab";
import ListsTab from "@/components/profile/ListsTab";
import RatingsTab from "@/components/profile/RatingsTab";
import { ProfileHeaderSkeleton } from "@/components/ui/skeleton";
import Breadcrumbs from "@/components/Breadcrumbs";
import MovieCard from "@/components/MovieCard";
import FriendRequestButton from "@/components/friends/FriendRequestButton";
import FriendsList from "@/components/friends/FriendsList";
import FriendRequestsList from "@/components/friends/FriendRequestsList";
import UserSearch from "@/components/UserSearch";
import { Users } from "lucide-react";

type ActiveSection = "statistics" | "watchlist" | "liked" | "lists" | "ratings" | "history" | "friends";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [viewingUserId, setViewingUserId] = React.useState<string | null>(null);
  const [viewingUserProfile, setViewingUserProfile] = React.useState<any>(null);
  const [watchlist, setWatchlist] = React.useState<{ watchlist: Array<{ id: string; title: string; year?: number; poster?: string | null }>; liked: Array<{ id: string; title: string; year?: number; poster?: string | null }> }>({ watchlist: [], liked: [] });
  const [customLists, setCustomLists] = React.useState<Array<{ id: string; name: string; description?: string; createdAt: number; movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>; sharedWith?: string[]; isPublic?: boolean }>>([]);
  const [ratings, setRatings] = React.useState<Record<string, MovieRating>>({});
  const [friendCount, setFriendCount] = React.useState(0);
  const [friendRequestsCount, setFriendRequestsCount] = React.useState(0);
  const [activeSection, setActiveSection] = React.useState<ActiveSection>("statistics");
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

  // Get userId from query params
  React.useEffect(() => {
    const userId = searchParams.get("userId");
    setViewingUserId(userId);
  }, [searchParams]);

  React.useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace("/?next=/profile");
      return;
    }

    const targetUserId = viewingUserId || user.uid;
    const isViewingOtherUser = viewingUserId && viewingUserId !== user.uid;

    const loadData = async () => {
      try {
        // Load viewing user's profile if different from current user
        if (isViewingOtherUser) {
          const profile = await getUserProfile(viewingUserId);
          if (profile) {
            setViewingUserProfile(profile);
          } else {
            toast.error("User profile not found");
            router.push("/profile");
            return;
          }
        }

        // Load all data in parallel for better performance
        const [wl, lists, userRatings] = await Promise.all([
          getUserWatchlist(targetUserId),
          getUserCustomLists(targetUserId),
          getUserRatings(targetUserId),
        ]);

        setWatchlist(wl);
        setCustomLists(lists.map(normalizeList));
        setRatings(userRatings);

        // Only load friend count for current user (not when viewing others)
        if (!isViewingOtherUser) {
          try {
            const token = await user.getIdToken();
            const friendsRes = await fetch("/api/friends/list", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (friendsRes.ok) {
              const friendsData = await friendsRes.json();
              setFriendCount(friendsData.friends?.length || 0);
            }
          } catch (error) {
            console.error("Error loading friends data:", error);
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router, viewingUserId]);

  // Lazy load friend requests only when friends section is active
  React.useEffect(() => {
    if (!user || activeSection !== "friends" || friendRequestsCount > 0) return;

    const loadFriendRequests = async () => {
      try {
        const token = await user.getIdToken();
        const requestsRes = await fetch("/api/friends/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setFriendRequestsCount(requestsData.requests?.length || 0);
        }
      } catch (error) {
        console.error("Error loading friend requests:", error);
      }
    };

    loadFriendRequests();
  }, [user, activeSection, friendRequestsCount]);

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

  // Calculate mean rating
  const meanRating = React.useMemo(() => {
    const ratingValues = Object.values(ratings).map(r => r.rating);
    if (ratingValues.length === 0) return 0;
    const sum = ratingValues.reduce((a, b) => a + b, 0);
    return (sum / ratingValues.length).toFixed(2);
  }, [ratings]);

  // Get last updated movies
  const lastUpdated = React.useMemo(() => {
    const allRatings = Object.values(ratings);
    if (allRatings.length === 0) return null;
    const sorted = [...allRatings].sort((a, b) => (b.ratedAt || 0) - (a.ratedAt || 0));
    return sorted[0];
  }, [ratings]);

  // Format join date
  const joinDate = React.useMemo(() => {
    const profile = viewingUserProfile || userProfile;
    if (!profile?.createdAt) return null;
    const date = profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }, [userProfile, viewingUserProfile]);

  const displayProfile = viewingUserProfile || userProfile;
  const isViewingOtherUser = viewingUserId && viewingUserId !== user?.uid;
  const targetUserId = viewingUserId || user?.uid;

  if (authLoading || isLoading || !user || (!displayProfile && !isViewingOtherUser)) {
    return (
      <main className="min-h-screen bg-background text-foreground dark:bg-[#0a0a0a] dark:text-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProfileHeaderSkeleton />
        </div>
      </main>
    );
  }

  const sidebarItems = [
    { id: "statistics" as ActiveSection, label: "Statistics", icon: BarChart3 },
    ...(isViewingOtherUser ? [] : [
      { id: "watchlist" as ActiveSection, label: "Watchlist", icon: Film },
      { id: "liked" as ActiveSection, label: "Liked", icon: Heart },
      { id: "lists" as ActiveSection, label: "My Lists", icon: Bookmark },
    ]),
    { id: "ratings" as ActiveSection, label: "Ratings", icon: Star },
    ...(isViewingOtherUser ? [] : [
      { id: "friends" as ActiveSection, label: "Friends", icon: Users, badge: friendRequestsCount > 0 ? friendRequestsCount : undefined },
      { id: "history" as ActiveSection, label: "History", icon: History },
    ]),
  ];

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground dark:bg-[#0a0a0a] dark:text-neutral-100"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />
        
        {/* Profile Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {displayProfile?.username || "User"}'s Profile
              {isViewingOtherUser && (
                <span className="ml-2 text-sm font-normal text-neutral-400">
                  (Viewing)
                </span>
              )}
            </h1>
            <div className="flex items-center gap-3">
              {!isViewingOtherUser && (
                <Link href="/account" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Profile Settings
                </Link>
              )}
              <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Home
              </Link>
              {isViewingOtherUser && (
                <Link href="/profile" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  My Profile
                </Link>
              )}
            </div>
          </div>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-4 mb-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative mb-4">
                  {displayProfile?.photoURL ? (
                    <img
                      src={displayProfile.photoURL}
                      alt={displayProfile.username}
                      className="w-32 h-32 rounded-lg object-cover border-2 border-emerald-400/30"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-avatar') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`fallback-avatar w-32 h-32 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-4xl font-bold text-black border-2 border-emerald-400/30 ${displayProfile?.photoURL ? 'hidden' : 'flex'}`}
                  >
                    {displayProfile?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
                
                {/* Add Friend Button (when viewing other user) */}
                {isViewingOtherUser && viewingUserId && (
                  <div className="mb-4 w-full">
                    <FriendRequestButton
                      targetUserId={viewingUserId}
                      className="w-full"
                      onStatusChange={() => {
                        // Refresh friend count when status changes
                        if (user) {
                          user.getIdToken().then((token) => {
                            fetch("/api/friends/list", {
                              headers: { Authorization: `Bearer ${token}` },
                            }).then((res) => {
                              if (res.ok) {
                                res.json().then((data) => {
                                  setFriendCount(data.friends?.length || 0);
                                });
                              }
                            });
                          });
                        }
                      }}
                    />
                  </div>
                )}

                {/* User Activity */}
                <div className="text-sm text-neutral-400 space-y-1 text-center">
                  <div>Last Online: Now</div>
                  {joinDate && <div>Joined: {joinDate}</div>}
                </div>
              </div>

              {/* List Buttons */}
              {!isViewingOtherUser && (
                <div className="space-y-2 mb-4">
                  <button
                    onClick={() => setActiveSection("watchlist")}
                    className="w-full py-2 px-4 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 font-medium transition-colors text-sm"
                  >
                    Watchlist
                  </button>
                  <button
                    onClick={() => setActiveSection("liked")}
                    className="w-full py-2 px-4 rounded-lg bg-red-400/20 hover:bg-red-400/30 text-red-300 font-medium transition-colors text-sm"
                  >
                    Liked Movies
                  </button>
                </div>
              )}

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative ${
                        activeSection === item.id
                          ? "bg-emerald-400/20 text-emerald-300 font-medium"
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeSection === "statistics" && (
                <motion.div
                  key="statistics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Movie Statistics */}
                  <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Movie Stats</h2>
                      <Link href="/profile" className="text-sm text-emerald-400 hover:text-emerald-300">
                        All Movie Stats
                      </Link>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {watchlist.watchlist.length + watchlist.liked.length + Object.keys(ratings).length}
                        </div>
                        <div className="text-sm text-neutral-400">Total Movies</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{meanRating}</div>
                        <div className="text-sm text-neutral-400">Mean Score</div>
                      </div>
                    </div>

                    {/* Last Updates */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-neutral-300">Last Movie Updates</h3>
                        <Link href="/profile" className="text-xs text-emerald-400 hover:text-emerald-300">
                          Movie History
                        </Link>
                      </div>
                      {lastUpdated ? (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-12 h-16 bg-neutral-700 rounded flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="font-medium">{lastUpdated.movieTitle}</div>
                            <div className="text-sm text-neutral-400">Rated {lastUpdated.rating}/5</div>
                            {lastUpdated.ratedAt && (
                              <div className="text-xs text-neutral-500 mt-1">
                                {new Date(lastUpdated.ratedAt).toLocaleDateString("en-US", { 
                                  year: "numeric", 
                                  month: "short", 
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit"
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-400">No updates yet. Rate a movie now.</p>
                      )}
                    </div>

                    {/* Detailed Stats */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-300 mb-3">Detailed Movie Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span>Watchlist: {watchlist.watchlist.length}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span>Liked: {watchlist.liked.length}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <span>Rated: {Object.keys(ratings).length}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span>Custom Lists: {customLists.length}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span>Friends: {friendCount}</span>
                          </div>
                        </div>
                        <div className="pt-2 mt-2 border-t border-white/10">
                          <div className="text-xs text-neutral-500">Total Entries: {watchlist.watchlist.length + watchlist.liked.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "watchlist" && (
                <motion.div
                  key="watchlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Watchlist</h2>
                      {!isViewingOtherUser && (
                        <Button
                          onClick={() => handleShareCollection("My Watchlist", watchlist.watchlist)}
                          className="bg-emerald-400 text-black hover:bg-emerald-300"
                          size="sm"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      )}
                    </div>
                    <WatchlistTab movies={watchlist.watchlist} onUpdate={refreshData} />
                  </div>
                </motion.div>
              )}

              {activeSection === "liked" && (
                <motion.div
                  key="liked"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Liked Movies</h2>
                      {!isViewingOtherUser && (
                        <Button
                          onClick={() => handleShareCollection("My Liked Movies", watchlist.liked)}
                          className="bg-emerald-400 text-black hover:bg-emerald-300"
                          size="sm"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      )}
                    </div>
                    <LikedTab movies={watchlist.liked} onUpdate={refreshData} />
                  </div>
                </motion.div>
              )}

              {activeSection === "lists" && (
                <motion.div
                  key="lists"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">My Lists</h2>
                      {!isViewingOtherUser && (
                        <Button
                          onClick={() => setShowCreateListDialog(true)}
                          className="bg-emerald-400 text-black hover:bg-emerald-300"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create List
                        </Button>
                      )}
                    </div>
                    <ListsTab
                      lists={customLists}
                      onCreateClick={!isViewingOtherUser ? () => setShowCreateListDialog(true) : undefined}
                      onEditClick={!isViewingOtherUser ? setEditingList : undefined}
                      onDeleteClick={!isViewingOtherUser ? handleDeleteList : undefined}
                      onShareClick={!isViewingOtherUser ? handleShareList : undefined}
                      onUpdate={refreshData}
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === "ratings" && (
                <motion.div
                  key="ratings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4">Ratings</h2>
                    <RatingsTab ratings={ratings} onRemoveRating={!isViewingOtherUser ? handleRemoveRating : undefined} />
                  </div>
                </motion.div>
              )}

              {activeSection === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4">History</h2>
                    <p className="text-neutral-400">History feature coming soon.</p>
                  </div>
                </motion.div>
              )}

              {activeSection === "friends" && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Friends Section */}
                  <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-1">Friends</h2>
                        <p className="text-sm text-neutral-400">
                          {friendCount} {friendCount === 1 ? 'friend' : 'friends'}
                        </p>
                      </div>
                    </div>

                    {/* Add Friends Search */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-neutral-300 mb-3">Add Friends</h3>
                      <UserSearch
                        onUserSelect={async (userId) => {
                          // When a user is selected, show friend request button or handle it
                          // For now, we'll just show a toast - the user can use FriendRequestButton elsewhere
                          if (user && userId !== user.uid) {
                            toast.success(`Selected user. Use the friend request button to add them.`);
                          }
                        }}
                      />
                    </div>

                    {/* Friend Requests */}
                    {friendRequestsCount > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-neutral-300 mb-3">
                          Friend Requests ({friendRequestsCount})
                        </h3>
                        <FriendRequestsList
                          onUpdate={() => {
                            // Refresh friend count and requests count
                            if (user) {
                              user.getIdToken().then((token) => {
                                Promise.all([
                                  fetch("/api/friends/list", {
                                    headers: { Authorization: `Bearer ${token}` },
                                  }),
                                  fetch("/api/friends/requests", {
                                    headers: { Authorization: `Bearer ${token}` },
                                  }),
                                ]).then(([friendsRes, requestsRes]) => {
                                  if (friendsRes.ok) {
                                    friendsRes.json().then((data) => {
                                      setFriendCount(data.friends?.length || 0);
                                    });
                                  }
                                  if (requestsRes.ok) {
                                    requestsRes.json().then((data) => {
                                      setFriendRequestsCount(data.requests?.length || 0);
                                    });
                                  }
                                });
                              });
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Friends List */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-300 mb-3">All Friends</h3>
                      <FriendsList
                        onUpdate={() => {
                          // Refresh friend count
                          if (user) {
                            user.getIdToken().then((token) => {
                              fetch("/api/friends/list", {
                                headers: { Authorization: `Bearer ${token}` },
                              }).then((res) => {
                                if (res.ok) {
                                  res.json().then((data) => {
                                    setFriendCount(data.friends?.length || 0);
                                  });
                                }
                              });
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
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
