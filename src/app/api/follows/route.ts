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

// POST /api/follows - Follow a user
export async function POST(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await request.json();
    if (!targetUserId || uid === targetUserId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const followId = `${uid}_${targetUserId}`;
    const followRef = db.collection("follows").doc(followId);
    const followDoc = await followRef.get();

    if (followDoc.exists() && !followDoc.data()?.deleted) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }

    await followRef.set({
      followerId: uid,
      followingId: targetUserId,
      createdAt: new Date(),
      deleted: false,
    });

    // Update stats
    const followerStatsRef = db.collection("userStats").doc(uid);
    const followerStats = await followerStatsRef.get();
    if (followerStats.exists()) {
      await followerStatsRef.update({
        followingCount: (followerStats.data()?.followingCount || 0) + 1,
      });
    } else {
      await followerStatsRef.set({ followingCount: 1, followersCount: 0 });
    }

    const targetStatsRef = db.collection("userStats").doc(targetUserId);
    const targetStats = await targetStatsRef.get();
    if (targetStats.exists()) {
      await targetStatsRef.update({
        followersCount: (targetStats.data()?.followersCount || 0) + 1,
      });
    } else {
      await targetStatsRef.set({ followingCount: 0, followersCount: 1 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/follows - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }

    const followId = `${uid}_${targetUserId}`;
    const followRef = db.collection("follows").doc(followId);
    const followDoc = await followRef.get();

    if (!followDoc.exists() || followDoc.data()?.deleted) {
      return NextResponse.json({ error: "Not following" }, { status: 400 });
    }

    await followRef.update({
      deleted: true,
      deletedAt: new Date(),
    });

    // Update stats
    const followerStatsRef = db.collection("userStats").doc(uid);
    const followerStats = await followerStatsRef.get();
    if (followerStats.exists()) {
      await followerStatsRef.update({
        followingCount: Math.max(0, (followerStats.data()?.followingCount || 0) - 1),
      });
    }

    const targetStatsRef = db.collection("userStats").doc(targetUserId);
    const targetStats = await targetStatsRef.get();
    if (targetStats.exists()) {
      await targetStatsRef.update({
        followersCount: Math.max(0, (targetStats.data()?.followersCount || 0) - 1),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/follows - Get followers/following
export async function GET(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || uid;
    const type = searchParams.get("type") || "followers"; // "followers" or "following"

    let userIds: string[] = [];
    if (type === "followers") {
      const snapshot = await db
        .collection("follows")
        .where("followingId", "==", userId)
        .where("deleted", "==", false)
        .get();
      userIds = snapshot.docs.map((doc) => doc.data().followerId);
    } else {
      const snapshot = await db
        .collection("follows")
        .where("followerId", "==", userId)
        .where("deleted", "==", false)
        .get();
      userIds = snapshot.docs.map((doc) => doc.data().followingId);
    }

    // Get user profiles
    const users = await Promise.all(
      userIds.map(async (id) => {
        const userDoc = await db.collection("users").doc(id).get();
        if (userDoc.exists()) {
          return { uid: id, ...userDoc.data() };
        }
        return null;
      })
    );

    return NextResponse.json({
      users: users.filter((u) => u !== null),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

