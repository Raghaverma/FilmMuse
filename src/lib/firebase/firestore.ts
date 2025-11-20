"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { auth } from "./config";

// Types
export interface MovieItem {
  id: string;
  title: string;
  year?: number;
  poster?: string | null;
}

export interface CustomList {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp | number;
  updatedAt: Timestamp | number;
  movies: MovieItem[];
  ownerId: string;
  isPublic: boolean;
  sharedWith: string[]; // Array of user UIDs who have access
}

export interface MovieRating {
  movieId: string;
  movieTitle: string;
  movieYear?: number;
  moviePoster?: string | null;
  rating: number; // 1-5 stars
  ratedAt: Timestamp | number;
}

export interface UserData {
  watchlist: MovieItem[];
  liked: MovieItem[];
  ratings: Record<string, MovieRating>;
  customLists: Record<string, CustomList>;
  activity: any[];
}

// User Data Operations
export async function getUserData(uid: string): Promise<UserData> {
  const userDataDoc = await getDoc(doc(db, "userData", uid));
  if (userDataDoc.exists()) {
    const data = userDataDoc.data();
    return {
      watchlist: data.watchlist || [],
      liked: data.liked || [],
      ratings: data.ratings || {},
      customLists: data.customLists || {},
      activity: data.activity || [],
    };
  }
  // Initialize if doesn't exist
  const initialData: UserData = {
    watchlist: [],
    liked: [],
    ratings: {},
    customLists: {},
    activity: [],
  };
  await setDoc(doc(db, "userData", uid), {
    ...initialData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return initialData;
}

export async function getUserWatchlist(uid?: string): Promise<{ watchlist: MovieItem[]; liked: MovieItem[] }> {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) return { watchlist: [], liked: [] };
  const userData = await getUserData(userId);
  return { watchlist: userData.watchlist, liked: userData.liked };
}

export async function getUserCustomLists(uid?: string): Promise<CustomList[]> {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) return [];
  const userData = await getUserData(userId);
  return Object.values(userData.customLists);
}

export async function getUserRatings(uid?: string): Promise<Record<string, MovieRating>> {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) return {};
  const userData = await getUserData(userId);
  return userData.ratings;
}

export async function updateUserData(
  uid: string,
  updates: Partial<UserData>
): Promise<void> {
  await updateDoc(doc(db, "userData", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Watchlist Operations
export async function addToWatchlist(movie: MovieItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  if (!userData.watchlist.some((m) => m.id === movie.id)) {
    userData.watchlist.push(movie);
    await updateUserData(user.uid, { watchlist: userData.watchlist });
  }
}

export async function removeFromWatchlist(movieId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  userData.watchlist = userData.watchlist.filter((m) => m.id !== movieId);
  await updateUserData(user.uid, { watchlist: userData.watchlist });
}

export async function addToLiked(movie: MovieItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  if (!userData.liked.some((m) => m.id === movie.id)) {
    userData.liked.push(movie);
    await updateUserData(user.uid, { liked: userData.liked });
  }
}

export async function removeFromLiked(movieId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  userData.liked = userData.liked.filter((m) => m.id !== movieId);
  await updateUserData(user.uid, { liked: userData.liked });
}

// Ratings Operations
export async function rateMovie(
  movieId: string,
  movieTitle: string,
  rating: number,
  movieYear?: number,
  moviePoster?: string | null
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");

  const userData = await getUserData(user.uid);
  userData.ratings[movieId] = {
    movieId,
    movieTitle,
    movieYear,
    moviePoster,
    rating,
    ratedAt: Date.now(),
  };
  await updateUserData(user.uid, { ratings: userData.ratings });
}

export async function removeRating(movieId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  delete userData.ratings[movieId];
  await updateUserData(user.uid, { ratings: userData.ratings });
}

// Custom Lists Operations
export async function createCustomList(
  name: string,
  description?: string
): Promise<CustomList> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  const listId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newList: CustomList = {
    id: listId,
    name: name.trim(),
    description: description?.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    movies: [],
    ownerId: user.uid,
    isPublic: false,
    sharedWith: [],
  };

  userData.customLists[listId] = newList;
  await updateUserData(user.uid, { customLists: userData.customLists });
  return newList;
}

export async function updateCustomList(
  listId: string,
  updates: { name?: string; description?: string; isPublic?: boolean }
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  const list = userData.customLists[listId];
  if (!list) throw new Error("List not found");
  if (list.ownerId !== user.uid) throw new Error("Not authorized");

  if (updates.name) list.name = updates.name.trim();
  if (updates.description !== undefined) list.description = updates.description.trim();
  if (updates.isPublic !== undefined) list.isPublic = updates.isPublic;
  list.updatedAt = Date.now();

  userData.customLists[listId] = list;
  await updateUserData(user.uid, { customLists: userData.customLists });
}

export async function deleteCustomList(listId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  const list = userData.customLists[listId];
  if (!list) throw new Error("List not found");
  if (list.ownerId !== user.uid) throw new Error("Not authorized");

  delete userData.customLists[listId];
  await updateUserData(user.uid, { customLists: userData.customLists });
}

export async function addMovieToCustomList(
  listId: string,
  movie: MovieItem
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  const list = userData.customLists[listId];
  if (!list) throw new Error("List not found");
  if (list.ownerId !== user.uid && !list.sharedWith.includes(user.uid)) {
    throw new Error("Not authorized");
  }

  if (!list.movies.some((m) => m.id === movie.id)) {
    list.movies.push(movie);
    list.updatedAt = Date.now();
    userData.customLists[listId] = list;
    await updateUserData(user.uid, { customLists: userData.customLists });
  }
}

export async function removeMovieFromCustomList(
  listId: string,
  movieId: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  const list = userData.customLists[listId];
  if (!list) throw new Error("List not found");
  if (list.ownerId !== user.uid && !list.sharedWith.includes(user.uid)) {
    throw new Error("Not authorized");
  }

  list.movies = list.movies.filter((m) => m.id !== movieId);
  list.updatedAt = Date.now();
  userData.customLists[listId] = list;
  await updateUserData(user.uid, { customLists: userData.customLists });
}

// Share list with specific user
export async function shareListWithUser(
  listId: string,
  targetUserId: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  const list = userData.customLists[listId];
  if (!list) throw new Error("List not found");
  if (list.ownerId !== user.uid) throw new Error("Not authorized");

  if (!list.sharedWith.includes(targetUserId)) {
    list.sharedWith.push(targetUserId);
    list.updatedAt = Date.now();
    userData.customLists[listId] = list;
    await updateUserData(user.uid, { customLists: userData.customLists });
  }
}

// Remove user from shared list
export async function unshareListWithUser(
  listId: string,
  targetUserId: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const userData = await getUserData(user.uid);
  const list = userData.customLists[listId];
  if (!list) throw new Error("List not found");
  if (list.ownerId !== user.uid) throw new Error("Not authorized");

  list.sharedWith = list.sharedWith.filter((id) => id !== targetUserId);
  list.updatedAt = Date.now();
  userData.customLists[listId] = list;
  await updateUserData(user.uid, { customLists: userData.customLists });
}

// Get shared lists for a user (lists shared with them or public lists)
export async function getSharedLists(userId: string): Promise<CustomList[]> {
  const allUsersSnapshot = await getDocs(collection(db, "userData"));
  const sharedLists: CustomList[] = [];

  allUsersSnapshot.forEach((doc) => {
    const userData = doc.data() as { customLists: Record<string, CustomList> };
    if (userData.customLists) {
      Object.values(userData.customLists).forEach((list) => {
        if (
          list.isPublic ||
          list.sharedWith.includes(userId) ||
          list.ownerId === userId
        ) {
          sharedLists.push(list);
        }
      });
    }
  });

  return sharedLists;
}

