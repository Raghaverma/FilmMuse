"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type DocumentReference,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { auth } from "./config";
import { getUserProfile } from "./auth";

export type FriendRequestStatus = "pending" | "accepted" | "rejected";
export type FriendshipStatus = "none" | "pending" | "friends" | "requested";

export interface FriendRequest {
  id: string;
  requesterId: string;
  requesterUsername: string;
  requesterPhotoURL?: string | null;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: number;
  respondedAt?: number;
}

export interface Friend {
  userId: string;
  username: string;
  photoURL?: string | null;
  email: string;
  friendsSince: number;
}

// Helper to create sorted friend document ID
function createFriendDocId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join("_");
}

// Send a friend request
export async function sendFriendRequest(targetUserId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  if (user.uid === targetUserId) throw new Error("Cannot send friend request to yourself");

  // Check if already friends
  const friendDocId = createFriendDocId(user.uid, targetUserId);
  const friendRef = doc(db, "friends", friendDocId);
  const friendDoc = await getDoc(friendRef);

  if (friendDoc.exists() && friendDoc.data()?.status === "accepted") {
    throw new Error("Already friends");
  }

  // Check if request already exists
  const requestId = `${user.uid}_${targetUserId}`;
  const requestRef = doc(db, "friendRequests", requestId);
  const requestDoc = await getDoc(requestRef);

  if (requestDoc.exists() && requestDoc.data()?.status === "pending") {
    throw new Error("Friend request already sent");
  }

  // Get requester profile
  const requesterProfile = await getUserProfile(user.uid);
  if (!requesterProfile) throw new Error("User profile not found");

  // Create friend request
  await setDoc(requestRef, {
    requesterId: user.uid,
    receiverId: targetUserId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  // Also create/update friendship document with pending status
  await setDoc(friendRef, {
    user1: user.uid < targetUserId ? user.uid : targetUserId,
    user2: user.uid < targetUserId ? targetUserId : user.uid,
    status: "pending",
    requestedBy: user.uid,
    createdAt: serverTimestamp(),
  });
}

// Accept a friend request
export async function acceptFriendRequest(requesterId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const requestId = `${requesterId}_${user.uid}`;
  const requestRef = doc(db, "friendRequests", requestId);
  const requestDoc = await getDoc(requestRef);

  if (!requestDoc.exists()) {
    throw new Error("Friend request not found");
  }

  const requestData = requestDoc.data();
  if (requestData.status !== "pending") {
    throw new Error("Friend request already processed");
  }

  // Update request status
  await updateDoc(requestRef, {
    status: "accepted",
    respondedAt: serverTimestamp(),
  });

  // Create mutual friendship
  const friendDocId = createFriendDocId(user.uid, requesterId);
  const friendRef = doc(db, "friends", friendDocId);

  await setDoc(friendRef, {
    user1: user.uid < requesterId ? user.uid : requesterId,
    user2: user.uid < requesterId ? requesterId : user.uid,
    status: "accepted",
    requestedBy: requesterId,
    createdAt: requestData.createdAt,
    acceptedAt: serverTimestamp(),
  });

  // Update friend counts
  await updateFriendCounts(user.uid, requesterId, 1);
}

// Reject a friend request
export async function rejectFriendRequest(requesterId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const requestId = `${requesterId}_${user.uid}`;
  const requestRef = doc(db, "friendRequests", requestId);
  const requestDoc = await getDoc(requestRef);

  if (!requestDoc.exists()) {
    throw new Error("Friend request not found");
  }

  const requestData = requestDoc.data();
  if (requestData.status !== "pending") {
    throw new Error("Friend request already processed");
  }

  // Update request status
  await updateDoc(requestRef, {
    status: "rejected",
    respondedAt: serverTimestamp(),
  });

  // Remove pending friendship document
  const friendDocId = createFriendDocId(user.uid, requesterId);
  const friendRef = doc(db, "friends", friendDocId);
  const friendDoc = await getDoc(friendRef);

  if (friendDoc.exists() && friendDoc.data()?.status === "pending") {
    await deleteDoc(friendRef);
  }
}

// Remove a friend (unfriend)
export async function removeFriend(friendId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  if (user.uid === friendId) throw new Error("Cannot unfriend yourself");

  const friendDocId = createFriendDocId(user.uid, friendId);
  const friendRef = doc(db, "friends", friendDocId);
  const friendDoc = await getDoc(friendRef);

  if (!friendDoc.exists() || friendDoc.data()?.status !== "accepted") {
    throw new Error("Friendship not found");
  }

  // Delete friendship
  await deleteDoc(friendRef);

  // Delete friend requests in both directions
  const request1Ref = doc(db, "friendRequests", `${user.uid}_${friendId}`);
  const request2Ref = doc(db, "friendRequests", `${friendId}_${user.uid}`);

  const [req1, req2] = await Promise.all([
    getDoc(request1Ref),
    getDoc(request2Ref),
  ]);

  if (req1.exists()) await deleteDoc(request1Ref);
  if (req2.exists()) await deleteDoc(request2Ref);

  // Update friend counts
  await updateFriendCounts(user.uid, friendId, -1);
}

// Get pending friend requests (received)
export async function getFriendRequests(): Promise<FriendRequest[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const requestsRef = collection(db, "friendRequests");
  const q = query(
    requestsRef,
    where("receiverId", "==", user.uid),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);
  const requests: FriendRequest[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const requesterProfile = await getUserProfile(data.requesterId);

    if (requesterProfile) {
      requests.push({
        id: docSnap.id,
        requesterId: data.requesterId,
        requesterUsername: requesterProfile.username,
        requesterPhotoURL: requesterProfile.photoURL,
        receiverId: data.receiverId,
        status: data.status,
        createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        respondedAt: data.respondedAt?.toMillis?.() || data.respondedAt,
      });
    }
  }

  return requests.sort((a, b) => b.createdAt - a.createdAt);
}

// Get all friends
export async function getFriends(): Promise<Friend[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const friendsRef = collection(db, "friends");
  const q1 = query(
    friendsRef,
    where("user1", "==", user.uid),
    where("status", "==", "accepted")
  );
  const q2 = query(
    friendsRef,
    where("user2", "==", user.uid),
    where("status", "==", "accepted")
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  const friends: Friend[] = [];

  // Process user1 matches (user is user1)
  for (const docSnap of snapshot1.docs) {
    const data = docSnap.data();
    const friendId = data.user2;
    const friendProfile = await getUserProfile(friendId);

    if (friendProfile) {
      friends.push({
        userId: friendId,
        username: friendProfile.username,
        photoURL: friendProfile.photoURL,
        email: friendProfile.email,
        friendsSince: data.acceptedAt?.toMillis?.() || data.acceptedAt || data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
      });
    }
  }

  // Process user2 matches (user is user2)
  for (const docSnap of snapshot2.docs) {
    const data = docSnap.data();
    const friendId = data.user1;
    const friendProfile = await getUserProfile(friendId);

    if (friendProfile) {
      friends.push({
        userId: friendId,
        username: friendProfile.username,
        photoURL: friendProfile.photoURL,
        email: friendProfile.email,
        friendsSince: data.acceptedAt?.toMillis?.() || data.acceptedAt || data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
      });
    }
  }

  return friends.sort((a, b) => b.friendsSince - a.friendsSince);
}

// Get friendship status between current user and target user
export async function getFriendshipStatus(targetUserId: string): Promise<FriendshipStatus> {
  const user = auth.currentUser;
  if (!user) return "none";
  if (user.uid === targetUserId) return "none";

  // Check friendship
  const friendDocId = createFriendDocId(user.uid, targetUserId);
  const friendRef = doc(db, "friends", friendDocId);
  const friendDoc = await getDoc(friendRef);

  if (friendDoc.exists()) {
    const data = friendDoc.data();
    if (data.status === "accepted") {
      return "friends";
    } else if (data.status === "pending") {
      // Check who requested
      if (data.requestedBy === user.uid) {
        return "requested";
      } else {
        return "pending";
      }
    }
  }

  // Check if request exists
  const requestId1 = `${user.uid}_${targetUserId}`;
  const requestId2 = `${targetUserId}_${user.uid}`;

  const [req1, req2] = await Promise.all([
    getDoc(doc(db, "friendRequests", requestId1)),
    getDoc(doc(db, "friendRequests", requestId2)),
  ]);

  if (req1.exists() && req1.data()?.status === "pending") {
    return "requested";
  }
  if (req2.exists() && req2.data()?.status === "pending") {
    return "pending";
  }

  return "none";
}

// Get friend count for a user
export async function getFriendCount(userId: string): Promise<number> {
  const friendsRef = collection(db, "friends");
  const q1 = query(
    friendsRef,
    where("user1", "==", userId),
    where("status", "==", "accepted")
  );
  const q2 = query(
    friendsRef,
    where("user2", "==", userId),
    where("status", "==", "accepted")
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  return snapshot1.size + snapshot2.size;
}

// Helper function to update friend counts
async function updateFriendCounts(userId1: string, userId2: string, delta: number): Promise<void> {
  const statsRef1 = doc(db, "userStats", userId1);
  const statsRef2 = doc(db, "userStats", userId2);

  const [stats1, stats2] = await Promise.all([
    getDoc(statsRef1),
    getDoc(statsRef2),
  ]);

  const updateStats = async (ref: DocumentReference, docSnap: DocumentSnapshot) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentCount = (data?.friendsCount as number | undefined) || 0;
      await updateDoc(ref, {
        friendsCount: Math.max(0, currentCount + delta),
      });
    } else {
      await setDoc(ref, {
        friendsCount: Math.max(0, delta),
        followersCount: 0,
        followingCount: 0,
      });
    }
  };

  await Promise.all([
    updateStats(statsRef1, stats1),
    updateStats(statsRef2, stats2),
  ]);
}
