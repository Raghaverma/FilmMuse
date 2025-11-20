"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  createdAt: any;
  updatedAt: any;
}

export async function signupWithEmail(
  email: string,
  password: string,
  username: string
): Promise<User> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );
    const user = userCredential.user;

    try {
      await updateProfile(user, { displayName: username.trim() });
    } catch (profileError) {
      console.warn("Failed to update display name:", profileError);
    }

    const userProfile: UserProfile = {
      uid: user.uid,
      email: normalizedEmail,
      username: username.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "users", user.uid), userProfile);
    } catch (firestoreError) {
      console.error("Failed to create user profile in Firestore:", firestoreError);
    }

    try {
      await setDoc(doc(db, "userData", user.uid), {
        watchlist: [],
        liked: [],
        ratings: {},
        customLists: {},
        activity: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (firestoreError) {
      console.error("Failed to initialize user data:", firestoreError);
    }

    return user;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create account";
    if (errorMessage.includes("auth/")) {
      throw new Error(errorMessage);
    }
    throw new Error(errorMessage);
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    return userCredential.user;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to sign in";
    if (errorMessage.includes("auth/invalid-credential") || errorMessage.includes("auth/user-not-found") || errorMessage.includes("auth/wrong-password")) {
      throw new Error("auth/invalid-credential");
    }
    throw new Error(errorMessage);
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to sign out";
    throw new Error(errorMessage);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      const username = user.displayName || user.email?.split("@")[0] || "User";
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email?.toLowerCase() || "",
        username: username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      await setDoc(doc(db, "userData", user.uid), {
        watchlist: [],
        liked: [],
        ratings: {},
        customLists: {},
        activity: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return user;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to sign in with Google";
    throw new Error(errorMessage);
  }
}

