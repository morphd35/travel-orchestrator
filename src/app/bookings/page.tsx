/**
 * User Bookings Page
 * Shows user-specific booking history and travel data
 */

'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BookingsPage() {
    const { user, isLoading } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [watches, setWatches] = useState<any[]>([]);
    const [recentSearches, setRecentSearches] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            // Load user-specific data using simple API calls
            const loadUserData = async () => {
                try {
                    // Fetch bookings
                    const bookingsResponse = await fetch(`/api/user/bookings?userId=${user.id}`);
                    const bookingsData = await bookingsResponse.json();
                    setBookings(bookingsData.bookings || []);

                    // Fetch watches from Edge system (where PriceWatchModal saves them)
                    const watchesResponse = await fetch(`/edge/watch?userId=${user.id}`);
                    const watchesData = await watchesResponse.json();
                    const allWatches = Array.isArray(watchesData) ? watchesData : (watchesData.watches || []);
                    setWatches(allWatches);

                    // Fetch recent searches
                    const searchesResponse = await fetch(`/api/user/searches?userId=${user.id}`);
                    const searchesData = await searchesResponse.json();
                    setRecentSearches(searchesData.searches || []);
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            };
            
            loadUserData();
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
                    <p className="text-gray-600 mb-8">Please sign in to view your bookings and travel data.</p>
                    <Link 
                        href="/"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* User Welcome */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-xl">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome, {user.firstName}!
                            </h1>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Booking History */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            ✈️ My Bookings
                            <span className="ml-2 bg-blue-100 text-blue-600 text-sm px-2 py-1 rounded-full">
                                {bookings.length}
                            </span>
                        </h2>
                        
                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.slice(0, 3).map((booking, index) => (
                                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                                        <div className="font-medium text-gray-900">
                                            {booking.origin} → {booking.destination}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {booking.departDate}
                                        </div>
                                        <div className="text-sm text-blue-600">
                                            {booking.currency} {booking.totalAmount}
                                        </div>
                                    </div>
                                ))}
                                {bookings.length > 3 && (
                                    <p className="text-sm text-gray-500">
                                        + {bookings.length - 3} more bookings
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📝</div>
                                <p className="text-gray-500">No bookings yet</p>
                                <Link 
                                    href="/"
                                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                                >
                                    Search flights
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Price Watches */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            👁️ Price Watches
                            <span className="ml-2 bg-green-100 text-green-600 text-sm px-2 py-1 rounded-full">
                                {watches.length}
                            </span>
                        </h2>
                        
                        {watches.length > 0 ? (
                            <div className="space-y-4">
                                {watches.slice(0, 3).map((watch, index) => (
                                    <div key={index} className="border-l-4 border-green-500 pl-4">
                                        <div className="font-medium text-gray-900">
                                            {watch.origin} → {watch.destination}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Target: {watch.currency} {watch.targetPrice}
                                        </div>
                                        <div className="text-sm text-green-600">
                                            Active since {new Date(watch.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                                {watches.length > 3 && (
                                    <p className="text-sm text-gray-500">
                                        + {watches.length - 3} more watches
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">👀</div>
                                <p className="text-gray-500">No price watches</p>
                                <Link 
                                    href="/watches"
                                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                                >
                                    Create watch
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Searches */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            🔍 Recent Searches
                            <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                                {recentSearches.length}
                            </span>
                        </h2>
                        
                        {recentSearches.length > 0 ? (
                            <div className="space-y-4">
                                {recentSearches.slice(0, 3).map((search, index) => (
                                    <div key={index} className="border-l-4 border-gray-400 pl-4">
                                        <div className="font-medium text-gray-900">
                                            {search.origin} → {search.destination}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {search.departDate}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(search.searchedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                                {recentSearches.length > 3 && (
                                    <p className="text-sm text-gray-500">
                                        + {recentSearches.length - 3} more searches
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">🔍</div>
                                <p className="text-gray-500">No recent searches</p>
                                <Link 
                                    href="/"
                                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                                >
                                    Start searching
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Data Security Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Your Data is Private</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>All your booking data, watches, and searches are stored locally in your browser and are specific to your account. Other users cannot see your information.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
