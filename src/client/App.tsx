import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// 1. Components
import { ProductGrid } from "./components/ProductGrid";
import { SearchBar } from "./components/SearchBar";
import { UserMenu } from "./components/UserMenu";

// 2. Views / Pages
import ProductPage from "./views/ProductPage";
import MyBidsPage from "./views/MyBidsPage";
import CreateAuctionPage from "./views/CreateAuctionPage";
import WalletPage from "./views/WalletPage";
import LoginPage from "./views/LoginPage";
import SignUpPage from "./views/SignUpPage";
import NotFoundPage from "./views/NotFoundPage"; // 👈 Ensure this file exists

// Session Interface
interface SessionData {
    user?: { name: string; email: string; image?: string; };
}

const fetchSession = async (): Promise<SessionData> => {
    const res = await fetch("/api/auth/get-session");
    if (!res.ok) throw new Error("Error fetching session");
    return res.json();
};

// -----------------------------------------------------------------------------
// 🏠 HOME COMPONENT (Dashboard)
// -----------------------------------------------------------------------------
function Home({ session }: { session: any }) {
    // State for Search & Filter
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("ending_soon");

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">

            {/* HEADER */}
            <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center transition-all">
                <Link to="/" className="text-xl font-bold tracking-tighter text-amber-500 cursor-pointer hover:opacity-80">
                    AUCTION<span className="text-white">HOUSE</span>
                </Link>

                <div className="flex items-center gap-6">
                    {/* Sell Button */}
                    <Link to="/sell" className="hidden md:block bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider">
                        + Sell Item
                    </Link>

                    {/* User Dropdown Menu */}
                    <UserMenu user={session.user} />
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="container mx-auto px-6 py-12">
                <div className="mb-8 animate-fade-in">
                    <h2 className="text-3xl font-bold text-white mb-2">Live Auctions</h2>
                    <p className="text-neutral-400">Discover rare items available for bidding today.</p>
                </div>

                {/* Search Bar */}
                <SearchBar
                    search={search} setSearch={setSearch}
                    sort={sort} setSort={setSort}
                />

                {/* Product Grid (Receives filters) */}
                <ProductGrid search={search} sort={sort} />
            </main>
        </div>
    );
}

// -----------------------------------------------------------------------------
// 🧭 MAIN APP (Router Logic)
// -----------------------------------------------------------------------------
export default function App() {
    const { data: session, isLoading } = useQuery({
        queryKey: ["session"],
        queryFn: fetchSession,
        retry: false,
    });

    // Global Loading State
    if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-600 animate-pulse">Loading Platform...</div>;

    return (
        <BrowserRouter>
            <Routes>
                {/* --- PUBLIC ROUTES --- */}
                {/* Logic: If user is logged in, send them to Home. Else, show Login/Signup. */}
                <Route path="/login" element={session?.user ? <Home session={session} /> : <LoginPage />} />
                <Route path="/signup" element={session?.user ? <Home session={session} /> : <SignUpPage />} />

                {/* --- PROTECTED ROUTES --- */}
                {/* Logic: Only render these if user exists. */}
                {session?.user ? (
                    <>
                        <Route path="/" element={<Home session={session} />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                        <Route path="/my-bids" element={<MyBidsPage />} />
                        <Route path="/sell" element={<CreateAuctionPage />} />
                        <Route path="/wallet" element={<WalletPage />} />

                        {/* 404 PAGE: This catches any URL that doesn't match the above */}
                        <Route path="*" element={<NotFoundPage />} />
                    </>
                ) : (
                    // --- GUEST CATCH-ALL ---
                    // If a guest tries to access /wallet or a random URL, send them to Login
                    <Route path="*" element={<LoginPage />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}