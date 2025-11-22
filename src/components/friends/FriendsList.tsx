"use client";

import * as React from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import FriendCard from "./FriendCard";
import { Users } from "lucide-react";

interface FriendsListProps {
  onUpdate?: () => void;
}

export default function FriendsList({ onUpdate }: FriendsListProps) {
  const { user } = useAuth();
  const [friends, setFriends] = React.useState<Array<{
    userId: string;
    username: string;
    photoURL?: string | null;
    email: string;
    friendsSince: number;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  const loadFriends = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
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
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  React.useEffect(() => {
    if (onUpdate) {
      // Reload when onUpdate is called
      loadFriends();
    }
  }, [onUpdate, loadFriends]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-400">No friends yet.</p>
        <p className="text-sm text-neutral-500 mt-2">Add friends to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <FriendCard
          key={friend.userId}
          friend={friend}
          onRemove={loadFriends}
        />
      ))}
    </div>
  );
}

