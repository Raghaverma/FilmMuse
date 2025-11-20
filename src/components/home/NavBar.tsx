"use client";

import * as React from "react";
import Link from "next/link";
import { Film } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function NavBar() {
  const [user, setUser] = React.useState<{ email: string; username: string } | null>(null);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);

  const { user: firebaseUser, userProfile } = useAuth();

  React.useEffect(() => {
    if (firebaseUser && userProfile) {
      setUser({ email: userProfile.email, username: userProfile.username });
    } else {
      setUser(null);
    }
  }, [firebaseUser, userProfile]);

  const handleAuthSuccess = () => {
    if (firebaseUser && userProfile) {
      setUser({ email: userProfile.email, username: userProfile.username });
    }
    setShowAuthDialog(false);
  };

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur supports-[backdrop-filter]:bg-black/40"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold tracking-tight"
            aria-label="FilmMuse home"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-400/10 ring-1 ring-emerald-400/30">
              <Film className="h-4 w-4 text-emerald-300" />
            </span>
            <span className="text-sm uppercase text-neutral-300">FilmMuse</span>
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 text-sm text-neutral-300 md:flex"
          >
            {user ? (
              <Link href="/profile" className="hover:text-white">
                Profile
              </Link>
            ) : (
              <>
                <button onClick={() => { setIsLogin(true); setShowAuthDialog(true); }} className="hover:text-white">
                  Log in
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setShowAuthDialog(true); }} 
                  className="rounded-md border border-white/15 px-3 py-1.5 hover:bg-white/10"
                >
                  Sign up
                </button>
              </>
            )}
          </nav>
          <MobileMenu user={user} setIsLogin={setIsLogin} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </header>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {isLogin ? "Log in" : "Create your account"}
            </DialogTitle>
          </DialogHeader>
          {isLogin ? (
            <LoginForm onSuccess={handleAuthSuccess} onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MobileMenu({ user, setIsLogin, setShowAuthDialog }: { 
  user: { email: string; username: string } | null;
  setIsLogin: (val: boolean) => void;
  setShowAuthDialog: (val: boolean) => void;
}) {
  return (
    <details className="md:hidden">
      <summary className="list-none">
        <div
          className="rounded-md border border-white/10 p-2"
          role="button"
          aria-label="Open menu"
        >
          <div className="space-y-1">
            <div className="h-0.5 w-6 bg-neutral-400" />
            <div className="h-0.5 w-6 bg-neutral-400" />
            <div className="h-0.5 w-6 bg-neutral-400" />
          </div>
        </div>
      </summary>
      <div className="absolute left-0 right-0 mt-3 border-t border-white/10 bg-black/90 backdrop-blur">
        <nav className="flex flex-col gap-3 px-4 py-4 text-sm" aria-label="Mobile">
          {user ? (
            <Link href="/profile">Profile</Link>
          ) : (
            <>
              <button onClick={() => { setIsLogin(true); setShowAuthDialog(true); }}>Log in</button>
              <button onClick={() => { setIsLogin(false); setShowAuthDialog(true); }}>Sign up</button>
            </>
          )}
        </nav>
      </div>
    </details>
  );
}

