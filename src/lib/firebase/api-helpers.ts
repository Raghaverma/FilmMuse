"use client";

import { auth } from "./config";
import { followUser, unfollowUser, isFollowing, getFollowers, getFollowing, getUserStats, searchUsers } from "./follows";
import { shareListWithUser, unshareListWithUser, getSharedLists } from "./firestore";

// Get current user's ID token for API calls
async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

// Client-side API helpers that use Firebase SDK directly
export const apiHelpers = {
  // Follow operations (using client SDK)
  follow: followUser,
  unfollow: unfollowUser,
  checkFollowing: isFollowing,
  getFollowers,
  getFollowing,
  getUserStats,
  searchUsers,

  // List sharing operations (using client SDK)
  shareList: shareListWithUser,
  unshareList: unshareListWithUser,
  getSharedLists,
};

// For server-side API routes, we'll need Firebase Admin SDK
// These are placeholders that can be used if you set up Firebase Admin
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getIdToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

