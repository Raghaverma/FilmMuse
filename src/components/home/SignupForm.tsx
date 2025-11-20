"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupWithEmail } from "@/lib/firebase/auth";

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
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
      await signupWithEmail(email, password, username);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <p className="mb-4 text-sm text-neutral-400">It takes less than a minute.</p>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-neutral-300">Name</label>
          <Input 
            id="name" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="bg-white/5 border-white/10" 
            required 
          />
        </div>
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
            {loading ? "Creating…" : "Sign up"}
          </Button>
          <button 
            type="button" 
            onClick={onSwitchToLogin} 
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            Already have an account? Log in
          </button>
        </div>
      </form>
    </div>
  );
}

