import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

interface Friend {
  userId: string;
  username: string;
  photoURL: string | null;
  email: string;
  friendsSince: number;
}

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

// Verify Firebase ID token
async function verifyToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendsRef = db.collection("friends");
    const q1 = friendsRef
      .where("user1", "==", uid)
      .where("status", "==", "accepted");
    const q2 = friendsRef
      .where("user2", "==", uid)
      .where("status", "==", "accepted");

    const [snapshot1, snapshot2] = await Promise.all([
      q1.get(),
      q2.get(),
    ]);

    const friends: Friend[] = [];

    // Process user1 matches (user is user1)
    for (const docSnap of snapshot1.docs) {
      const data = docSnap.data();
      const friendId = data.user2;
      const friendProfile = await db.collection("users").doc(friendId).get();

      if (friendProfile.exists) {
        const profileData = friendProfile.data();
        friends.push({
          userId: friendId,
          username: profileData?.username || "Unknown",
          photoURL: profileData?.photoURL || null,
          email: profileData?.email || "",
          friendsSince: data.acceptedAt?.toMillis?.() || data.acceptedAt || data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        });
      }
    }

    // Process user2 matches (user is user2)
    for (const docSnap of snapshot2.docs) {
      const data = docSnap.data();
      const friendId = data.user1;
      const friendProfile = await db.collection("users").doc(friendId).get();

      if (friendProfile.exists) {
        const profileData = friendProfile.data();
        friends.push({
          userId: friendId,
          username: profileData?.username || "Unknown",
          photoURL: profileData?.photoURL || null,
          email: profileData?.email || "",
          friendsSince: data.acceptedAt?.toMillis?.() || data.acceptedAt || data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        });
      }
    }

    // Sort by friendsSince (newest first)
    friends.sort((a, b) => b.friendsSince - a.friendsSince);

    return NextResponse.json({ friends });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message, friends: [] }, { status: 500 });
  }
}

