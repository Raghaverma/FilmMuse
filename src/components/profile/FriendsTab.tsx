"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Search, Check } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import FriendCard from "@/components/friends/FriendCard";
import { getUserProfile } from "@/lib/firebase/auth";
import { getFriendCount, getFriendshipStatus } from "@/lib/firebase/friends";
import { searchUsers } from "@/lib/firebase/follows";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface FriendsTabProps {
  userId?: string;
  isOwnProfile?: boolean;
}

export default function FriendsTab({ userId, isOwnProfile = true }: FriendsTabProps) {
  const { user } = useAuth();
  const [friends, setFriends] = React.useState<Array<{
    userId: string;
    username: string;
    photoURL?: string | null;
    email: string;
    friendsSince: number;
  }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Array<{
    uid: string;
    username?: string;
    email?: string;
    photoURL?: string | null;
    status?: "none" | "friends" | "pending" | "requested";
  }>>([]);
  const [searching, setSearching] = React.useState(false);
  const [sendingRequest, setSendingRequest] = React.useState<string | null>(null);

  const loadFriends = React.useCallback(async () => {
    const targetUserId = userId || user?.uid;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      if (isOwnProfile && user) {
        // Use API route for own profile
        const token = await user.getIdToken();
        const response = await fetch("/api/friends/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFriends(data.friends || []);
        }
      } else {
        // Load friends for another user directly from Firestore
        const friendsRef = collection(db, "friends");
        const q1 = query(
          friendsRef,
          where("user1", "==", targetUserId),
          where("status", "==", "accepted")
        );
        const q2 = query(
          friendsRef,
          where("user2", "==", targetUserId),
          where("status", "==", "accepted")
        );

        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(q1),
          getDocs(q2),
        ]);

        const friendsList: Array<{
          userId: string;
          username: string;
          photoURL?: string | null;
          email: string;
          friendsSince: number;
        }> = [];

        // Process user1 matches
        for (const docSnap of snapshot1.docs) {
          const data = docSnap.data();
          const friendId = data.user2;
          const friendProfile = await getUserProfile(friendId);
          
          if (friendProfile) {
            friendsList.push({
              userId: friendId,
              username: friendProfile.username,
              photoURL: friendProfile.photoURL,
              email: friendProfile.email,
              friendsSince: data.acceptedAt?.toMillis?.() || data.acceptedAt || data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
            });
          }
        }

        // Process user2 matches
        for (const docSnap of snapshot2.docs) {
          const data = docSnap.data();
          const friendId = data.user1;
          const friendProfile = await getUserProfile(friendId);
          
          if (friendProfile) {
            friendsList.push({
              userId: friendId,
              username: friendProfile.username,
              photoURL: friendProfile.photoURL,
              email: friendProfile.email,
              friendsSince: data.acceptedAt?.toMillis?.() || data.acceptedAt || data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
            });
          }
        }

        setFriends(friendsList.sort((a, b) => b.friendsSince - a.friendsSince));
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  }, [user, userId, isOwnProfile]);

  React.useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Search for users
  const handleSearch = React.useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    if (!user || !isOwnProfile) return;

    setSearching(true);
    try {
      const users = await searchUsers(query);
      // Filter out current user and existing friends
      const friendIds = new Set(friends.map(f => f.userId));
      const filteredUsers = users.filter(u => u.uid !== user.uid && !friendIds.has(u.uid));
      
      // Get friendship status for each user
      const usersWithStatus = await Promise.all(
        filteredUsers.map(async (u) => {
          const status = await getFriendshipStatus(u.uid);
          return { ...u, status };
        })
      );
      
      setSearchResults(usersWithStatus);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [user, isOwnProfile, friends]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Send friend request
  const handleSendRequest = async (targetUserId: string) => {
    if (!user || sendingRequest) return;

    setSendingRequest(targetUserId);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send friend request");
      }

      toast.success("Friend request sent");
      // Update status in search results
      setSearchResults(prev => prev.map(u => 
        u.uid === targetUserId ? { ...u, status: "requested" as const } : u
      ));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setSendingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Search Friends Section - Only for own profile */}
      {isOwnProfile && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search users by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-300">Search Results</h3>
              {searchResults.map((result) => (
                <div
                  key={result.uid}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-black">
                    {result.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.username || "Unknown"}</div>
                    <div className="text-xs text-neutral-400 truncate">{result.email}</div>
                  </div>
                  {result.status === "none" && (
                    <Button
                      onClick={() => handleSendRequest(result.uid)}
                      disabled={sendingRequest === result.uid}
                      size="sm"
                      className="bg-emerald-400 text-black hover:bg-emerald-300"
                    >
                      {sendingRequest === result.uid ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Friend
                        </>
                      )}
                    </Button>
                  )}
                  {result.status === "requested" && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Check className="h-4 w-4" />
                      Request Sent
                    </div>
                  )}
                  {result.status === "pending" && (
                    <div className="text-sm text-neutral-400">Request Pending</div>
                  )}
                  {result.status === "friends" && (
                    <div className="text-sm text-emerald-400">Friends</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searching && searchQuery.length >= 2 && (
            <div className="text-center py-4 text-sm text-neutral-400">Searching...</div>
          )}
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-300">
          {isOwnProfile ? "Your Friends" : "Friends"} ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-400">No friends yet.</p>
            <p className="text-sm text-neutral-500 mt-2">
              {isOwnProfile ? "Search above to add friends." : "This user has no friends yet."}
            </p>
          </div>
        ) : (
          friends.map((friend) => (
            <FriendCard
              key={friend.userId}
              friend={friend}
              onRemove={isOwnProfile ? loadFriends : undefined}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

