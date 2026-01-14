import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// 👇 1. IMPORTANTE: Importar o Countdown
import { Countdown } from "../components/Countdown";

interface Product {
    id: string;
    title: string;
    description: string;
    startPrice: number;
    currentPrice?: number;
    imageUrl: string;
    endsAt: number;
}

const fetchProduct = async (id: string): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("Product not found");
    return res.json();
};

const placeBid = async ({ productId, amount }: { productId: string, amount: number }) => {
    const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, amount }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to place bid");
    }
    return res.json();
};

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [amount, setAmount] = useState<string>("");
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isAuctionEnded, setIsAuctionEnded] = useState(false);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ["product", id],
        queryFn: () => fetchProduct(id!),
        enabled: !!id,
    });

    React.useEffect(() => {
        if (product && Date.now() > product.endsAt) {
            setIsAuctionEnded(true);
        }
    }, [product]);

    const bidMutation = useMutation({
        mutationFn: placeBid,
        onSuccess: () => {
            setFeedback({ type: 'success', text: "Bid Accepted! You are the highest bidder." });
            setAmount("");
            queryClient.invalidateQueries({ queryKey: ["product", id] });
            setTimeout(() => setFeedback(null), 3000);
        },
        onError: (error) => {
            setFeedback({ type: 'error', text: error.message });
        }
    });

    const handleSubmit = () => {
        setFeedback(null);
        if (!product || !amount) return;

        if (isAuctionEnded) {
            setFeedback({ type: 'error', text: "This auction has ended." });
            return;
        }

        const bidValue = parseFloat(amount);
        if (isNaN(bidValue)) {
            setFeedback({ type: 'error', text: "Please enter a valid amount." });
            return;
        }
        bidMutation.mutate({ productId: product.id, amount: bidValue });
    };

    if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-600">Loading details...</div>;
    if (error || !product) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-red-500">Product not found.</div>;

    const displayPrice = product.currentPrice || product.startPrice;

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans">
            <nav className="p-6 border-b border-neutral-800">
                <Link to="/" className="text-neutral-400 hover:text-amber-500 transition-colors">
                    ← Back to Auction House
                </Link>
            </nav>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="relative group">
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 opacity-20 blur-xl"></div>
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="relative w-full rounded-2xl border border-neutral-800 shadow-2xl object-cover aspect-square"
                        />
                    </div>

                    <div className="flex flex-col justify-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{product.title}</h1>
                        <p className="text-neutral-400 text-lg leading-relaxed mb-8">{product.description}</p>

                        <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 shadow-lg">
                            <div className="mb-6 flex justify-between items-end">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Current Price</p>
                                    <p className="text-5xl font-mono font-bold text-amber-500">
                                        ${displayPrice.toLocaleString()}
                                    </p>
                                </div>

                                {/* 👇 2. AQUI ESTÁ A MUDANÇA: Usamos o Countdown em vez do texto fixo */}
                                <div className="text-right">
                                    <p className="text-xs text-neutral-500 mb-1">Time Remaining</p>
                                    <Countdown
                                        targetDate={product.endsAt}
                                        onExpire={() => setIsAuctionEnded(true)}
                                    />
                                </div>
                            </div>

                            {feedback && (
                                <div className={`mb-4 rounded p-3 text-sm font-medium border ${
                                    feedback.type === 'success'
                                        ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-400"
                                        : "bg-red-900/30 border-red-500/30 text-red-400"
                                }`}>
                                    {feedback.type === 'success' ? "✨ " : "⚠️ "}
                                    {feedback.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={isAuctionEnded ? "Auction Closed" : `Enter more than $${displayPrice}`}
                                    disabled={isAuctionEnded}
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />

                                <button
                                    onClick={handleSubmit}
                                    disabled={bidMutation.isPending || isAuctionEnded}
                                    className={`w-full font-bold uppercase tracking-wider py-4 rounded-lg transition-transform active:scale-95 cursor-pointer
                                        ${isAuctionEnded
                                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                        : bidMutation.isPending
                                            ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                            : "bg-amber-600 text-black hover:bg-amber-500"
                                    }`}
                                >
                                    {isAuctionEnded
                                        ? "Auction Ended"
                                        : bidMutation.isPending ? "Processing..." : "Place Bid"
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}