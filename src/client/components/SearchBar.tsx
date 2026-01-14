import React from "react";

interface SearchBarProps {
    search: string;
    setSearch: (val: string) => void;
    sort: string;
    setSort: (val: string) => void;
}

export function SearchBar({ search, setSearch, sort, setSort }: SearchBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 backdrop-blur-sm shadow-lg">

            {/* 🔍 Search Input */}
            <div className="flex-grow relative">
                <input
                    type="text"
                    placeholder="Search for luxury items (e.g. Rolex, Cobra)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 pl-10 rounded-lg focus:border-amber-600 outline-none transition-colors placeholder-neutral-600"
                />
                <span className="absolute left-3 top-3.5 text-neutral-500">🔍</span>
            </div>

            {/* 🔃 Sort Dropdown */}
            <div className="md:w-48">
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-lg focus:border-amber-600 outline-none cursor-pointer appearance-none"
                >
                    <option value="ending_soon">⏳ Ending Soon</option>
                    <option value="newest">✨ Newest First</option>
                    <option value="price_asc">💲 Price: Low to High</option>
                    <option value="price_desc">💎 Price: High to Low</option>
                </select>
            </div>
        </div>
    );
}