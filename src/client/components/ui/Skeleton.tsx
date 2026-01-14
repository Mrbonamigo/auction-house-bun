import React from "react";

interface SkeletonProps {
    className?: string;
}

// A simple component that pulses to indicate loading
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-neutral-800 rounded-md ${className}`} />
    );
}