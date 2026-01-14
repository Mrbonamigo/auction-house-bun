import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// Fetch Balance
const fetchBalance = async () => {
    const res = await fetch("/api/me/balance");
    if (!res.ok) throw new Error("Failed to load balance");
    return res.json();
};

export default function WalletPage() {
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState("1000");

    // 👇 NEW: State for Elegant Feedback (Success/Error)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["balance"],
        queryFn: fetchBalance,
        refetchInterval: 5000,
    });

    const depositMutation = useMutation({
        mutationFn: async (val: number) => {
            const res = await fetch("/api/me/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: val })
            });
            if (!res.ok) throw new Error("Failed to deposit funds");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["balance"] });

            // ✅ SUCCESS: Show elegant message & Auto-hide
            setFeedback({ type: 'success', text: "Funds deposited successfully! 💸" });
            setAmount(""); // Clear input if you want, or leave it for quick re-deposit
            setTimeout(() => setFeedback(null), 3000);
        },
        onError: (error) => {
            // ❌ ERROR: Show error message
            setFeedback({ type: 'error', text: error.message });
        }
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center pt-20">
            <nav className="w-full fixed top-0 p-6 border-b border-neutral-800 bg-neutral-950 flex justify-between">
                <Link to="/" className="text-neutral-400 hover:text-amber-500 transition-colors">← Back to Dashboard</Link>
                <span className="text-amber-500 font-bold tracking-widest">DIGITAL WALLET</span>
            </nav>

            <div className="bg-neutral-900 p-10 rounded-2xl border border-neutral-800 shadow-2xl text-center max-w-md w-full mt-10">
                <p className="text-neutral-500 uppercase tracking-widest text-xs mb-2">Total Available Balance</p>
                <h1 className="text-5xl font-mono font-bold text-emerald-500 mb-8">
                    ${isLoading ? "..." : data?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h1>

                {/* 👇 NEW: Feedback Notification Area */}
                {feedback && (
                    <div className={`mb-6 rounded p-3 text-sm font-medium border animate-fade-in ${
                        feedback.type === 'success'
                            ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-400"
                            : "bg-red-900/30 border-red-500/30 text-red-400"
                    }`}>
                        {feedback.type === 'success' ? "✨ " : "⚠️ "}
                        {feedback.text}
                    </div>
                )}

                <div className="space-y-4">
                    <label className="block text-left text-xs uppercase text-neutral-400">Add Funds</label>
                    <div className="flex gap-2">
                        <span className="p-4 bg-neutral-800 rounded-lg text-neutral-400 font-bold">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 text-white focus:border-emerald-600 outline-none transition-colors"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setFeedback(null); // Clear previous messages
                            depositMutation.mutate(parseFloat(amount));
                        }}
                        disabled={depositMutation.isPending}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        {depositMutation.isPending ? "Processing..." : "Deposit Funds"}
                    </button>
                </div>

                <p className="text-xs text-neutral-600 mt-6 pt-6 border-t border-neutral-800">
                    Secure Transaction provided by AuctionHouse Bank. <br/>
                    Funds are for demonstration purposes only.
                </p>
            </div>
        </div>
    );
}