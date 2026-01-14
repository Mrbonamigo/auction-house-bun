import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

// Fetch Stats
const fetchStats = async () => {
    const res = await fetch("/api/admin/stats");
    if (res.status === 403) throw new Error("Access Denied");
    return res.json();
};

// Fetch Users
const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    return res.json();
};

export default function AdminPage() {
    const { data: stats, error } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });
    const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });

    // Unauthorized Access View
    if (error) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-red-500">
                <h1 className="text-4xl font-bold mb-4">⛔ ACCESS DENIED</h1>
                <p>You do not have clearance to view this area.</p>
                <Link to="/" className="mt-4 text-white underline">Return to safety</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans">
            <nav className="p-6 border-b border-neutral-800 bg-red-900/10">
                <div className="flex justify-between items-center container mx-auto">
                    <h1 className="text-xl font-bold tracking-widest text-red-500 uppercase">Admin Console</h1>
                    <Link to="/" className="text-sm text-neutral-400 hover:text-white">Exit Mode</Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12">

                {/* 1. KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard label="Total Users" value={stats?.users} icon="👤" />
                    <StatCard label="Active Auctions" value={stats?.products} icon="🔨" />
                    <StatCard label="Total Deposits" value={`$${stats?.money?.toLocaleString()}`} icon="💰" />
                    <StatCard label="Total Bids" value={stats?.bids} icon="⚡" />
                </div>

                {/* 2. USERS TABLE */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="p-6 border-b border-neutral-800">
                        <h3 className="font-bold text-lg">User Database</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-neutral-950 text-neutral-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3 text-right">Balance</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                            {users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-neutral-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${user.role === 'admin' ? 'bg-red-900/30 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}>
                                                {user.role}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-500">
                                        ${user.balance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 flex items-center gap-4">
            <div className="text-3xl bg-neutral-800 w-12 h-12 flex items-center justify-center rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-neutral-500 text-xs uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-bold text-white">{value ?? "..."}</p>
            </div>
        </div>
    );
}