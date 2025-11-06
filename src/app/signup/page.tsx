"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({ email, username, password });
      router.replace("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
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
        <div className="flex items-center justify-center rounded-none bg-[#0b0b0d] p-6 lg:rounded-r-2xl">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-400">It takes less than a minute.</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-5">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm text-neutral-300">Name</label>
                <Input id="name" value={username} onChange={e => setUsername(e.target.value)} className="bg-transparent border-0 border-b border-white/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-400" required />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-neutral-300">Email</label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-transparent border-0 border-b border-white/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-400" required />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm text-neutral-300">Password</label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-transparent border-0 border-b border-white/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-400" required />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="mt-1 flex items-center gap-3">
                <Button type="submit" disabled={loading} className="bg-emerald-400 text-black hover:bg-emerald-300">{loading ? "Creating…" : "Sign up"}</Button>
                <Link href="/login" className="rounded-full border border-white/20 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10">Sign in</Link>
              </div>
            </form>

            <p className="mt-4 text-sm text-neutral-400">
              Already have an account? <Link href="/login" className="text-emerald-300 hover:text-emerald-200">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


