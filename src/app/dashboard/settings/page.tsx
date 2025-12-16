"use client";

import { useState } from "react";
import { Lock, Bell, Trash2, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
    const [showPasswords, setShowPasswords] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [notifications, setNotifications] = useState({
        newsletter: true,
        newDownloads: true,
        blogUpdates: false,
        promotions: false,
    });

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsSaved(true);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
                <p className="text-zinc-400">Manage your account settings and preferences</p>
            </div>

            {/* Change Password */}
            <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-brand" />
                    Change Password
                </h2>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="••••••••"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 px-4 pr-12 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            New Password
                        </label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                        <p className="mt-1 text-xs text-zinc-500">Minimum 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                        {isSaved && (
                            <span className="text-sm text-green-400">✓ Password updated</span>
                        )}
                    </div>
                </form>
            </div>

            {/* Notifications */}
            <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-brand" />
                    Email Notifications
                </h2>

                <div className="space-y-4">
                    {[
                        { key: "newsletter", label: "Newsletter", desc: "Weekly trading tips and market updates" },
                        { key: "newDownloads", label: "New Downloads", desc: "When new EAs or indicators are available" },
                        { key: "blogUpdates", label: "Blog Updates", desc: "New articles and trading strategies" },
                        { key: "promotions", label: "Promotions", desc: "Special offers and discounts" },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                                <p className="text-sm font-medium text-white">{item.label}</p>
                                <p className="text-xs text-zinc-500">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-brand" : "bg-zinc-700"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? "left-7" : "left-1"
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#0d0d14] rounded-xl border border-red-500/20 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Danger Zone
                </h2>

                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Delete Account</p>
                            <p className="text-xs text-zinc-500">Permanently delete your account and all data</p>
                        </div>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
