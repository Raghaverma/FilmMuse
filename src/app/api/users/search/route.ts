import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { validateRequest, userSearchSchema } from "@/lib/validation";

interface UserSearchResult {
  uid: string;
  username?: string;
  email?: string;
  photoURL?: string | null;
  [key: string]: unknown;
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

// GET /api/users/search - Search users
export async function GET(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = validateRequest(userSearchSchema, {
      q: searchParams.get("q") || "",
    });
    const query = params.q;

    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const queryLower = query.toLowerCase().trim();
    const usersSnapshot = await db.collection("users").get();
    const results: UserSearchResult[] = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as UserSearchResult;
      if (
        userData.username?.toLowerCase().includes(queryLower) ||
        userData.email?.toLowerCase().includes(queryLower)
      ) {
        results.push({
          ...userData,
          uid: doc.id,
        });
      }
    });

    return NextResponse.json({
      users: results.slice(0, 20), // Limit to 20 results
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

