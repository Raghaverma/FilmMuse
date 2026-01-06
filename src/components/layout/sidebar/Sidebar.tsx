"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { Film, Home, Compass, Heart, Users, Settings, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/firebase/auth";
import { toast } from "react-hot-toast";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "Watchlist", href: "/watchlist", icon: Heart },
    { name: "Friends", href: "/friends", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, userProfile } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Failed to log out");
        }
    };

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-card border-r border-white/5">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm">
                        <Film className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Film<span className="text-primary">Muse</span>
                    </span>
                </div>

                {/* Profile Card */}
                {user && (
                    <Link
                        href="/profile"
                        className="mx-4 mb-6 rounded-2xl glass-card p-4 transition-all hover:bg-white/10 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-[#b91c1c] flex items-center justify-center text-white font-bold text-lg">
                                    {userProfile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {userProfile?.username || "User"}
                                </p>
                                <p className="text-xs text-gray-400 truncate">View Profile</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-lg shadow-primary/10"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
