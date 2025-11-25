"use client";

import * as React from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Check, X, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface FriendRequest {
  id: string;
  requesterId: string;
  requesterUsername: string;
  requesterPhotoURL?: string | null;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
}

interface FriendRequestsListProps {
  onUpdate?: () => void;
}

export default function FriendRequestsList({ onUpdate }: FriendRequestsListProps) {
  const { user } = useAuth();
  const [requests, setRequests] = React.useState<FriendRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState<string | null>(null);

  const loadRequests = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/friends/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAccept = async (requestId: string, requesterId: string) => {
    if (!user || processing) return;

    setProcessing(requestId);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept friend request");
      }

      toast.success("Friend request accepted");
      loadRequests();
      onUpdate?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string, requesterId: string) => {
    if (!user || processing) return;

    setProcessing(requestId);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/friends/reject", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject friend request");
      }

      toast.success("Friend request rejected");
      loadRequests();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-400">No pending friend requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-lg border border-white/10 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {request.requesterPhotoURL ? (
                <img
                  src={request.requesterPhotoURL}
                  alt={request.requesterUsername}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-emerald-400/30"
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
                className={`fallback-avatar w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-lg font-bold text-black border-2 border-emerald-400/30 ${request.requesterPhotoURL ? "hidden" : "flex"}`}
              >
                {request.requesterUsername.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{request.requesterUsername}</h3>
              <p className="text-xs text-neutral-400 mt-1">
                {new Date(request.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleAccept(request.id, request.requesterId)}
                disabled={processing === request.id}
                className="p-2 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Accept"
              >
                {processing === request.id ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleReject(request.id, request.requesterId)}
                disabled={processing === request.id}
                className="p-2 rounded-lg bg-red-400/20 hover:bg-red-400/30 text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reject"
              >
                {processing === request.id ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}





