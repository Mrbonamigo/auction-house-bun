import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// 1. Define Product Shape
interface Product {
    id: string;
    title: string;
    description: string;
    startPrice: number;
    imageUrl: string;
    endsAt: number;
}

// 👇 NEW: Interface for props
interface ProductGridProps {
    search: string;
    sort: string;
}

// Updated fetcher to handle keys
const fetchProducts = async ({ queryKey }: any): Promise<Product[]> => {
    // Extract search and sort from the Query Key
    const [_, { search, sort }] = queryKey;

    // Pass them to the API
    const res = await fetch(`/api/products?q=${encodeURIComponent(search)}&sort=${sort}`);
    if (!res.ok) throw new Error("Failed to load auction items");
    return res.json();
};

export function ProductGrid({ search, sort }: ProductGridProps) {
    const { data: products, isLoading } = useQuery({
        // 👇 Key includes filters. If filters change, React Query re-fetches automatically.
        queryKey: ["products", { search, sort }],
        queryFn: fetchProducts,
        refetchInterval: 2000,
    });

    if (isLoading) return <div className="text-center text-neutral-500 py-10">Loading Collection...</div>;
    if (!products || products.length === 0) return <div className="text-center text-neutral-500 py-10">No items found.</div>;

    // 2. The Grid Layout
    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <div key={product.id} className="group relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-600/50 transition-colors duration-300 shadow-lg">

                    {/* Link Image */}
                    <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden cursor-pointer">
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                    </Link>

                    <div className="p-5">
                        {/* Link Title */}
                        <Link to={`/product/${product.id}`} className="block">
                            <h3 className="text-lg font-bold text-white truncate mb-1 hover:text-amber-500 transition-colors cursor-pointer">
                                {product.title}
                            </h3>
                        </Link>

                        <p className="text-xs text-neutral-400 line-clamp-2 mb-4 h-8">{product.description}</p>

                        <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">Current Bid</p>
                                <p className="text-amber-500 font-bold font-mono text-lg">
                                    ${product.startPrice.toLocaleString()}
                                </p>
                            </div>

                            {/* Link Button */}
                            <Link
                                to={`/product/${product.id}`}
                                className="rounded bg-neutral-800 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-amber-600 transition-colors cursor-pointer"
                            >
                                Bid Now
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}