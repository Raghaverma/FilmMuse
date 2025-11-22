import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

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

export async function POST(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId || typeof friendId !== "string") {
      return NextResponse.json({ error: "Invalid friendId" }, { status: 400 });
    }

    if (uid === friendId) {
      return NextResponse.json({ error: "Cannot unfriend yourself" }, { status: 400 });
    }

    const friendDocId = [uid, friendId].sort().join("_");
    const friendRef = db.collection("friends").doc(friendDocId);
    const friendDoc = await friendRef.get();

    if (!friendDoc.exists || friendDoc.data()?.status !== "accepted") {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    // Delete friendship
    await friendRef.delete();

    // Delete friend requests in both directions
    const request1Ref = db.collection("friendRequests").doc(`${uid}_${friendId}`);
    const request2Ref = db.collection("friendRequests").doc(`${friendId}_${uid}`);

    const [req1, req2] = await Promise.all([
      request1Ref.get(),
      request2Ref.get(),
    ]);

    if (req1.exists) await request1Ref.delete();
    if (req2.exists) await request2Ref.delete();

    // Update friend counts
    await updateFriendCounts(uid, friendId, -1);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function updateFriendCounts(userId1: string, userId2: string, delta: number): Promise<void> {
  const statsRef1 = db.collection("userStats").doc(userId1);
  const statsRef2 = db.collection("userStats").doc(userId2);

  const [stats1, stats2] = await Promise.all([
    statsRef1.get(),
    statsRef2.get(),
  ]);

  const updateStats = async (ref: any, doc: any) => {
    if (doc.exists) {
      const currentCount = doc.data()?.friendsCount || 0;
      await ref.update({
        friendsCount: Math.max(0, currentCount + delta),
      });
    } else {
      await ref.set({
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

