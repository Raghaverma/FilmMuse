"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user || !userProfile) {
      router.replace("/login?next=/account");
      return;
    }
    setUsername(userProfile.username);
    setEmail(userProfile.email);
  }, [user, userProfile, loading, router]);

  const save = async () => {
    if (!user) return;
    setSaved(false);
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        updatedAt: serverTimestamp(),
      });
      // Update display name in Firebase Auth
      if (user.displayName !== username.trim()) {
        const { updateProfile } = await import("firebase/auth");
        const { auth } = await import("@/lib/firebase/config");
        await updateProfile(auth.currentUser!, { displayName: username.trim() });
      }
      setSaved(true);
      toast.success("Profile updated");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Account</h1>
          <nav className="flex items-center gap-3 text-sm text-neutral-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/logout" className="hover:text-white">Logout</Link>
          </nav>
        </header>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm text-neutral-300">Email</label>
              <Input value={email} readOnly className="bg-white/5 border-white/10 opacity-80" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-300">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Button onClick={save} disabled={saving} className="bg-emerald-400 text-black hover:bg-emerald-300">
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {saved && <span className="ml-2 text-sm text-emerald-300">Saved</span>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}



