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

export async function GET(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    if (uid === targetUserId) {
      return NextResponse.json({ status: "none" });
    }

    // Check friendship
    const friendDocId = [uid, targetUserId].sort().join("_");
    const friendRef = db.collection("friends").doc(friendDocId);
    const friendDoc = await friendRef.get();

    if (friendDoc.exists) {
      const data = friendDoc.data();
      if (data?.status === "accepted") {
        return NextResponse.json({ status: "friends" });
      } else if (data?.status === "pending") {
        // Check who requested
        if (data.requestedBy === uid) {
          return NextResponse.json({ status: "requested" });
        } else {
          return NextResponse.json({ status: "pending" });
        }
      }
    }

    // Check if request exists
    const requestId1 = `${uid}_${targetUserId}`;
    const requestId2 = `${targetUserId}_${uid}`;

    const [req1, req2] = await Promise.all([
      db.collection("friendRequests").doc(requestId1).get(),
      db.collection("friendRequests").doc(requestId2).get(),
    ]);

    if (req1.exists && req1.data()?.status === "pending") {
      return NextResponse.json({ status: "requested" });
    }
    if (req2.exists && req2.data()?.status === "pending") {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({ status: "none" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message, status: "none" }, { status: 500 });
  }
}

