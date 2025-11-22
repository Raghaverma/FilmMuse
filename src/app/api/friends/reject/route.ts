import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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
      status: "rejected",
      respondedAt: FieldValue.serverTimestamp(),
    });

    // Remove pending friendship document
    const friendDocId = [uid, requesterId].sort().join("_");
    const friendRef = db.collection("friends").doc(friendDocId);
    const friendDoc = await friendRef.get();

    if (friendDoc.exists && friendDoc.data()?.status === "pending") {
      await friendRef.delete();
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

