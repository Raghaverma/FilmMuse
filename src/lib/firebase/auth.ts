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
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import { db } from "./config";

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  photoURL?: string | null;
  createdAt: Timestamp | number;
  updatedAt: Timestamp | number;
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
      // New user - create profile
      const username = user.displayName || user.email?.split("@")[0] || "User";
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email?.toLowerCase() || "",
        username: username,
        photoURL: user.photoURL || null,
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
    } else {
      // Existing user - update photoURL if available from Google
      const existingProfile = userDoc.data() as UserProfile;
      if (user.photoURL && existingProfile.photoURL !== user.photoURL) {
        await updateDoc(doc(db, "users", user.uid), {
          photoURL: user.photoURL,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return user;
  } catch (error: unknown) {
    // Handle Firebase Auth errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      
      // Log the full error for debugging
      console.error('Google sign-in error:', {
        code: firebaseError.code,
        message: firebaseError.message,
        fullError: error
      });
      
      if (firebaseError.code === 'auth/popup-blocked') {
        throw new Error('Popups are blocked. Please allow popups for this site and try again.');
      }
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      if (firebaseError.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.');
      }
      if (firebaseError.code === 'auth/internal-error') {
        // Internal error can have various causes, not just disabled provider
        const errorMsg = firebaseError.message || 'An internal error occurred';
        if (errorMsg.includes('operation-not-allowed') || errorMsg.includes('not enabled')) {
          throw new Error('Google sign-in is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.');
        }
        // Check if it's a domain authorization issue
        if (errorMsg.includes('domain') || errorMsg.includes('authorized')) {
          throw new Error('This domain is not authorized. Please add localhost to authorized domains in Firebase Console > Authentication > Settings.');
        }
        throw new Error(`Google sign-in error: ${errorMsg}. Please check your Firebase configuration and try again.`);
      }
      if (firebaseError.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized. Please add localhost to authorized domains in Firebase Console > Authentication > Settings.');
      }
      
      throw new Error(firebaseError.message || firebaseError.code);
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to sign in with Google";
    console.error('Unknown Google sign-in error:', error);
    throw new Error(errorMessage);
  }
}

