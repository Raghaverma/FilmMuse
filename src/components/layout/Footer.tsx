"use client";

import Link from "next/link";
import { Film, Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Film className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight text-white">
                                FilmMuse
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Personalized • No spoilers • Fast. Built for film lovers to discover their next favorite movie seamlessly.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Discovery</h3>
                        <ul className="space-y-3">
                            <li><Link href="/discover" className="text-sm text-gray-400 hover:text-primary transition-colors">Search Movies</Link></li>
                            <li><Link href="/trending" className="text-sm text-gray-400 hover:text-primary transition-colors">Trending Now</Link></li>
                            <li><Link href="/lists" className="text-sm text-gray-400 hover:text-primary transition-colors">Curated Lists</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-gray-400 hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookie" className="text-sm text-gray-400 hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h3>
                        <div className="flex gap-4">
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Github className="w-5 h-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} FilmMuse. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-gray-500">Privacy respecting</span>
                        <span className="text-xs text-gray-500">Built for film lovers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
