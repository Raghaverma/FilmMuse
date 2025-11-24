import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, DocumentReference, DocumentSnapshot } from "firebase-admin/firestore";
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
    const { requesterId } = body;

    if (!requesterId || typeof requesterId !== "string") {
      return NextResponse.json({ error: "Invalid requesterId" }, { status: 400 });
    }

    const requestId = `${requesterId}_${uid}`;
    const requestRef = db.collection("friendRequests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
    }

    const requestData = requestDoc.data();
    if (requestData?.status !== "pending") {
      return NextResponse.json({ error: "Friend request already processed" }, { status: 400 });
    }

    // Update request status
    await requestRef.update({
      status: "accepted",
      respondedAt: FieldValue.serverTimestamp(),
    });

    // Create mutual friendship
    const friendDocId = [uid, requesterId].sort().join("_");
    const friendRef = db.collection("friends").doc(friendDocId);

    await friendRef.set({
      user1: uid < requesterId ? uid : requesterId,
      user2: uid < requesterId ? requesterId : uid,
      status: "accepted",
      requestedBy: requesterId,
      createdAt: requestData.createdAt,
      acceptedAt: FieldValue.serverTimestamp(),
    });

    // Update friend counts
    await updateFriendCounts(uid, requesterId, 1);

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

  const updateStats = async (ref: DocumentReference, doc: DocumentSnapshot) => {
    if (doc.exists) {
      const data = doc.data();
      const currentCount = (data?.friendsCount as number | undefined) || 0;
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

