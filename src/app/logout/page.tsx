"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/firebase/auth";

export default function LogoutPage() {
  const router = useRouter();

  React.useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        router.replace("/");
      } catch (error) {
        console.error("Logout error:", error);
        router.replace("/");
      }
    };
    handleLogout();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex items-center justify-center">
      <div className="text-neutral-400">Logging out...</div>
    </main>
  );
}

