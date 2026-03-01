'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Crown, ShieldOff, Loader2, RefreshCw, Users } from 'lucide-react';

interface ClerkUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    premiumSince: string | null;
    createdAt: string;
    imageUrl: string;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function AdminUsersPage() {
    const { user, isLoaded } = useUser();
    const [users, setUsers] = useState<ClerkUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const r = await fetch('/api/admin/users');
            if (!r.ok) {
                setError(r.status === 403 ? 'Access denied — admins only.' : 'Failed to load users.');
                return;
            }
            const data = await r.json();
            setUsers(data.users);
        } catch {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const togglePremium = async (userId: string, currentValue: boolean) => {
        setToggling(userId);
        try {
            const r = await fetch(`/api/admin/users/${userId}/premium`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPremium: !currentValue }),
            });
            if (!r.ok) throw new Error('Failed');
            const data = await r.json();
            setUsers(prev => prev.map(u =>
                u.id === userId
                    ? { ...u, isPremium: data.isPremium, premiumSince: data.premiumSince }
                    : u
            ));
        } catch {
            alert('Failed to update. Try again.');
        } finally {
            setToggling(null);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f9fbfb]">
                <Loader2 className="h-6 w-6 animate-spin text-[#41b4a5]" />
            </div>
        );
    }

    const premiumCount = users.filter(u => u.isPremium).length;

    return (
        <div className="min-h-screen bg-[#f9fbfb] font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#41b4a5]/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#41b4a5]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">User Management</h1>
                        <p className="text-xs text-slate-400">Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Users</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-bold text-amber-500 uppercase">Premium</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{premiumCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase">Free</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{users.length - premiumCount}</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                        {error}
                    </div>
                )}

                {/* Users table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-[#41b4a5]" />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-slate-50">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Joined</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Avatar + name */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={u.imageUrl}
                                                    alt={u.email}
                                                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">
                                                        {u.firstName || u.lastName
                                                            ? `${u.firstName} ${u.lastName}`.trim()
                                                            : '—'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Joined date */}
                                        <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">
                                            {formatDate(u.createdAt)}
                                        </td>

                                        {/* Premium badge */}
                                        <td className="px-5 py-3">
                                            {u.isPremium ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                                                    <Crown className="h-3 w-3" /> Premium
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                    Free
                                                </span>
                                            )}
                                            {u.isPremium && u.premiumSince && (
                                                <p className="text-[10px] text-slate-400 mt-0.5 pl-1">since {formatDate(u.premiumSince)}</p>
                                            )}
                                        </td>

                                        {/* Toggle button */}
                                        <td className="px-5 py-3 text-right">
                                            <button
                                                onClick={() => togglePremium(u.id, u.isPremium)}
                                                disabled={toggling === u.id}
                                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${u.isPremium
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                        : 'bg-[#41b4a5]/10 text-[#369689] hover:bg-[#41b4a5]/20 border border-[#41b4a5]/20'
                                                    }`}
                                            >
                                                {toggling === u.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : u.isPremium ? (
                                                    <><ShieldOff className="h-3 w-3" /> Revoke</>
                                                ) : (
                                                    <><Crown className="h-3 w-3" /> Grant</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}
