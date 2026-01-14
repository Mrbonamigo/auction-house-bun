import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle standard Email/Pass login
    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { error: signInError } = await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
            });
            if (signInError) throw new Error(signInError.message);

            // Force reload to refresh session state across the app
            window.location.href = "/";
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Handle Google Social Login
    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/"
        });
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-white font-sans">
            <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-neutral-400 text-sm">Sign in to manage your auctions.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-400 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-neutral-500 mb-1">Email</label>
                        <input
                            type="email" required
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 focus:border-amber-600 outline-none transition-colors text-white"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-neutral-500 mb-1">Password</label>
                        <input
                            type="password" required
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 focus:border-amber-600 outline-none transition-colors text-white"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 rounded hover:bg-neutral-200 transition-colors uppercase tracking-wider"
                    >
                        {loading ? "Signing In..." : "Sign In with Email"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-neutral-800 flex-grow"></div>
                    <span className="text-neutral-600 text-xs uppercase">Or continue with</span>
                    <div className="h-px bg-neutral-800 flex-grow"></div>
                </div>

                {/* Social Login Button */}
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    Google
                </button>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    New here? <Link to="/signup" className="text-amber-500 hover:underline">Create an account</Link>
                </div>
            </div>
        </div>
    );
}