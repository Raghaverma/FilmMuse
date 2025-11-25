"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserSearch from "./UserSearch";
import { shareListWithUser, unshareListWithUser, updateCustomList } from "@/lib/firebase/firestore";
import { searchUsers } from "@/lib/firebase/follows";
import { Share2, X, Globe, Lock } from "lucide-react";
import { toast } from "react-hot-toast";

interface SharedUser {
  uid: string;
  username?: string;
  email?: string;
  photoURL?: string | null;
}

interface ShareListDialogProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
  currentSharedWith: string[];
  isPublic: boolean;
  onUpdate: () => void;
}

export default function ShareListDialog({
  open,
  onClose,
  listId,
  listName,
  currentSharedWith,
  isPublic,
  onUpdate,
}: ShareListDialogProps) {
  const [sharedUsers, setSharedUsers] = React.useState<SharedUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [updatingPublic, setUpdatingPublic] = React.useState(false);

  const loadSharedUsers = React.useCallback(async () => {
    try {
      const users = await Promise.all(
        currentSharedWith.map(async (uid) => {
          const results = await searchUsers(uid);
          return results.find((u) => u.uid === uid) || { uid, username: uid, email: "" };
        })
      );
      setSharedUsers(users.filter((u): u is SharedUser => Boolean(u)));
    } catch (error) {
      console.error("Error loading shared users:", error);
    }
  }, [currentSharedWith]);

  React.useEffect(() => {
    if (open && currentSharedWith.length > 0) {
      loadSharedUsers();
    } else {
      setSharedUsers([]);
    }
  }, [open, currentSharedWith, loadSharedUsers]);

  const handleShareWithUser = async (userId: string) => {
    if (currentSharedWith.includes(userId)) {
      toast.error("User already has access");
      return;
    }

    setLoading(true);
    try {
      await shareListWithUser(listId, userId);
      toast.success("List shared");
      onUpdate();
      loadSharedUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to share list";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (userId: string) => {
    setLoading(true);
    try {
      await unshareListWithUser(listId, userId);
      toast.success("Access removed");
      onUpdate();
      setSharedUsers(sharedUsers.filter((u) => u.uid !== userId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove access";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    setUpdatingPublic(true);
    try {
      await updateCustomList(listId, { isPublic: !isPublic });
      toast.success(isPublic ? "List is now private" : "List is now public");
      onUpdate();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update list";
      toast.error(message);
    } finally {
      setUpdatingPublic(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share &quot;{listName}&quot;
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="h-4 w-4 text-emerald-400" />
              ) : (
                <Lock className="h-4 w-4 text-neutral-400" />
              )}
              <span className="text-sm">
                {isPublic ? "Public" : "Private"}
              </span>
            </div>
            <Button
              onClick={handleTogglePublic}
              disabled={updatingPublic}
              size="sm"
              variant="secondary"
            >
              {isPublic ? "Make Private" : "Make Public"}
            </Button>
          </div>

          {/* Share with specific users */}
          <div>
            <label className="mb-2 block text-sm text-neutral-300">Share with users</label>
            <UserSearch onUserSelect={handleShareWithUser} />
          </div>

          {/* Shared users list */}
          {sharedUsers.length > 0 && (
            <div>
              <label className="mb-2 block text-sm text-neutral-300">Shared with</label>
              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center justify-between p-2 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs text-emerald-400">
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.username}</div>
                        <div className="text-xs text-neutral-400">{user.email}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUnshare(user.uid)}
                      disabled={loading}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

