"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { signupWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Check, X, ChevronRight } from "lucide-react";
import LoginBackdrop from "@/components/auth/LoginBackdrop";

function SignupContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return Math.min(score, 4);
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0: return { label: "Weak", color: "bg-red-500", text: "text-red-500", width: "10%" };
      case 1: return { label: "Fair", color: "bg-orange-500", text: "text-orange-500", width: "25%" };
      case 2: return { label: "Good", color: "bg-yellow-400", text: "text-yellow-400", width: "50%" };
      case 3: return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500", width: "75%" };
      case 4: return { label: "Very Strong", color: "bg-emerald-500", text: "text-emerald-500", width: "100%" };
      default: return { label: "", color: "", text: "", width: "0%" };
    }
  };

  const strengthInfo = getStrengthLabel(password ? passwordStrength : -1);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) return setError("Please enter your name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!agreed) return setError("You must agree to the Terms of Service.");

    setLoading(true);
    try {
      await signupWithEmail(email.trim(), password, username.trim());
      toast.success("Account created successfully! 🎉");
      // Redirect handled by effect
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome! 🎬");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Left Side */}
      <LoginBackdrop />

      {/* Right Side */}
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-[40%] text-center lg:p-8">
        <div className="glass w-full max-w-[480px] rounded-3xl p-8 shadow-2xl shadow-black/80 lg:p-10 border border-white/5 my-8">
          <div className="text-left mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join FilmMuse to track your journey.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <UserIcon className="h-4 w-4" /> Full Name
              </label>
              <div className="group relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-primary focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 group-hover:bg-white/10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Mail className="h-4 w-4" /> Email
              </label>
              <div className="group relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-primary focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 group-hover:bg-white/10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Lock className="h-4 w-4" /> Password
              </label>
              <div className="group relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-white placeholder-gray-500 outline-none transition-all focus:border-primary focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 group-hover:bg-white/10"
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

              {/* Strength Indicator */}
              {password && (
                <div className="pt-1">
                  <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                      style={{ width: strengthInfo.width }}
                    />
                  </div>
                  <div className={`text-xs mt-1 text-right font-medium ${strengthInfo.text}`}>
                    {strengthInfo.label}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Lock className="h-4 w-4" /> Confirm Password
              </label>
              <div className="group relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:bg-primary/5 focus:ring-1 group-hover:bg-white/10 ${confirmPassword && password !== confirmPassword
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                      : "border-white/10 bg-white/5 focus:border-primary focus:ring-primary/20"
                    }`}
                  required
                  disabled={loading}
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ? (
                      <Check className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all ${agreed ? "bg-primary border-primary" : "border-white/20 hover:border-white/40"
                  }`}
                onClick={() => setAgreed(!agreed)}
              >
                {agreed && <Check className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className="text-sm text-gray-400 leading-tight">
                I agree to FilmMuse&#39;s <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-left">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-[#b91c1c] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Create Account
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            <div className="relative py-2">
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
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupContent />
    </Suspense>
  );
}
