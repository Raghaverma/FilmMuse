"use client";

import * as React from "react";
import { UserPlus, Check, Clock, UserMinus } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiCall } from "@/lib/firebase/api-helpers";
import { useAuth } from "@/lib/firebase/auth-context";

interface FriendRequestButtonProps {
  targetUserId: string;
  className?: string;
  onStatusChange?: () => void;
}

type FriendshipStatus = "none" | "pending" | "friends" | "requested";

export default function FriendRequestButton({ 
  targetUserId, 
  className = "",
  onStatusChange 
}: FriendRequestButtonProps) {
  const { user } = useAuth();
  const [status, setStatus] = React.useState<FriendshipStatus>("none");
  const [loading, setLoading] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    if (!user || user.uid === targetUserId) {
      setChecking(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/friends/status?targetUserId=${targetUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data.status || "none");
        }
      } catch (error) {
        console.error("Failed to check friendship status:", error);
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, [user, targetUserId]);

  const handleClick = async () => {
    if (!user || loading || checking) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();

      if (status === "none" || status === "requested") {
        // Send friend request
        const response = await fetch("/api/friends/request", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetUserId }),
        });

        if (!response.ok) {
          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            throw new Error(error.error || "Failed to send friend request");
          } else {
            // Response is not JSON (likely HTML error page)
            const text = await response.text();
            console.error("Non-JSON response:", text.substring(0, 200));
            throw new Error(`Failed to send friend request: ${response.status} ${response.statusText}`);
          }
        }

        setStatus("requested");
        toast.success("Friend request sent");
      } else if (status === "friends") {
        // Remove friend
        const response = await fetch("/api/friends/remove", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friendId: targetUserId }),
        });

        if (!response.ok) {
          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            throw new Error(error.error || "Failed to remove friend");
          } else {
            // Response is not JSON (likely HTML error page)
            const text = await response.text();
            console.error("Non-JSON response:", text.substring(0, 200));
            throw new Error(`Failed to remove friend: ${response.status} ${response.statusText}`);
          }
        }

        setStatus("none");
        toast.success("Friend removed");
      }

      onStatusChange?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className={`px-4 py-2 rounded-lg bg-white/5 text-neutral-400 text-sm transition-colors ${className}`}
      >
        Loading...
      </button>
    );
  }

  if (!user || user.uid === targetUserId) {
    return null;
  }

  const getButtonContent = () => {
    switch (status) {
      case "friends":
        return (
          <>
            <Check className="h-4 w-4 mr-2" />
            Friends
          </>
        );
      case "requested":
        return (
          <>
            <Clock className="h-4 w-4 mr-2" />
            Request Sent
          </>
        );
      case "pending":
        return (
          <>
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </>
        );
      default:
        return (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </>
        );
    }
  };

  const getButtonStyles = () => {
    switch (status) {
      case "friends":
        return "bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300";
      case "requested":
      case "pending":
        return "bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300";
      default:
        return "bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300";
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || status === "pending"}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()} ${className}`}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {status === "friends" ? "Removing..." : "Sending..."}
        </>
      ) : (
        getButtonContent()
      )}
    </button>
  );
}

