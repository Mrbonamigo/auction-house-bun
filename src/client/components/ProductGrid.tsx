import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ProductCardSkeleton } from "./ProductCardSkeleton"; // 👈 Import Skeleton

interface Product {
    id: string;
    title: string;
    description: string;
    startPrice: number;
    imageUrl: string;
    endsAt: number;
}

interface ProductGridProps {
    search: string;
    sort: string;
}

const fetchProducts = async ({ queryKey }: any): Promise<Product[]> => {
    const [_, { search, sort }] = queryKey;
    const res = await fetch(`/api/products?q=${encodeURIComponent(search)}&sort=${sort}`);
    if (!res.ok) throw new Error("Failed to load auction items");
    return res.json();
};

export function ProductGrid({ search, sort }: ProductGridProps) {
    const { data: products, isLoading } = useQuery({
        queryKey: ["products", { search, sort }],
        queryFn: fetchProducts,
        refetchInterval: 2000,
    });

    // 👇 IMPROVED LOADING STATE
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Show 8 skeletons while loading */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20 bg-neutral-900/50 rounded-xl border border-neutral-800 border-dashed">
                <p className="text-4xl mb-4">🕵️‍♂️</p>
                <h3 className="text-xl font-bold text-white">No items found</h3>
                <p className="text-neutral-500">Try adjusting your search filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            {products.map((product) => (
                <div key={product.id} className="group relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-600/50 transition-colors duration-300 shadow-lg">

                    <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden cursor-pointer">
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                    </Link>

                    <div className="p-5">
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