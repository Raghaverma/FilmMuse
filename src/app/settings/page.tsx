"use client";

import { useState } from "react";
import { User, Eye, Bell, HelpCircle, ChevronRight, Lock, Globe, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { cn } from "@/lib/utils";

type SettingsTab = "account" | "visibility" | "notifications" | "support";

export default function SettingsPage() {
    const { userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("account");

    const tabs = [
        { id: "account" as const, label: "Account", icon: User },
        { id: "visibility" as const, label: "Visibility", icon: Eye },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
        { id: "support" as const, label: "Help & Support", icon: HelpCircle },
    ];

    return (
        <div className="min-h-screen bg-black px-4 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your account and preferences</p>
                </div>

                <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                    {/* Sidebar Navigation */}
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                                        isActive
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{tab.label}</span>
                                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Content Area */}
                    <div className="glass-card rounded-2xl p-6 lg:p-8">
                        {activeTab === "account" && <AccountSettings />}
                        {activeTab === "visibility" && <VisibilitySettings />}
                        {activeTab === "notifications" && <NotificationSettings />}
                        {activeTab === "support" && <SupportSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AccountSettings() {
    const { userProfile, user } = useAuth();
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Profile Information</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                        <input
                            type="text"
                            defaultValue={userProfile?.username || ""}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            defaultValue={user?.email || ""}
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Password</h3>
                        <p className="text-sm text-gray-400 mt-1">Update your password to keep your account secure</p>
                    </div>
                    <button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                    >
                        {showPasswordChange ? "Cancel" : "Change Password"}
                    </button>
                </div>

                {showPasswordChange && (
                    <div className="space-y-4 mt-4 p-4 rounded-xl bg-white/5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary"
                            />
                        </div>
                        <button className="w-full px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors">
                            Update Password
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Privacy */}
            <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white">Profile Privacy</h3>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                        <p className="font-medium text-white">Private Profile</p>
                        <p className="text-sm text-gray-400 mt-1">Only friends can see your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
    );
}

function VisibilitySettings() {
    const visibilityOptions = [
        { label: "Everyone", value: "everyone" },
        { label: "Friends only", value: "friends" },
        { label: "Only me", value: "private" },
    ];

    const settings = [
        { id: "profile", label: "Who can see your profile", icon: User },
        { id: "watchlist", label: "Who can see your watchlist", icon: Eye },
        { id: "ratings", label: "Who can see your ratings", icon: Globe },
        { id: "friends", label: "Who can send friend requests", icon: User },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Visibility Settings</h2>
                <p className="text-gray-400">Control who can see your content and interact with you</p>
            </div>

            <div className="space-y-4">
                {settings.map((setting) => {
                    const Icon = setting.icon;
                    return (
                        <div key={setting.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-start gap-3 mb-3">
                                <Icon className="h-5 w-5 text-primary mt-0.5" />
                                <p className="font-medium text-white">{setting.label}</p>
                            </div>
                            <select className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary">
                                {visibilityOptions.map((option) => (
                                    <option key={option.value} value={option.value} className="bg-card">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function NotificationSettings() {
    const notificationTypes = [
        { id: "friend_requests", label: "Friend requests", description: "When someone sends you a friend request" },
        { id: "friend_activity", label: "Friend activity", description: "When friends rate or review movies" },
        { id: "recommendations", label: "Recommendations", description: "Personalized movie suggestions" },
        { id: "list_updates", label: "List updates", description: "When someone shares a list with you" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Notification Settings</h2>
                <p className="text-gray-400">Choose how you want to be notified</p>
            </div>

            <div className="space-y-6">
                {notificationTypes.map((type) => (
                    <div key={type.id} className="p-4 rounded-xl bg-white/5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="font-medium text-white">{type.label}</p>
                                <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary" />
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-300">Email</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary" />
                                <Smartphone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-300">Push</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SupportSettings() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: "How do I add movies to my watchlist?",
            answer: "Click the bookmark icon on any movie card or detail page to add it to your watchlist. You can access your watchlist from your profile."
        },
        {
            question: "Can I create custom lists?",
            answer: "Yes! Go to your profile and click 'Create List' to make custom collections of movies. You can make them public or private."
        },
        {
            question: "How do I connect with friends?",
            answer: "Search for users in the Friends tab and send them a friend request. Once accepted, you'll see their activity in your feed."
        },
        {
            question: "How do I change my privacy settings?",
            answer: "Go to Settings > Visibility to control who can see your profile, watchlist, and ratings."
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Help & Support</h2>
                <p className="text-gray-400">Find answers or get in touch</p>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>

                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div key={index} className="rounded-xl bg-white/5 overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors"
                            >
                                <span className="font-medium text-white">{faq.question}</span>
                                <ChevronRight className={cn(
                                    "h-5 w-5 text-gray-400 transition-transform",
                                    openFaq === index && "rotate-90"
                                )} />
                            </button>

                            {openFaq === index && (
                                <div className="px-4 pb-4 text-sm text-gray-300">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white">Contact Support</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                        <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary">
                            <option value="bug" className="bg-card">Report a Bug</option>
                            <option value="feature" className="bg-card">Feature Request</option>
                            <option value="account" className="bg-card">Account Issue</option>
                            <option value="other" className="bg-card">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                        <textarea
                            rows={6}
                            placeholder="Describe your issue or question..."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-primary resize-none"
                        />
                    </div>

                    <button className="w-full px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors">
                        Send Message
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        We typically respond within 24-48 hours
                    </p>
                </div>
            </div>

            {/* Resources */}
            <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white">Resources</h3>

                <div className="grid gap-3">
                    <Link href="/docs" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-white">Getting Started Guide</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Link>

                    <Link href="/community" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-white">Community Forum</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Link>

                    <Link href="/changelog" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-white">Changelog</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Link>
                </div>
            </div>

            {/* App Version */}
            <div className="pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-gray-500">FilmMuse v0.1.1</p>
            </div>
        </div>
    );
}
