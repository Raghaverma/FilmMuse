"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { loginWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, ChevronRight } from "lucide-react";
import LoginBackdrop from "@/components/auth/LoginBackdrop";

function LoginContent() {
  const router = useRouter();
  // Wrap useSearchParams in a check or just assume Suspense handles it
  const sp = useSearchParams();
  const nextUrl = sp?.get("next") || "/dashboard"; // Default to dashboard on redesign? or /
  const { user } = useAuth(); // Destructure what we need

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      router.replace(nextUrl);
    }
  }, [user, router, nextUrl]);

  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes("user-not-found") || errorMessage.includes("invalid-credential")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (errorMessage.includes("wrong-password")) {
      return "Incorrect password. Please try again.";
    }
    if (errorMessage.includes("invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("user-disabled")) {
      return "This account has been disabled. Please contact support.";
    }
    if (errorMessage.includes("too-many-requests")) {
      return "Too many failed attempts. Please try again later.";
    }
    if (errorMessage.includes("network-request-failed")) {
      return "Network error. Please check your connection and try again.";
    }
    return errorMessage || "Login failed. Please try again.";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email.trim().toLowerCase(), password);
      toast.success("Welcome back! 🎬");
      // Redirect handled by effect
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      const friendlyMessage = getErrorMessage(errorMessage);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google! 🎬");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed";
      const friendlyMessage = getErrorMessage(errorMessage);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Left Side - Cinematic Experience */}
      <LoginBackdrop />

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-[40%] text-center lg:p-8">
        <div className="glass w-full max-w-[440px] rounded-3xl p-8 shadow-2xl shadow-black/80 lg:p-12 border border-white/5">
          <div className="text-left mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Log in</h1>
            <p className="text-gray-400">Welcome back to FilmMuse</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Mail className="h-4 w-4" /> Email
              </label>
              <div className="group relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-primary focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 group-hover:bg-white/10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Lock className="h-4 w-4" /> Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="group relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-10 text-white placeholder-gray-500 outline-none transition-all focus:border-primary focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 group-hover:bg-white/10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-left">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-[#b91c1c] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Log in
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <Link
                href="/signup"
                className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
              >
                Create Account
              </Link>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#151515] px-4 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-gray-900 shadow-lg transition-all hover:bg-gray-100 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {googleLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-gray-900" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            New here?{" "}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
