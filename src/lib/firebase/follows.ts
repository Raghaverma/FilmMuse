"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { auth } from "./config";

export interface FollowRelationship {
  followerId: string;
  followingId: string;
  createdAt: Timestamp | number;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
}

// Follow a user
export async function followUser(targetUserId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  if (user.uid === targetUserId) throw new Error("Cannot follow yourself");

  const followId = `${user.uid}_${targetUserId}`;
  const followRef = doc(db, "follows", followId);

  // Check if already following
  const followDoc = await getDoc(followRef);
  if (followDoc.exists()) {
    throw new Error("Already following this user");
  }

  // Create follow relationship
  await setDoc(followRef, {
    followerId: user.uid,
    followingId: targetUserId,
    createdAt: serverTimestamp(),
  });

  // Update follower's following count
  const followerStatsRef = doc(db, "userStats", user.uid);
  const followerStatsDoc = await getDoc(followerStatsRef);
  if (followerStatsDoc.exists()) {
    await updateDoc(followerStatsRef, {
      followingCount: increment(1),
    });
  } else {
    await setDoc(followerStatsRef, {
      followingCount: 1,
      followersCount: 0,
    });
  }

  // Update target user's followers count
  const targetStatsRef = doc(db, "userStats", targetUserId);
  const targetStatsDoc = await getDoc(targetStatsRef);
  if (targetStatsDoc.exists()) {
    await updateDoc(targetStatsRef, {
      followersCount: increment(1),
    });
  } else {
    await setDoc(targetStatsRef, {
      followingCount: 0,
      followersCount: 1,
    });
  }
}

// Unfollow a user
export async function unfollowUser(targetUserId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const followId = `${user.uid}_${targetUserId}`;
  const followRef = doc(db, "follows", followId);

  // Check if following
  const followDoc = await getDoc(followRef);
  if (!followDoc.exists()) {
    throw new Error("Not following this user");
  }

  // Delete follow relationship
  await updateDoc(followRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
  });

  // Update follower's following count
  const followerStatsRef = doc(db, "userStats", user.uid);
  const followerStatsDoc = await getDoc(followerStatsRef);
  if (followerStatsDoc.exists()) {
    await updateDoc(followerStatsRef, {
      followingCount: increment(-1),
    });
  }

  // Update target user's followers count
  const targetStatsRef = doc(db, "userStats", targetUserId);
  const targetStatsDoc = await getDoc(targetStatsRef);
  if (targetStatsDoc.exists()) {
    await updateDoc(targetStatsRef, {
      followersCount: increment(-1),
    });
  }
}

// Check if current user is following a target user
export async function isFollowing(targetUserId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const followId = `${user.uid}_${targetUserId}`;
  const followDoc = await getDoc(doc(db, "follows", followId));
  return followDoc.exists() && !followDoc.data()?.deleted;
}

// Get followers of a user
export async function getFollowers(userId: string): Promise<string[]> {
  const q = query(
    collection(db, "follows"),
    where("followingId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const followers: string[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.deleted) {
      followers.push(data.followerId);
    }
  });
  return followers;
}

// Get users that a user is following
export async function getFollowing(userId: string): Promise<string[]> {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const following: string[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.deleted) {
      following.push(data.followingId);
    }
  });
  return following;
}

// Get user stats (followers/following counts)
export async function getUserStats(userId: string): Promise<UserStats> {
  const statsDoc = await getDoc(doc(db, "userStats", userId));
  if (statsDoc.exists()) {
    const data = statsDoc.data();
    return {
      followersCount: data.followersCount || 0,
      followingCount: data.followingCount || 0,
    };
  }
  return { followersCount: 0, followingCount: 0 };
}

interface UserSearchResult {
  uid: string;
  username?: string;
  email?: string;
  photoURL?: string | null;
  [key: string]: unknown;
}

// Search users by username
export async function searchUsers(searchQuery: string): Promise<UserSearchResult[]> {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const queryLower = searchQuery.toLowerCase().trim();
  const results: UserSearchResult[] = [];

  usersSnapshot.forEach((doc) => {
    const userData = doc.data() as UserSearchResult;
    if (
      userData.username?.toLowerCase().includes(queryLower) ||
      userData.email?.toLowerCase().includes(queryLower)
    ) {
      results.push({
        uid: doc.id,
        ...userData,
      });
    }
  });

  return results.slice(0, 20); // Limit to 20 results
}

