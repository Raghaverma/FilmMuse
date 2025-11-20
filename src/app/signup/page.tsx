"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/firebase/auth-context";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  // Password strength indicator
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["text-red-400", "text-orange-400", "text-yellow-400", "text-emerald-400", "text-emerald-300"];
    return {
      strength: Math.min(strength, 4),
      label: labels[Math.min(strength, 4)],
      color: colors[Math.min(strength, 4)],
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes("email-already-in-use")) {
      return "An account with this email already exists. Please log in instead.";
    }
    if (errorMessage.includes("invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("weak-password")) {
      return "Password is too weak. Please use a stronger password.";
    }
    if (errorMessage.includes("network-request-failed")) {
      return "Network error. Please check your connection and try again.";
    }
    return errorMessage || "Signup failed. Please try again.";
  };

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError("Please enter a username.");
      return false;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Please enter a password.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(email.trim().toLowerCase(), password, username.trim());
      toast.success("Account created successfully! Welcome to FilmMuse! 🎬");
      router.replace("/");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
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
      toast.success("Account created with Google! Welcome to FilmMuse! 🎬");
      router.replace("/");
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
            <p className="mt-3 text-sm opacity-90">Join and start building watchlists tailored to your vibe.</p>
          </div>
        </div>

        {/* Right panel (form) */}
        <div className="flex items-start justify-center rounded-none bg-[#0b0b0d] p-6 lg:rounded-r-2xl overflow-y-auto min-h-screen lg:min-h-0 lg:items-center">
          <div className="w-full max-w-sm py-4 lg:py-0">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-400">It takes less than a minute.</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-5">
              <div>
                <label htmlFor="name" className="mb-1 flex items-center gap-2 text-sm text-neutral-300">
                  <User className="h-4 w-4" />
                  Username
                </label>
                <Input 
                  id="name" 
                  value={username} 
                  onChange={e => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="Choose a username"
                  className="bg-transparent border-0 border-b border-white/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-400" 
                  required 
                  minLength={3}
                  disabled={loading}
                />
                {username && username.length < 3 && (
                  <p className="mt-1 text-xs text-neutral-500">Username must be at least 3 characters</p>
                )}
              </div>
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
                  className="bg-transparent border-0 border-b border-white/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-400" 
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
                    placeholder="Create a password"
                    className="bg-transparent border-0 border-b border-white/30 rounded-none px-0 pr-8 focus-visible:ring-0 focus-visible:border-emerald-400" 
                    required 
                    minLength={6}
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
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            passwordStrength.strength === 0 ? "bg-red-500 w-0" :
                            passwordStrength.strength === 1 ? "bg-red-400 w-1/4" :
                            passwordStrength.strength === 2 ? "bg-yellow-400 w-2/4" :
                            passwordStrength.strength === 3 ? "bg-emerald-400 w-3/4" :
                            "bg-emerald-300 w-full"
                          }`}
                        />
                      </div>
                      {passwordStrength.label && (
                        <span className={`text-xs ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <div className={`flex items-center gap-1 ${password.length >= 6 ? "text-emerald-400" : ""}`}>
                        {password.length >= 6 && <Check className="h-3 w-3" />}
                        At least 6 characters
                      </div>
                    </div>
                  </div>
                )}
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
                  {loading ? "Creating…" : "Sign up"}
                </Button>
                <Link 
                  href="/login" 
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>

            {/* Google Sign-In Section */}
            <div className="mt-6">
              <div className="relative mb-4">
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
                className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 font-medium"
              >
                {googleLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing up...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path
                        fill="#4285F4"
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
                    Sign up with Google
                  </>
                )}
              </Button>
            </div>

            <p className="mt-4 text-sm text-neutral-400">
              Already have an account? <Link href="/login" className="text-emerald-300 hover:text-emerald-200">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


