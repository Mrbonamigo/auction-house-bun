import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center p-6 font-sans">

            {/* O número gigante 404 */}
            <h1 className="text-9xl font-black text-neutral-800 select-none mb-4">
                404
            </h1>

            {/* O Texto Explicativo */}
            <div className="z-10 -mt-12 bg-neutral-950/80 backdrop-blur-sm p-6 rounded-xl border border-neutral-800">
                <h2 className="text-3xl font-bold text-amber-500 mb-2">Lot Not Found</h2>
                <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                    The item you are looking for has been moved to the vault or never existed.
                </p>

                <Link
                    to="/"
                    className="inline-block bg-white text-black hover:bg-neutral-200 font-bold py-3 px-8 rounded-lg uppercase tracking-wider transition-colors"
                >
                    Return to Lobby
                </Link>
            </div>
        </div>
    );
}