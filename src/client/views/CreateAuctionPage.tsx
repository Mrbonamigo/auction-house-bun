import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

export default function CreateAuctionPage() {
    const navigate = useNavigate();

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startPrice, setStartPrice] = useState("");
    const [durationDays, setDurationDays] = useState("3");

    // 👇 NEW: Store the actual File object
    const [imageFile, setImageFile] = useState<File | null>(null);
    // 👇 NEW: Temporary URL for preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!imageFile) throw new Error("Please select an image");

            // 1. Build FormData object (Required for file uploads)
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("startPrice", startPrice);
            formData.append("durationDays", durationDays);
            formData.append("image", imageFile); // Attach binary file

            // 2. Send as Multipart Request
            const res = await fetch("/api/products", {
                method: "POST",
                // Note: Do NOT set Content-Type header manually for FormData.
                // The browser sets it automatically with the correct boundary.
                body: formData,
            });

            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (data) => {
            navigate(`/product/${data.id}`);
        },
        onError: (error) => {
            alert("Error: " + error.message);
        }
    });

    // Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Generate a local preview URL
            setPreviewUrl(URL.createObjectURL(file));
        }
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

                <div className="space-y-6 bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl">

                    {/* Title Input */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Item Title</label>
                        <input
                            value={title} onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none"
                            placeholder="e.g., Vintage Rolex Submariner"
                        />
                    </div>

                    {/* 📸 Image Upload Area */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Item Photo</label>

                        <div className="border-2 border-dashed border-neutral-800 rounded-xl p-6 text-center hover:border-amber-600/50 transition-colors relative bg-neutral-950 group">
                            {/* Invisible Input covering the whole area */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {previewUrl ? (
                                <div className="relative">
                                    <img src={previewUrl} alt="Preview" className="h-64 mx-auto rounded-lg object-contain shadow-lg" />
                                    <p className="text-xs text-neutral-500 mt-2">Click to change photo</p>
                                </div>
                            ) : (
                                <div className="text-neutral-500 py-8 group-hover:text-amber-500 transition-colors">
                                    <p className="text-4xl mb-3">📷</p>
                                    <p className="text-sm font-bold uppercase">Click or Drag photo here</p>
                                    <p className="text-xs text-neutral-600 mt-1">Supports JPG, PNG, WEBP</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Description</label>
                        <textarea
                            rows={4}
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Start Price */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Start Price ($)</label>
                            <input
                                type="number" min="1"
                                value={startPrice} onChange={(e) => setStartPrice(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Duration</label>
                            <select
                                value={durationDays} onChange={(e) => setDurationDays(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white focus:border-amber-600 outline-none"
                            >
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="7">7 Days</option>
                                <option value="14">14 Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending}
                        className="w-full bg-amber-600 text-black font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-amber-500 transition-colors mt-4"
                    >
                        {createMutation.isPending ? "Uploading..." : "List Item for Auction"}
                    </button>

                </div>
            </div>
        </div>
    );
}