"use client";

import * as React from "react";
import Link from "next/link";
import { User, UserMinus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/firebase/auth-context";
import { motion } from "framer-motion";

interface FriendCardProps {
  friend: {
    userId: string;
    username: string;
    photoURL?: string | null;
    email: string;
    friendsSince: number;
  };
  onRemove?: () => void;
}

export default function FriendCard({ friend, onRemove }: FriendCardProps) {
  const { user } = useAuth();
  const [removing, setRemoving] = React.useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || removing) return;

    if (!confirm(`Are you sure you want to remove ${friend.username} as a friend?`)) {
      return;
    }

    setRemoving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/friends/remove", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: friend.userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove friend");
      }

      toast.success("Friend removed");
      onRemove?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setRemoving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors"
    >
      <Link href={`/profile?userId=${friend.userId}`} className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {friend.photoURL ? (
            <img
              src={friend.photoURL}
              alt={friend.username}
              className="w-16 h-16 rounded-lg object-cover border-2 border-emerald-400/30"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.parentElement?.querySelector(".fallback-avatar") as HTMLElement;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className={`fallback-avatar w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl font-bold text-black border-2 border-emerald-400/30 ${friend.photoURL ? "hidden" : "flex"}`}
          >
            {friend.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{friend.username}</h3>
          <p className="text-sm text-neutral-400 truncate">{friend.email}</p>
          <p className="text-xs text-neutral-500 mt-1">
            Friends since {formatDate(friend.friendsSince)}
          </p>
        </div>

        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-2 rounded-lg bg-red-400/20 hover:bg-red-400/30 text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Remove friend"
        >
          {removing ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <UserMinus className="h-4 w-4" />
          )}
        </button>
      </Link>
    </motion.div>
  );
}




