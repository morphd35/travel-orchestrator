'use client';

/**
 * Global Navigation Component
 * Provides consistent navigation across all pages with breadcrumbs and authentication
 */

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import AuthModal from './AuthModal';

interface NavigationProps {
    currentPage?: 'search' | 'book' | 'watches' | 'confirmation' | 'about' | 'destination';
}

export default function GlobalNavigation({ currentPage }: NavigationProps) {
    const { user, signOut, isLoading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const pathname = usePathname();
    const [detectedPage, setDetectedPage] = useState<string>(currentPage || 'search');

    // Auto-detect current page if not provided, but only on client side to avoid hydration mismatch
    useEffect(() => {
        if (currentPage) {
            setDetectedPage(currentPage);
            return;
        }

        if (pathname === '/') setDetectedPage('search');
        else if (pathname === '/about') setDetectedPage('about');
        else if (pathname === '/watches') setDetectedPage('watches');
        else if (pathname.startsWith('/book')) setDetectedPage('book');
        else if (pathname.startsWith('/confirmation')) setDetectedPage('confirmation');
        else if (pathname.startsWith('/destinations/')) setDetectedPage('destination');
        else setDetectedPage('search');
    }, [pathname, currentPage]);
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">✈️</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">Travel Conductor</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex space-x-8">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${detectedPage === 'search'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            🔍 Search Flights
                        </Link>
                        <Link
                            href="/about"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${detectedPage === 'about'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            ℹ️ About
                        </Link>
                        <Link
                            href="/watches"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${detectedPage === 'watches'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            👁️ Price Watches
                        </Link>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-600 hidden sm:inline">
                                    Welcome, {user.firstName}!
                                </span>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-sm">
                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                            <div className="py-1">
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    ⚙️ Settings
                                                </button>
                                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    👤 Profile
                                                </button>
                                                <Link href="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    ✈️ My Bookings
                                                </Link>
                                                <hr className="my-1" />
                                                <button
                                                    onClick={() => {
                                                        signOut();
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    🚪 Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setAuthMode('signin');
                                        setShowAuthModal(true);
                                    }}
                                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                                    disabled={isLoading}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthMode('signup');
                                        setShowAuthModal(true);
                                    }}
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    disabled={isLoading}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Breadcrumb for booking flow */}
            {detectedPage === 'book' && (
                <div className="bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link href="/" className="hover:text-blue-600">Search</Link>
                            <span>→</span>
                            <span className="text-blue-600 font-medium">Book Flight</span>
                        </div>
                    </div>
                </div>
            )}

            {detectedPage === 'confirmation' && (
                <div className="bg-green-50 border-t border-green-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center space-x-2 text-sm text-green-700">
                            <Link href="/" className="hover:text-green-800">Search</Link>
                            <span>→</span>
                            <Link href="#" className="hover:text-green-800">Book</Link>
                            <span>→</span>
                            <span className="font-medium">✅ Confirmed</span>
                        </div>
                    </div>
                </div>
            )}

            {detectedPage === 'destination' && (
                <div className="bg-amber-50 border-t border-amber-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center space-x-2 text-sm text-amber-700">
                            <Link href="/about" className="hover:text-amber-800">About</Link>
                            <span>→</span>
                            <span className="font-medium">🗺️ Destination Guide</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}

            {/* Authentication Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode={authMode}
            />
        </nav>
    );
}
