"use client";

import * as React from "react";
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
import { Plus, Grid3X3, Heart, Bookmark, Star, Users, RefreshCw, Settings } from "lucide-react";
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
import FriendsTab from "@/components/profile/FriendsTab";
import { ProfileHeaderSkeleton } from "@/components/ui/skeleton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";

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

    const userIdParam = searchParams.get("userId");
    const targetUserId = userIdParam && userIdParam !== user.uid ? userIdParam : null;
    setViewingUserId(targetUserId);

    const loadData = async () => {
      try {
        const targetUid = targetUserId || user.uid;

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

        const count = await getFriendCount(targetUid);
        setFriendsCount(count);

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatJoinDate = (timestamp: number | { toMillis?: () => number }) => {
    const date = typeof timestamp === 'number' ? timestamp : (timestamp.toMillis?.() || Date.now());
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || isLoading || !user || !displayProfile) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProfileHeaderSkeleton />
        </div>
      </main>
    );
  }

  const createdAt = typeof displayProfile.createdAt === 'number'
    ? displayProfile.createdAt
    : displayProfile.createdAt.toMillis?.() || Date.now();

  const tabs = [
    { id: "watchlist", label: "Watchlist", icon: Grid3X3, count: watchlist.watchlist.length },
    { id: "liked", label: "Liked", icon: Heart, count: watchlist.liked.length },
    { id: "lists", label: "Collections", icon: Bookmark, count: customLists.length },
    { id: "ratings", label: "Ratings", icon: Star, count: Object.keys(ratings).length },
    { id: "friends", label: "Friends", icon: Users, count: friendsCount },
    ...(isOwnProfile ? [{ id: "history", label: "History", icon: RefreshCw, count: activity.length }] : []),
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050505] text-neutral-100"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs />

        {/* Professional Header - No Cards */}
        <div className="mt-8 mb-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-white/5 pb-12">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-[#b91c1c] flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-primary/20 ring-4 ring-black">
              {displayProfile.username.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-white">{displayProfile.username}</h1>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <span>Member since {formatJoinDate(createdAt)}</span>
                <span className="h-1 w-1 rounded-full bg-neutral-600" />
                <span className="text-primary font-medium">Pro Member</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300"
                onClick={() => router.push("/account")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count > 0 && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isActive ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats - Minimalist */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
              <h3 className="text-sm font-medium text-neutral-400 mb-4 px-1">Total Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-2xl font-bold text-white">{Object.keys(ratings).length}</div>
                  <div className="text-xs text-neutral-500 font-medium mt-1">Movies Rated</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-2xl font-bold text-white">{watchlist.watchlist.length + watchlist.liked.length}</div>
                  <div className="text-xs text-neutral-500 font-medium mt-1">Saved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>

              {/* Context Actions */}
              {isOwnProfile && activeTab === "lists" && (
                <Button
                  onClick={() => setShowCreateListDialog(true)}
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New List
                </Button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-black/20 rounded-2xl border border-white/5 p-1 min-h-[400px]"
              >
                <div className="p-4">
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
                    <div className="space-y-0 divide-y divide-white/5">
                      {activity.length === 0 ? (
                        <div className="text-center py-20">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="h-8 w-8 text-neutral-500" />
                          </div>
                          <p className="text-neutral-400">No activity yet</p>
                        </div>
                      ) : (
                        activity.slice(0, 50).map((item, idx) => {
                          const timestamp = typeof item.timestamp === 'number' ? item.timestamp : item.timestamp.toMillis?.() || Date.now();
                          return (
                            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                              <div className="w-2 h-2 rounded-full bg-neutral-700 group-hover:bg-primary transition-colors" />
                              <div className="flex-1">
                                {item.type === "movie_rated" && (
                                  <span className="text-neutral-300">
                                    Rated <span className="text-white font-medium">{item.movieTitle}</span>
                                    <span className="ml-2 inline-flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs">
                                      {item.rating} <Star className="h-3 w-3 fill-current" />
                                    </span>
                                  </span>
                                )}
                                {item.type === "movie_added_to_watchlist" && (
                                  <span className="text-neutral-300">
                                    Added <span className="text-white font-medium">{item.movieTitle}</span> to watchlist
                                  </span>
                                )}
                                {item.type === "movie_liked" && (
                                  <span className="text-neutral-300">
                                    Liked <span className="text-white font-medium">{item.movieTitle}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 font-medium tabular-nums">
                                {formatDate(timestamp)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
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
