"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentUser, updateProfile } from "@/lib/auth-client";

export default function AccountPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/login?next=/account");
      return;
    }
    setUsername(u.username);
    setEmail(u.email);
  }, [router]);

  const save = async () => {
    setSaved(false);
    setSaving(true);
    try {
      await updateProfile({ username });
      setSaved(true);
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



