'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AccessPage() {
    const [accessCode, setAccessCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleAccessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Validate access code with server
            const response = await fetch('/api/access-code/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessCode }),
            });

            const result = await response.json();

            if (!result.valid) {
                setError('Invalid or expired access code. Please contact the administrator.');
                setIsSubmitting(false);
                return;
            }

            // Set access code in cookie and redirect (7 days for partner security)
            document.cookie = `travel-access-code=${accessCode}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

            // Try to redirect to search page
            window.location.href = '/search';
        } catch (error) {
            setError('Unable to validate access code. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl">✈️</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h1>
                        <p className="text-gray-600">
                            Travel Conductor is currently in private beta. Enter your access code to continue.
                        </p>
                    </div>

                    <form onSubmit={handleAccessSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Access Code
                            </label>
                            <input
                                type="text"
                                id="accessCode"
                                required
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter your access code"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !accessCode}
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Verifying...' : 'Access Platform'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            Don't have an access code?
                        </p>
                        <Link
                            href="/#access"
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Request Access
                        </Link>
                    </div>
                </div>

                {/* Quick Access for Development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="text-sm font-medium text-yellow-800 mb-2">Development Access Codes:</h3>
                        <div className="text-xs text-yellow-700 space-y-1">
                            <div>• <code>dev-access-2024</code> - Developer access</div>
                            <div>• <code>partner-preview</code> - Partner preview</div>
                            <div>• <code>admin-access</code> - Admin access</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
