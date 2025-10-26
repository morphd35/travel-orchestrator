'use client';

import { useState, useEffect } from 'react';
import { getCityFromIATA } from '@/lib/iataCity';
import { useAuth } from '@/lib/auth';

interface Watch {
    id: string;
    userId: string;
    origin: string;
    destination: string;
    start: string;
    end: string;
    targetUsd: number;
    cabin: string;
    adults: number;
    maxStops: number;
    flexDays: number;
    active: boolean;
    lastBestUsd?: number;
    lastNotifiedUsd?: number;
    createdAt: string;
    updatedAt: string;
    source?: 'edge' | 'api'; // Track which system the watch came from
}

interface TriggerResult {
    action: 'NOTIFY' | 'NOOP';
    priceChange?: number;
    currentPrice?: number;
    message?: string;
}

export default function WatchesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [watches, setWatches] = useState<Watch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [triggerResults, setTriggerResults] = useState<Record<string, TriggerResult>>({});
    const [triggeringWatches, setTriggeringWatches] = useState<Set<string>>(new Set());

    // Load watches from unified Edge system, filtered by user
    const loadWatches = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const response = await fetch(`/edge/watch?userId=${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to load watches');
            }
            const data = await response.json();
            const allWatches = Array.isArray(data) ? data : (data.watches || []);
            setWatches(allWatches.map((watch: any) => ({ ...watch, source: 'edge' as const })));
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to load watches:', err);
        } finally {
            setLoading(false);
        }
    };

    // Toggle watch active status
    const toggleWatch = async (watchId: string, currentActive: boolean) => {
        try {
            const response = await fetch(`/edge/watch?id=${watchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentActive })
            });

            if (!response.ok) {
                throw new Error('Failed to update watch');
            }

            // Refresh watches to show updated status
            await loadWatches();
        } catch (err: any) {
            alert('Failed to update watch: ' + err.message);
        }
    };

    // Trigger a watch check
    const triggerWatch = async (watchId: string) => {
        try {
            setTriggeringWatches(prev => new Set([...prev, watchId]));

            const response = await fetch(`/edge/watch/${watchId}/trigger`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to trigger watch');
            }

            const result = await response.json();

            // Store the result for display
            setTriggerResults(prev => ({
                ...prev,
                [watchId]: result
            }));

            // Refresh watches to show updated prices
            await loadWatches();

        } catch (err: any) {
            alert('Failed to trigger watch: ' + err.message);
        } finally {
            setTriggeringWatches(prev => {
                const newSet = new Set(prev);
                newSet.delete(watchId);
                return newSet;
            });
        }
    };

    // Delete a watch
    const deleteWatch = async (watchId: string, routeName: string) => {
        if (!confirm(`Are you sure you want to delete the watch for ${routeName}?`)) {
            return;
        }

        try {
            const response = await fetch(`/edge/watch?id=${watchId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete watch');
            }

            // Refresh watches list
            await loadWatches();
            alert('Watch deleted successfully!');

        } catch (err: any) {
            alert('Failed to delete watch: ' + err.message);
        }
    };

    // Edit a watch (simple inline edit for target price)
    const editWatch = async (watchId: string, currentTarget: number) => {
        const newTarget = prompt(`Enter new target price:`, currentTarget.toString());
        if (newTarget === null || newTarget === '') return;

        const targetPrice = parseFloat(newTarget);
        if (isNaN(targetPrice) || targetPrice <= 0) {
            alert('Please enter a valid price.');
            return;
        }

        try {
            const response = await fetch(`/edge/watch?id=${watchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsd: targetPrice })
            });

            if (!response.ok) {
                throw new Error('Failed to update watch');
            }

            // Refresh watches to show updated target
            await loadWatches();
            alert(`Target price updated to $${targetPrice}!`);

        } catch (err: any) {
            alert('Failed to update watch: ' + err.message);
        }
    };

    // Load watches on component mount, but only after auth is ready
    useEffect(() => {
        if (!authLoading && user) {
            loadWatches();
        }
    }, [authLoading, user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading your watches...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
                        <p className="text-gray-600 mb-8">Please sign in to view your price watches.</p>
                        <a 
                            href="/"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Price Watches</h1>
                        <p className="text-slate-600">Monitor flight prices and get notified when they drop</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadWatches}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">❌ {error}</p>
                    </div>
                )}

                {watches.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No Watches Yet</h3>
                        <p className="text-slate-600 mb-6">Start monitoring flight prices by creating your first watch.</p>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Your First Watch
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {watches.length} {watches.length === 1 ? 'Watch' : 'Watches'}
                            </h2>
                            <a
                                href="/"
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add New Watch
                            </a>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Route</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Window</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Target</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Last Best</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Last Notified</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {watches.map((watch) => (
                                            <tr key={watch.id} className="hover:bg-slate-50">
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-semibold text-slate-900">
                                                            {getCityFromIATA(watch.origin)} → {getCityFromIATA(watch.destination)}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {watch.origin} → {watch.destination}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-slate-600">
                                                        <div>{watch.start}</div>
                                                        <div>to {watch.end}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-green-600">
                                                        ${watch.targetUsd}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {watch.cabin} • {watch.adults} adults
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {watch.lastBestUsd ? (
                                                        <div className="font-semibold text-slate-900">
                                                            ${watch.lastBestUsd}
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-500">Not checked</div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {watch.lastNotifiedUsd ? (
                                                        <div className="font-semibold text-slate-900">
                                                            ${watch.lastNotifiedUsd}
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-500">Never</div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button
                                                        onClick={() => toggleWatch(watch.id, watch.active)}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${watch.active
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {watch.active ? '✅ Active' : '⏸️ Paused'}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => triggerWatch(watch.id)}
                                                            disabled={triggeringWatches.has(watch.id)}
                                                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                                                        >
                                                            {triggeringWatches.has(watch.id) ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                                                                    <span>Checking...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>🔍</span>
                                                                    <span>Check Now</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={() => editWatch(watch.id, watch.targetUsd)}
                                                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                                                        >
                                                            <span>✏️</span>
                                                            <span>Edit</span>
                                                        </button>

                                                        <button
                                                            onClick={() => deleteWatch(watch.id, `${getCityFromIATA(watch.origin)} → ${getCityFromIATA(watch.destination)}`)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                                                        >
                                                            <span>🗑️</span>
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>

                                                    {/* Show trigger result */}
                                                    {triggerResults[watch.id] && (
                                                        <div className="mt-2 text-xs">
                                                            {triggerResults[watch.id].action === 'NOTIFY' ? (
                                                                <div className="text-green-600 font-semibold">
                                                                    📧 Notification sent!
                                                                </div>
                                                            ) : (
                                                                <div className="text-slate-500">
                                                                    ✅ No action needed
                                                                </div>
                                                            )}
                                                            {triggerResults[watch.id].currentPrice && (
                                                                <div className="text-slate-600">
                                                                    Current: ${triggerResults[watch.id].currentPrice}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
