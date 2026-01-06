"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "Watchlist", href: "/watchlist", icon: Heart },
    { name: "Friends", href: "/friends", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Hide on auth pages
    if (pathname === "/login" || pathname === "/signup") {
        return null;
    }

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]",
                                isActive
                                    ? "text-primary"
                                    : "text-gray-400 active:scale-95"
                            )}
                        >
                            <div className={cn(
                                "relative flex items-center justify-center",
                                isActive && "animate-in zoom-in-50 duration-200"
                            )}>
                                <Icon className={cn(
                                    "h-6 w-6 transition-all",
                                    isActive && "drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                                )} />
                                {isActive && (
                                    <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-all",
                                isActive ? "text-primary" : "text-gray-500"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
