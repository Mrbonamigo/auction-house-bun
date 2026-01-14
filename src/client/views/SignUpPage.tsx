import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export default function SignUpPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Call Better-Auth to register user
            const { error: signUpError } = await authClient.signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                image: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}` // Auto-generate avatar
            });

            if (signUpError) throw new Error(signUpError.message);

            // Redirect to Home on success
            navigate("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-white font-sans">
            <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-amber-500 mb-2">Create Account</h1>
                    <p className="text-neutral-400 text-sm">Join the exclusive auction club.</p>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-400 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-neutral-500 mb-1">Full Name</label>
                        <input
                            type="text" required
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 focus:border-amber-600 outline-none transition-colors text-white"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-neutral-500 mb-1">Email Address</label>
                        <input
                            type="email" required
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 focus:border-amber-600 outline-none transition-colors text-white"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-neutral-500 mb-1">Password</label>
                        <input
                            type="password" required minLength={8}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 focus:border-amber-600 outline-none transition-colors text-white"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded transition-colors uppercase tracking-wider mt-4"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-500">
                    Already a member? <Link to="/login" className="text-amber-500 hover:underline">Log in here</Link>
                </div>
            </div>
        </div>
    );
}