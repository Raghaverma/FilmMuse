"use client";

import * as React from "react";
import Link from "next/link";
import NextImage from "next/image";
import { X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold tracking-tight"
            aria-label="FilmMuse home"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-md">
              <NextImage
                src="/logo.png"
                alt="FilmMuse Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl uppercase text-white tracking-widest font-bebas">FilmMuse</span>
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-4 text-sm text-foreground/70 dark:text-neutral-300 md:flex"
          >
            {user ? (
              <>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Profile
                </Link>
                <Link href="/search" className="hover:text-white transition-colors">
                  Search
                </Link>
              </>
            ) : (
              <>
                <button onClick={() => { setIsLogin(true); setShowAuthDialog(true); }} className="hover:text-white transition-colors">
                  Log in
                </button>
                <button
                  onClick={() => { setIsLogin(false); setShowAuthDialog(true); }}
                  className="rounded-md border border-white/15 px-3 py-1.5 hover:bg-white/10 transition-colors"
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
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden rounded-md border border-white/10 p-2 hover:bg-white/10 transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu className="h-5 w-5 text-neutral-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-[#0a0a0a] border-l border-white/10 shadow-2xl md:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <span className="text-sm font-semibold text-neutral-200">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-2 hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-neutral-300" />
                </button>
              </div>

              <nav className="flex flex-col p-4 gap-2" aria-label="Mobile">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-white/10 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/search"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-white/10 transition-colors"
                    >
                      Search
                    </Link>
                    <Link
                      href="/logout"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-white/10 transition-colors"
                    >
                      Logout
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        setShowAuthDialog(true);
                        setIsOpen(false);
                      }}
                      className="rounded-lg px-4 py-3 text-left text-sm font-medium text-neutral-200 hover:bg-white/10 transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => {
                        setIsLogin(false);
                        setShowAuthDialog(true);
                        setIsOpen(false);
                      }}
                      className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-left text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

