"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithEmail } from "@/lib/firebase/auth";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
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
          <Button type="submit" disabled={loading} className="bg-emerald-400 text-black hover:bg-emerald-300">
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
    </div>
  );
}

