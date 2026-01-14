import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Import Components & Pages
import { ProductGrid } from "./components/ProductGrid";
import { SearchBar } from "./components/SearchBar"; // 👈 New Import
import ProductPage from "./views/ProductPage";
import MyBidsPage from "./views/MyBidsPage";
import CreateAuctionPage from "./views/CreateAuctionPage";
import WalletPage from "./views/WalletPage";

// 1. Session Interface
interface SessionData {
    user?: { name: string; email: string; image?: string; };
}

const fetchSession = async (): Promise<SessionData> => {
    const res = await fetch("/api/auth/get-session");
    if (!res.ok) throw new Error("Error fetching session");
    return res.json();
};

// 2. Home Component (Dashboard)
function Home({ session }: { session: any }) {
    // 👇 State for Filtering
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("ending_soon");

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
                <div className="text-xl font-bold tracking-tighter text-amber-500">AUCTION<span className="text-white">HOUSE</span></div>

                <div className="flex items-center gap-4">
                    <Link to="/sell" className="hidden md:block bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider">
                        + Sell Item
                    </Link>

                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold">{session.user.name}</p>
                        <div className="flex gap-3 justify-end mt-1">
                            <Link to="/wallet" className="text-xs text-emerald-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                                Wallet
                            </Link>
                            <span className="text-neutral-700">|</span>
                            <Link to="/my-bids" className="text-xs text-amber-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                                My Bids
                            </Link>
                        </div>
                    </div>

                    <img src={session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="h-10 w-10 rounded-full border border-neutral-700" alt="User" />
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Live Auctions</h2>
                    <p className="text-neutral-400">Discover rare items available for bidding today.</p>
                </div>

                {/* 👇 Search & Sort Bar */}
                <SearchBar
                    search={search} setSearch={setSearch}
                    sort={sort} setSort={setSort}
                />

                {/* 👇 Grid with Filter Props */}
                <ProductGrid search={search} sort={sort} />
            </main>
        </div>
    );
}

// 3. Main Router
export default function App() {
    const { data: session, isLoading } = useQuery({
        queryKey: ["session"],
        queryFn: fetchSession,
        retry: false,
    });

    const handleLogin = async () => {
        try {
            const response = await fetch("/api/auth/sign-in/social", {
                method: "POST", body: JSON.stringify({ provider: "google" }), headers: { "Content-Type": "application/json" }
            });
            const json = await response.json();
            if (json.url) window.location.href = json.url;
        } catch (err) { console.error(err); }
    };

    if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-600">Loading...</div>;

    if (!session?.user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6">
                <div className="w-full max-w-sm overflow-hidden rounded-xl bg-neutral-900 shadow-2xl border border-neutral-800 text-center">
                    <div className="h-2 bg-gradient-to-r from-amber-700 to-yellow-500"></div>
                    <div className="p-8">
                        <h2 className="mb-2 text-3xl font-bold text-white tracking-tight">Auction House</h2>
                        <p className="mb-8 text-neutral-400 text-sm">Exclusive access for members only.</p>
                        <button onClick={handleLogin} className="block w-full rounded-lg bg-amber-600 px-4 py-3 text-black font-bold uppercase tracking-wider hover:bg-amber-500 transition-all cursor-pointer">
                            Enter Platform
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home session={session} />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/my-bids" element={<MyBidsPage />} />
                <Route path="/sell" element={<CreateAuctionPage />} />
                <Route path="/wallet" element={<WalletPage />} />
            </Routes>
        </BrowserRouter>
    );
}