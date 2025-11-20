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

// POST /api/lists/share - Share list with user or make public
export async function POST(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId, targetUserId, isPublic } = await request.json();
    if (!listId) {
      return NextResponse.json({ error: "Missing listId" }, { status: 400 });
    }

    const userDataDoc = await db.collection("userData").doc(uid).get();
    if (!userDataDoc.exists()) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    const userData = userDataDoc.data();
    const list = userData?.customLists?.[listId];

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (list.ownerId !== uid) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Update list
    if (isPublic !== undefined) {
      list.isPublic = isPublic;
    }
    if (targetUserId && !list.sharedWith.includes(targetUserId)) {
      list.sharedWith.push(targetUserId);
    }
    list.updatedAt = new Date();

    await db.collection("userData").doc(uid).update({
      [`customLists.${listId}`]: list,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/lists/share - Unshare list with user
export async function DELETE(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");
    const targetUserId = searchParams.get("targetUserId");

    if (!listId || !targetUserId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const userDataDoc = await db.collection("userData").doc(uid).get();
    if (!userDataDoc.exists()) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    const userData = userDataDoc.data();
    const list = userData?.customLists?.[listId];

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (list.ownerId !== uid) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    list.sharedWith = list.sharedWith.filter((id: string) => id !== targetUserId);
    list.updatedAt = new Date();

    await db.collection("userData").doc(uid).update({
      [`customLists.${listId}`]: list,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/lists/share - Get shared lists
export async function GET(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsersSnapshot = await db.collection("userData").get();
    const sharedLists: any[] = [];

    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.customLists) {
        Object.values(userData.customLists).forEach((list: any) => {
          if (
            list.isPublic ||
            list.sharedWith?.includes(uid) ||
            list.ownerId === uid
          ) {
            sharedLists.push({
              ...list,
              ownerUid: doc.id,
            });
          }
        });
      }
    });

    // Get owner usernames
    const ownerIds = [...new Set(sharedLists.map((l) => l.ownerUid))];
    const owners: Record<string, any> = {};
    await Promise.all(
      ownerIds.map(async (id) => {
        const ownerDoc = await db.collection("users").doc(id).get();
        if (ownerDoc.exists()) {
          owners[id] = ownerDoc.data();
        }
      })
    );

    const listsWithOwners = sharedLists.map((list) => ({
      ...list,
      owner: owners[list.ownerUid] || null,
    }));

    return NextResponse.json({ lists: listsWithOwners });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

