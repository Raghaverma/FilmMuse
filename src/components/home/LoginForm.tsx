"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes("auth/invalid-credential") || errorMessage.includes("auth/user-not-found")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (errorMessage.includes("auth/wrong-password")) {
      return "Incorrect password. Please try again.";
    }
    if (errorMessage.includes("auth/invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("auth/internal-error")) {
      if (errorMessage.includes("Google sign-in")) {
        return "Google sign-in is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.";
      }
      return "An internal error occurred. Please try again or contact support.";
    }
    if (errorMessage.includes("auth/popup-blocked")) {
      return "Popups are blocked. Please allow popups for this site and try again.";
    }
    if (errorMessage.includes("auth/popup-closed-by-user")) {
      return "Sign-in was cancelled. Please try again.";
    }
    if (errorMessage.includes("auth/operation-not-allowed")) {
      return "Google sign-in is not enabled. Please enable it in Firebase Console.";
    }
    return errorMessage || "Login failed. Please try again.";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(getErrorMessage(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(getErrorMessage(msg));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <p className="mb-4 text-sm text-neutral-400">Welcome back to FilmMuse.</p>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-neutral-300">Email</label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-neutral-300">Password</label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" disabled={loading || googleLoading} className="bg-emerald-400 text-black hover:bg-emerald-300">
            {loading ? "Signing in…" : "Log in"}
          </Button>
          <button 
            type="button" 
            onClick={onSwitchToSignup} 
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            Need an account? Sign up
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0b0b0d] text-neutral-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="mt-4 w-full bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {googleLoading ? (
            "Signing in..."
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

