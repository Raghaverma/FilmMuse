"use client";

import * as React from "react";
import { onAuthChange, getUserProfile, type UserProfile } from "./auth";
import { type User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshProfile = React.useCallback(async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
  }, [user]);

  React.useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const profile = await getUserProfile(authUser.uid);
        setUserProfile(profile);
        // Set cookie for middleware authentication check
        document.cookie = `firebase-auth=1; path=/; max-age=86400; SameSite=Lax`;
      } else {
        setUserProfile(null);
        // Clear auth cookie
        document.cookie = `firebase-auth=; path=/; max-age=0; SameSite=Lax`;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

