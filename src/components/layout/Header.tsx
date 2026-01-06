"use client";

import Link from "next/link";
import { Film, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
                isScrolled
                    ? "bg-black/60 backdrop-blur-md border-white/10 py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div className="relative flex items-center justify-center p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Film className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Film<span className="text-primary">Muse</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-white",
                            pathname === "/" ? "text-white" : "text-gray-400"
                        )}
                    >
                        Home
                    </Link>
                    <Link
                        href="/discover"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-white",
                            pathname === "/discover" ? "text-white" : "text-gray-400"
                        )}
                    >
                        Discover
                    </Link>
                    <Link
                        href="/lists"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-white",
                            pathname === "/lists" ? "text-white" : "text-gray-400"
                        )}
                    >
                        Lists
                    </Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-white hover:text-primary hover:bg-white/5">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6">
                            Sign up
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <nav className="flex flex-col gap-2">
                        <Link
                            href="/"
                            className="p-3 rounded-lg text-white hover:bg-white/5 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/discover"
                            className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Discover
                        </Link>
                        <Link
                            href="/lists"
                            className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Lists
                        </Link>
                    </nav>
                    <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full text-white hover:bg-white/5">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-primary text-white hover:bg-primary/90">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
