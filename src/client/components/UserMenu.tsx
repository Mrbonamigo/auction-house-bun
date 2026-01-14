import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        image?: string;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle Logout
    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/login"; // Force reload to clear session
    };

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 focus:outline-none group"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">
                        {user.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Member</p>
                </div>
                <img
                    src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    className={`h-10 w-10 rounded-full border-2 transition-colors ${isOpen ? "border-amber-500" : "border-neutral-700"}`}
                    alt="User Avatar"
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 animate-fade-in">

                    {/* Header info (Mobile mainly) */}
                    <div className="px-4 py-3 border-b border-neutral-800 sm:hidden">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <Link
                        to="/wallet"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400 transition-colors"
                    >
                        💰 Digital Wallet
                    </Link>

                    <Link
                        to="/my-bids"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-amber-500 transition-colors"
                    >
                        📊 My Bids Portfolio
                    </Link>

                    <Link
                        to="/sell"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        🔨 Sell an Item
                    </Link>

                    <div className="border-t border-neutral-800 my-1"></div>

                    {/* Logout Button */}
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors font-bold"
                    >
                        🚪 Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}