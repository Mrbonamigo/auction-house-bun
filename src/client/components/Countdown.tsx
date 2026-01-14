import React, { useState, useEffect } from "react";

interface CountdownProps {
    targetDate: number; // Timestamp in milliseconds
    onExpire?: () => void; // Optional callback when time runs out
}

export function Countdown({ targetDate, onExpire }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = targetDate - Date.now();

        if (difference <= 0) {
            return null;
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            // If time ran out, clear interval and trigger callback
            if (!remaining) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // Render Logic 🎨
    if (!timeLeft) {
        return <span className="text-red-500 font-bold uppercase tracking-wider">Closed</span>;
    }

    // Urgent Style (Less than 1 hour)
    const isUrgent = timeLeft.days === 0 && timeLeft.hours === 0;

    return (
        <div className={`font-mono font-bold text-lg tracking-widest ${isUrgent ? "text-red-500 animate-pulse" : "text-white"}`}>
            {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
            <span>{String(timeLeft.hours).padStart(2, '0')}h </span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}m </span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
    );
}