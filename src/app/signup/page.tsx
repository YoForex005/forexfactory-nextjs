"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { saveAuth } from "@/lib/auth-client";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate password length
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Signup failed");
                return;
            }

            // Auto-login after signup
            const loginResponse = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                saveAuth(loginData.token, loginData.user);
                setSuccess(true);
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh();
                }, 1000);
            } else {
                // Signup succeeded but auto-login failed, redirect to login
                router.push("/login");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-[#0d0d14] rounded-2xl border border-white/10 p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                            <p className="text-sm text-zinc-400">Join ForexFactory today</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                Account created! Redirecting...
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-zinc-500">Minimum 6 characters</p>
                            </div>

                            {/* Terms */}
                            <p className="text-xs text-zinc-500">
                                By signing up, you agree to our{" "}
                                <Link href="#" className="text-brand hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="#" className="text-brand hover:underline">Privacy Policy</Link>
                            </p>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-zinc-500">OR</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Login Link */}
                        <p className="text-center text-sm text-zinc-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-brand font-medium hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
