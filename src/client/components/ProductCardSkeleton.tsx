import React from "react";
import { Skeleton } from "./ui/Skeleton";

export function ProductCardSkeleton() {
    return (
        <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg">
            {/* Image Placeholder */}
            <div className="aspect-[4/3] w-full bg-neutral-800 animate-pulse" />

            <div className="p-5 space-y-4">
                {/* Title Line */}
                <Skeleton className="h-6 w-3/4" />

                {/* Description Lines */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>

                {/* Footer (Price & Button) */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
                </div>
            </div>
        </div>
    );
}