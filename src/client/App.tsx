import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Import Components & Pages
import { ProductGrid } from "./components/ProductGrid";
import ProductPage from "./views/ProductPage";
import MyBidsPage from "./views/MyBidsPage";
import CreateAuctionPage from "./views/CreateAuctionPage"; // 👈 New Import

// 1. Session Interface
interface SessionData {
    user?: {
        name: string;
        email: string;
        image?: string;
    };
}

// Fetcher to check if user is logged in
const fetchSession = async (): Promise<SessionData> => {
    const res = await fetch("/api/auth/get-session");
    if (!res.ok) throw new Error("Error fetching session");
    return res.json();
};

// 2. Home Component (Dashboard) 🏠
function Home({ session }: { session: any }) {
    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            {/* Header / Navigation Bar */}
            <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
                <div className="text-xl font-bold tracking-tighter text-amber-500">AUCTION<span className="text-white">HOUSE</span></div>

                <div className="flex items-center gap-4">
                    {/* 👇 NEW BUTTON: Sell Item */}
                    <Link
                        to="/sell"
                        className="hidden md:block bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider"
                    >
                        + Sell Item
                    </Link>

                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold">{session.user.name}</p>

                        {/* Link to My Bids Page */}
                        <Link to="/my-bids" className="text-xs text-amber-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                            View My Bids →
                        </Link>
                    </div>

                    <img
                        src={session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                        className="h-10 w-10 rounded-full border border-neutral-700"
                        alt="User Avatar"
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 py-12">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Live Auctions</h2>
                        <p className="text-neutral-400">Discover rare items available for bidding today.</p>
                    </div>
                </div>

                {/* The Grid of Products */}
                <ProductGrid />
            </main>
        </div>
    );
}

// 3. Main App Component (The Router) 🧭
export default function App() {
    const { data: session, isLoading } = useQuery({
        queryKey: ["session"],
        queryFn: fetchSession,
        retry: false,
    });

    const handleLogin = async () => {
        try {
            const response = await fetch("/api/auth/sign-in/social", {
                method: "POST",
                body: JSON.stringify({ provider: "google" }),
                headers: { "Content-Type": "application/json" }
            });
            const json = await response.json();
            if (json.url) window.location.href = json.url;
        } catch (err) { console.error(err); }
    };

    // Global Loading State
    if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-600">Loading...</div>;

    // Login Screen (If user is NOT authenticated) 🔒
    if (!session?.user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6">
                <div className="w-full max-w-sm overflow-hidden rounded-xl bg-neutral-900 shadow-2xl border border-neutral-800 text-center">
                    <div className="h-2 bg-gradient-to-r from-amber-700 to-yellow-500"></div>
                    <div className="p-8">
                        <h2 className="mb-2 text-3xl font-bold text-white tracking-tight">Auction House</h2>
                        <p className="mb-8 text-neutral-400 text-sm">Exclusive access for members only.</p>
                        <button
                            onClick={handleLogin}
                            className="block w-full rounded-lg bg-amber-600 px-4 py-3 text-black font-bold uppercase tracking-wider hover:bg-amber-500 transition-all cursor-pointer"
                        >
                            Enter Platform
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Router Configuration (If user IS authenticated) ✅
    return (
        <BrowserRouter>
            <Routes>
                {/* Dashboard (Home) */}
                <Route path="/" element={<Home session={session} />} />

                {/* Product Details */}
                <Route path="/product/:id" element={<ProductPage />} />

                {/* My Bids Portfolio */}
                <Route path="/my-bids" element={<MyBidsPage />} />

                {/* 👇 NEW ROUTE: Create Auction */}
                <Route path="/sell" element={<CreateAuctionPage />} />
            </Routes>
        </BrowserRouter>
    );
}