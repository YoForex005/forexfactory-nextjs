"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";
import { getUser, getToken, saveAuth } from "@/lib/auth-client";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        country: "India",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = getToken();
        const localUser = getUser();

        // Set initial data from local storage
        if (localUser) {
            setFormData(prev => ({
                ...prev,
                name: localUser.name || "",
                email: localUser.email || "",
            }));
        }

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.user.name || "",
                    email: data.user.email || "",
                    phone: data.user.phone || "",
                    country: data.user.country || "India",
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        const token = getToken();
        if (!token) {
            setError("Not authenticated");
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    country: formData.country,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Update local storage with new name
                const localUser = getUser();
                if (localUser) {
                    saveAuth(token, { ...localUser, name: data.user.name });
                }
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update profile");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
                <p className="text-zinc-400">Manage your personal information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                    <div className="w-20 h-20 rounded-full bg-brand/20 flex items-center justify-center text-brand text-3xl font-bold">
                        {formData.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{formData.name || "User"}</h2>
                        <p className="text-zinc-400">{formData.email}</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-zinc-500 placeholder-zinc-500 cursor-not-allowed"
                            />
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">Email cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Phone Number (Optional)
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Country
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 appearance-none"
                            >
                                <option value="India">India</option>
                                <option value="USA">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="UAE">UAE</option>
                                <option value="Singapore">Singapore</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                        {isSaved && (
                            <span className="text-sm text-green-400">✓ Profile saved successfully</span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
