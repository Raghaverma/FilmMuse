import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { validateRequest, shareListSchema, removeAccessSchema } from "@/lib/validation";

interface CustomList {
  id?: string;
  name: string;
  description?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  movies?: unknown[];
  ownerId: string;
  isPublic?: boolean;
  sharedWith?: string[];
  [key: string]: unknown;
}

interface SharedList extends CustomList {
  ownerUid: string;
  owner?: Record<string, unknown> | null;
}

interface UserData {
  customLists?: Record<string, CustomList>;
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

// POST /api/lists/share - Share list with user or make public
export async function POST(request: NextRequest) {
  try {
    const uid = await verifyToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (body.userIds && Array.isArray(body.userIds)) {
      const validated = validateRequest(shareListSchema, body);
      const { listId, userIds } = validated;
      
      const userDataDoc = await db.collection("userData").doc(uid).get();
      if (!userDataDoc.exists) {
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

      list.sharedWith = [...new Set([...list.sharedWith, ...userIds])];
      list.updatedAt = new Date();

      await db.collection("userData").doc(uid).update({
        [`customLists.${listId}`]: list,
        updatedAt: new Date(),
      });

      return NextResponse.json({ success: true, list });
    }
    
    const { listId, targetUserId, isPublic } = body;
    if (!listId || (listId.length < 1 || listId.length > 128)) {
      return NextResponse.json({ error: "Invalid listId" }, { status: 400 });
    }

    const userDataDoc = await db.collection("userData").doc(uid).get();
    if (!userDataDoc.exists) {
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
    const params = {
      listId: searchParams.get("listId"),
      userId: searchParams.get("targetUserId"),
    };
    const validated = validateRequest(removeAccessSchema, params);
    const { listId, userId: targetUserId } = validated;

    const userDataDoc = await db.collection("userData").doc(uid).get();
    if (!userDataDoc.exists) {
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
    const sharedLists: SharedList[] = [];

    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data() as UserData;
      if (userData.customLists) {
        Object.values(userData.customLists).forEach((list) => {
          const listData = list as CustomList;
          if (
            listData.isPublic ||
            listData.sharedWith?.includes(uid) ||
            listData.ownerId === uid
          ) {
            sharedLists.push({
              ...listData,
              ownerUid: doc.id,
            });
          }
        });
      }
    });

    // Get owner usernames
    const ownerIds = [...new Set(sharedLists.map((l) => l.ownerUid))];
    const owners: Record<string, Record<string, unknown>> = {};
    await Promise.all(
      ownerIds.map(async (id) => {
        const ownerDoc = await db.collection("users").doc(id).get();
        if (ownerDoc.exists) {
          owners[id] = ownerDoc.data()!;
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

