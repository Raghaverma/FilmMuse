import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function verifyToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const { getAuth } = await import("firebase-admin/auth");
    const auth = getAuth();
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
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "Invalid targetUserId" }, { status: 400 });
    }

    if (uid === targetUserId) {
      return NextResponse.json({ error: "Cannot send friend request to yourself" }, { status: 400 });
    }

    // Check if already friends
    const friendDocId = [uid, targetUserId].sort().join("_");
    const friendRef = adminDb.collection("friends").doc(friendDocId);
    const friendDoc = await friendRef.get();

    if (friendDoc.exists && friendDoc.data()?.status === "accepted") {
      return NextResponse.json({ error: "Already friends" }, { status: 400 });
    }

    // Check if request already exists
    const requestId = `${uid}_${targetUserId}`;
    const requestRef = adminDb.collection("friendRequests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (requestDoc.exists && requestDoc.data()?.status === "pending") {
      return NextResponse.json({ error: "Friend request already sent" }, { status: 400 });
    }

    // Create friend request
    await requestRef.set({
      requesterId: uid,
      receiverId: targetUserId,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    // Also create/update friendship document with pending status
    await friendRef.set({
      user1: uid < targetUserId ? uid : targetUserId,
      user2: uid < targetUserId ? targetUserId : uid,
      status: "pending",
      requestedBy: uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
