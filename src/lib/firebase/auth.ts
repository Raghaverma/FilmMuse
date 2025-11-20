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
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: username });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: email.toLowerCase().trim(),
      username: username.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    // Initialize user data collections
    await setDoc(doc(db, "userData", user.uid), {
      watchlist: [],
      liked: [],
      ratings: {},
      customLists: {},
      activity: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create account");
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in");
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
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

// Google Sign-In
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // First time Google sign-in - create user profile
      const username = user.displayName || user.email?.split("@")[0] || "User";
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email?.toLowerCase() || "",
        username: username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      // Initialize user data collections
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
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in with Google");
  }
}

