"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser, isFollowing } from "@/lib/firebase/follows";
import { useAuth } from "@/lib/firebase/auth-context";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export default function FollowButton({ targetUserId, className }: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    if (!user || user.uid === targetUserId) {
      setChecking(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const status = await isFollowing(targetUserId);
        setFollowing(status);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setChecking(false);
      }
    };

    checkFollowStatus();
  }, [user, targetUserId]);

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please log in to follow users");
      return;
    }

    if (user.uid === targetUserId) {
      return;
    }

    setLoading(true);
    try {
      if (following) {
        await unfollowUser(targetUserId);
        setFollowing(false);
        toast.success("Unfollowed");
      } else {
        await followUser(targetUserId);
        setFollowing(true);
        toast.success("Following");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update follow status";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.uid === targetUserId) {
    return null;
  }

  if (checking) {
    return (
      <Button disabled className={className} size="sm">
        Loading...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      className={className}
      size="sm"
      variant={following ? "secondary" : "default"}
    >
      {following ? (
        <>
          <UserCheck className="h-4 w-4 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
}

