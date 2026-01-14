import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Countdown } from "../components/Countdown"; // Reusing our countdown!

interface BidItem {
    productId: string;
    title: string;
    imageUrl: string;
    endsAt: number;
    myAmount: number;
    highestAmount: number;
    status: "WINNING" | "OUTBID";
    bidDate: number;
}

const fetchMyBids = async (): Promise<BidItem[]> => {
    const res = await fetch("/api/me/bids");
    if (!res.ok) throw new Error("Failed to load bids");
    return res.json();
};

export default function MyBidsPage() {
    const { data: bids, isLoading } = useQuery({
        queryKey: ["my-bids"],
        queryFn: fetchMyBids,
    });

    if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-600">Loading your portfolio...</div>;

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans">
            <nav className="p-6 border-b border-neutral-800 flex justify-between items-center">
                <Link to="/" className="text-neutral-400 hover:text-amber-500 transition-colors">
                    ← Back to Auction House
                </Link>
                <h1 className="text-xl font-bold tracking-widest text-white uppercase">My Portfolio</h1>
            </nav>

            <div className="container mx-auto px-6 py-12">
                {!bids || bids.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-neutral-500 mb-4">You haven't placed any bids yet.</p>
                        <Link to="/" className="text-amber-500 hover:underline">Start browsing auctions</Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bids.map((bid, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-center gap-6 bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-amber-600/30 transition-colors">

                                {/* Product Image */}
                                <Link to={`/product/${bid.productId}`} className="shrink-0 w-full md:w-32 h-32 rounded-lg overflow-hidden relative group">
                                    <img src={bid.imageUrl} alt={bid.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </Link>

                                {/* Details */}
                                <div className="flex-grow text-center md:text-left">
                                    <Link to={`/product/${bid.productId}`} className="text-lg font-bold hover:text-amber-500 transition-colors">
                                        {bid.title}
                                    </Link>
                                    <div className="text-sm text-neutral-500 mt-1 flex justify-center md:justify-start gap-2">
                                        <span>Ends in:</span>
                                        <Countdown targetDate={bid.endsAt} />
                                    </div>
                                </div>

                                {/* Status & Numbers */}
                                <div className="flex items-center gap-8 px-4">
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider">Your Bid</p>
                                        <p className="font-mono font-bold text-white">${bid.myAmount.toLocaleString()}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider">Current Highest</p>
                                        <p className="font-mono font-bold text-amber-500">${bid.highestAmount.toLocaleString()}</p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`px-4 py-2 rounded font-bold text-xs uppercase tracking-widest border ${
                                        bid.status === "WINNING"
                                            ? "bg-emerald-900/20 text-emerald-400 border-emerald-500/30"
                                            : "bg-red-900/20 text-red-400 border-red-500/30"
                                    }`}>
                                        {bid.status}
                                    </div>

                                    <Link to={`/product/${bid.productId}`} className="p-2 rounded bg-neutral-800 hover:bg-white hover:text-black transition-colors">
                                        ↗
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}