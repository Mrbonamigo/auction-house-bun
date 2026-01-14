import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

export default function CreateAuctionPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startPrice: "",
        imageUrl: "",
        durationDays: "3" // Default to 3 days
    });

    // Mutation to send data to server
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (data) => {
            // Redirect to the new product page immediately
            navigate(`/product/${data.id}`);
        },
        onError: (error) => {
            alert("Error creating auction: " + error.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            startPrice: parseFloat(formData.startPrice),
            durationDays: parseInt(formData.durationDays)
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans">
            <nav className="p-6 border-b border-neutral-800">
                <Link to="/" className="text-neutral-400 hover:text-amber-500 transition-colors">
                    ← Cancel
                </Link>
            </nav>

            <div className="container mx-auto px-6 py-12 max-w-2xl">
                <h1 className="text-3xl font-bold mb-2">Sell an Item</h1>
                <p className="text-neutral-400 mb-8">List your luxury item for auction.</p>

                <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl">

                    {/* Title */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Item Title</label>
                        <input
                            name="title" required
                            value={formData.title} onChange={handleChange}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none transition-colors"
                            placeholder="e.g., Vintage Rolex Submariner"
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Image URL</label>
                        <input
                            name="imageUrl" required
                            value={formData.imageUrl} onChange={handleChange}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none transition-colors"
                            placeholder="https://..."
                        />
                        <p className="text-[10px] text-neutral-600 mt-1">Paste a link from Unsplash or your image host.</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Description</label>
                        <textarea
                            name="description" required rows={4}
                            value={formData.description} onChange={handleChange}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none transition-colors"
                            placeholder="Describe the condition, history, and details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Start Price */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Start Price ($)</label>
                            <input
                                type="number" name="startPrice" required min="1"
                                value={formData.startPrice} onChange={handleChange}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none transition-colors"
                                placeholder="100.00"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Duration</label>
                            <select
                                name="durationDays"
                                value={formData.durationDays} onChange={handleChange}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none transition-colors"
                            >
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="7">7 Days</option>
                                <option value="14">14 Days</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full bg-amber-600 text-black font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-amber-500 transition-colors mt-4"
                    >
                        {createMutation.isPending ? "Creating Auction..." : "List Item for Auction"}
                    </button>

                </form>
            </div>
        </div>
    );
}