import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let initError: Error | null = null;

try {
  if (getApps().length === 0) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      initError = new Error("Firebase Admin environment variables are not set. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env.local file.");
      console.error(initError.message);
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      auth = getAuth();
      db = getFirestore();
    }
  } else {
    auth = getAuth();
    db = getFirestore();
  }
} catch (error) {
  initError = error instanceof Error ? error : new Error(String(error));
  console.error("Firebase Admin initialization error:", initError);
}

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
    // Verify Firebase Admin is initialized
    if (initError || !auth || !db) {
      const errorMsg = initError 
        ? initError.message 
        : "Firebase Admin not initialized. Please check server logs.";
      console.error("Firebase Admin initialization issue:", errorMsg);
      return NextResponse.json({ 
        error: `Server configuration error: ${errorMsg}`,
        hint: "Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in your .env.local file"
      }, { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({ error: "Invalid request body" }, { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "Invalid targetUserId" }, { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (uid === targetUserId) {
      return NextResponse.json({ error: "Cannot send friend request to yourself" }, { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      // Check if already friends
      const friendDocId = [uid, targetUserId].sort().join("_");
      const friendRef = db.collection("friends").doc(friendDocId);
      const friendDoc = await friendRef.get();

      if (friendDoc.exists && friendDoc.data()?.status === "accepted") {
        return NextResponse.json({ error: "Already friends" }, { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Check if request already exists
      const requestId = `${uid}_${targetUserId}`;
      const requestRef = db.collection("friendRequests").doc(requestId);
      const requestDoc = await requestRef.get();

      if (requestDoc.exists && requestDoc.data()?.status === "pending") {
        return NextResponse.json({ error: "Friend request already sent" }, { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get requester profile
      const requesterProfile = await db.collection("users").doc(uid).get();
      if (!requesterProfile.exists) {
        return NextResponse.json({ error: "User profile not found" }, { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Verify target user exists
      const targetUserProfile = await db.collection("users").doc(targetUserId).get();
      if (!targetUserProfile.exists) {
        return NextResponse.json({ error: "Target user not found" }, { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Create friend request
      await requestRef.set({
        requesterId: uid,
        receiverId: targetUserId,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });

      // Create/update friendship document with pending status
      await friendRef.set({
        user1: uid < targetUserId ? uid : targetUserId,
        user2: uid < targetUserId ? targetUserId : uid,
        status: "pending",
        requestedBy: uid,
        createdAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true }, {
        headers: { "Content-Type": "application/json" }
      });
    } catch (firestoreError) {
      console.error("Firestore operation error:", firestoreError);
      const errorMessage = firestoreError instanceof Error ? firestoreError.message : "Database operation failed";
      return NextResponse.json({ 
        error: `Database error: ${errorMessage}` 
      }, { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error: unknown) {
    console.error("Friend request error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    
    return NextResponse.json({ 
      error: message,
      details: process.env.NODE_ENV === "development" ? errorStack : undefined
    }, { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

