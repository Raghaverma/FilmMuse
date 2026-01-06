"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/firebase/auth-context";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get("next") || "/";
  const { user } = useAuth();

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
      router.replace(nextUrl);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      const friendlyMessage = getErrorMessage(errorMessage);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google! 🎬");
      router.replace(nextUrl);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed";
      const friendlyMessage = getErrorMessage(errorMessage);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f172a] text-neutral-100">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-0 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left panel */}
        <div className="relative hidden items-center justify-center rounded-l-2xl bg-gradient-to-b from-sky-600 to-indigo-700 p-8 text-white shadow-2xl lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(600px_350px_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" aria-hidden />
          <div className="relative z-10 max-w-sm">
            <div className="text-sm opacity-80">Welcome to</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">FilmMuse</div>
            <p className="mt-3 text-sm opacity-90">Discover films curated to your taste. Log in to continue where you left off.</p>
          </div>
        </div>

        {/* Right panel (form) */}
        <div className="flex items-center justify-center rounded-none bg-[#0b0b0d] p-6 lg:rounded-r-2xl">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold">Log in</h1>
            <p className="mt-1 text-sm text-neutral-400">Welcome back to FilmMuse.</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-5">
              <div>
                <label htmlFor="email" className="mb-1 flex items-center gap-2 text-sm text-neutral-300">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="your.email@example.com"
                  className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-400"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 flex items-center gap-2 text-sm text-neutral-300">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your password"
                    className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 pr-8 focus-visible:ring-0 focus-visible:border-emerald-400"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <div className="mt-1 flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="bg-emerald-400 text-black hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  {loading ? "Signing in…" : "Log in"}
                </Button>
                <Link
                  href="/signup"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors"
                >
                  Sign up
                </Link>
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

            <p className="mt-4 text-sm text-neutral-400">
              New here? <Link href="/signup" className="text-emerald-300 hover:text-emerald-200">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <LoginContent />
    </Suspense>
  );
}


