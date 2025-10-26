'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import AuthModal from './AuthModal';

// Helper function to convert airport codes to destination slugs
function getDestinationSlug(airportCode: string): string {
    const destinationMap: Record<string, string> = {
        'FCO': 'rome', 'CIA': 'rome', 'CUN': 'cancun', 'LHR': 'london', 'LGW': 'london',
        'STN': 'london', 'LTN': 'london', 'NRT': 'tokyo', 'HND': 'tokyo', 'CDG': 'paris',
        'ORY': 'paris', 'BCN': 'barcelona', 'MAD': 'madrid', 'DUB': 'dublin', 'AMS': 'amsterdam'
    };
    return destinationMap[airportCode] || airportCode.toLowerCase();
}

interface PriceWatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    flightInfo: {
        origin: string;
        destination: string;
        departureDate?: string;
        returnDate?: string;
        adults: number;
        children: number;
        seniors: number;
        currentPrice: number;
        airline: string;
        route: string;
    };
}

export default function PriceWatchModal({ isOpen, onClose, flightInfo }: PriceWatchModalProps) {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState(`${flightInfo.route} Trip`);
    const [watchDuration, setWatchDuration] = useState(30); // Days
    const [priceThreshold, setPriceThreshold] = useState(100); // Dollar amount
    const [targetPrice, setTargetPrice] = useState(Math.floor(flightInfo.currentPrice * 0.8)); // 20% less than current
    const [notificationType, setNotificationType] = useState<'email' | 'sms' | 'both'>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');

    // Auto-populate email and phone when user is available
    useEffect(() => {
        if (user) {
            if (!email) {
                setEmail(user.email);
            }
            if (!phone && user.phone) {
                setPhone(user.phone);
            }
        }
    }, [user, email, phone]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert to Edge system format
            const startDate = flightInfo.departureDate || new Date().toISOString().split('T')[0];
            const endDate = flightInfo.returnDate || new Date(Date.now() + watchDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const response = await fetch('/edge/watch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    origin: flightInfo.origin.toUpperCase(),
                    destination: flightInfo.destination.toUpperCase(),
                    start: startDate,
                    end: endDate,
                    targetUsd: targetPrice,
                    cabin: 'ECONOMY',
                    maxStops: 2,
                    adults: flightInfo.adults + flightInfo.seniors,
                    currency: 'USD',
                    flexDays: 3,
                    active: true,
                    email: email || user!.email, // Use user email if not provided
                    userId: user!.id // Include user ID for watch management
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create price watch');
            }

            const result = await response.json();
            console.log('🔔 Edge watch created:', result);
            setSuccess(true);

            // Auto-close after 2 seconds
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Show authentication requirement if user is not signed in
    if (!user) {
        return (
            <>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="text-orange-500 text-5xl mb-4">🔔</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
                            <p className="text-gray-600 mb-6">
                                Please sign in to your account to create price watches and receive notifications when flight prices change.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                                >
                                    Sign In / Sign Up
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    initialMode={authMode}
                />
            </>
        );
    }

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🔔</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Price Watch Active!</h3>
                    <p className="text-slate-600">We'll notify you when prices change by ${priceThreshold} or more.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">📊 Setup Price Watch</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-slate-600 mt-2">Get notified when flight prices change significantly</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Flight Info Display */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">✈️ Flight Route</h3>
                        <p className="text-blue-800">{flightInfo.route}</p>
                        <p className="text-sm text-blue-600 mt-1">
                            Current Price: <span className="font-bold">${flightInfo.currentPrice}</span> •
                            {flightInfo.adults} adult{flightInfo.adults !== 1 ? 's' : ''}
                            {flightInfo.children > 0 && `, ${flightInfo.children} child${flightInfo.children !== 1 ? 'ren' : ''}`}
                        </p>
                    </div>

                    {/* Watch Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Watch Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Rome Trip - Summer 2025"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Watch Duration
                            </label>
                            <select
                                value={watchDuration}
                                onChange={(e) => setWatchDuration(Number(e.target.value))}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={7}>1 Week</option>
                                <option value={14}>2 Weeks</option>
                                <option value={30}>1 Month</option>
                                <option value={60}>2 Months</option>
                                <option value={90}>3 Months</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Price Change Threshold
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500">$</span>
                                <input
                                    type="number"
                                    value={priceThreshold}
                                    onChange={(e) => setPriceThreshold(Number(e.target.value))}
                                    className="w-full pl-8 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="10"
                                    max="500"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Notify when price changes by this amount</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Target Price (Optional)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500">$</span>
                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                                    className="w-full pl-8 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="100"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Alert when price drops to this level</p>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            How would you like to be notified?
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="notificationType"
                                    value="email"
                                    checked={notificationType === 'email'}
                                    onChange={(e) => setNotificationType(e.target.value as 'email')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>📧 Email Only</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="notificationType"
                                    value="sms"
                                    checked={notificationType === 'sms'}
                                    onChange={(e) => setNotificationType(e.target.value as 'sms')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>📱 SMS Only</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="notificationType"
                                    value="both"
                                    checked={notificationType === 'both'}
                                    onChange={(e) => setNotificationType(e.target.value as 'both')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>📧📱 Both Email & SMS</span>
                            </label>
                        </div>
                    </div>

                    {/* Contact Information */}
                    {(notificationType === 'email' || notificationType === 'both') && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    )}

                    {(notificationType === 'sms' || notificationType === 'both') && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+1 (555) 123-4567"
                                required
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                            placeholder="e.g., Anniversary trip, flexible with dates..."
                        />
                    </div>

                    {/* Destination Research Link */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-blue-900 text-sm">Research Your Destination</h4>
                                <p className="text-blue-700 text-xs mt-1">Get travel tips, best times to visit, and pricing insights</p>
                            </div>
                            <Link
                                href={`/destinations/${getDestinationSlug(flightInfo.destination)}?from=${flightInfo.origin}&airportCode=${flightInfo.destination}`}
                                target="_blank"
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Guide
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '⏳ Setting up...' : '🔔 Start Watching'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
