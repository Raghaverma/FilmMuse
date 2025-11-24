import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

interface FriendRequest {
  id: string;
  requesterId: string;
  requesterUsername: string;
  requesterPhotoURL: string | null;
  receiverId: string;
  status: string;
  createdAt: number;
  respondedAt?: number;
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

    const requestsRef = db.collection("friendRequests");
    const q = requestsRef
      .where("receiverId", "==", uid)
      .where("status", "==", "pending");

    const snapshot = await q.get();
    const requests: FriendRequest[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Get requester profile
      const requesterProfile = await db.collection("users").doc(data.requesterId).get();
      
      if (requesterProfile.exists) {
        const profileData = requesterProfile.data();
        requests.push({
          id: docSnap.id,
          requesterId: data.requesterId,
          requesterUsername: profileData?.username || "Unknown",
          requesterPhotoURL: profileData?.photoURL || null,
          receiverId: data.receiverId,
          status: data.status,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          respondedAt: data.respondedAt?.toMillis?.() || data.respondedAt,
        });
      }
    }

    // Sort by creation date (newest first)
    requests.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ requests });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message, requests: [] }, { status: 500 });
  }
}

