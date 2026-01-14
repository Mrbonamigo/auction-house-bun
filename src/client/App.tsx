import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Import Components
import { ProductGrid } from "./components/ProductGrid";
import { SearchBar } from "./components/SearchBar";
import { UserMenu } from "./components/UserMenu"; // 👈 New Import
import ProductPage from "./views/ProductPage";
import MyBidsPage from "./views/MyBidsPage";
import CreateAuctionPage from "./views/CreateAuctionPage";
import WalletPage from "./views/WalletPage";
import LoginPage from "./views/LoginPage";
import SignUpPage from "./views/SignUpPage";

// Session Interface
interface SessionData {
    user?: { name: string; email: string; image?: string; };
}

const fetchSession = async (): Promise<SessionData> => {
    const res = await fetch("/api/auth/get-session");
    if (!res.ok) throw new Error("Error fetching session");
    return res.json();
};

// Home Component
function Home({ session }: { session: any }) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("ending_soon");

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            {/* CLEANER HEADER 🧼 */}
            <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold tracking-tighter text-amber-500 cursor-pointer">
                    AUCTION<span className="text-white">HOUSE</span>
                </Link>

                <div className="flex items-center gap-6">
                    {/* Quick Action: Sell */}
                    <Link to="/sell" className="hidden md:block bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider">
                        + Sell Item
                    </Link>

                    {/* 👇 The New Dropdown Menu */}
                    <UserMenu user={session.user} />
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Live Auctions</h2>
                    <p className="text-neutral-400">Discover rare items available for bidding today.</p>
                </div>

                <SearchBar search={search} setSearch={setSearch} sort={sort} setSort={setSort} />
                <ProductGrid search={search} sort={sort} />
            </main>
        </div>
    );
}

// Main Router (Unchanged)
export default function App() {
    const { data: session, isLoading } = useQuery({
        queryKey: ["session"],
        queryFn: fetchSession,
        retry: false,
    });

    if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-600">Loading...</div>;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={session?.user ? <Home session={session} /> : <LoginPage />} />
                <Route path="/signup" element={session?.user ? <Home session={session} /> : <SignUpPage />} />

                {session?.user ? (
                    <>
                        <Route path="/" element={<Home session={session} />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                        <Route path="/my-bids" element={<MyBidsPage />} />
                        <Route path="/sell" element={<CreateAuctionPage />} />
                        <Route path="/wallet" element={<WalletPage />} />
                    </>
                ) : (
                    <Route path="*" element={<LoginPage />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}