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
import SettingsModal from './SettingsModal';

interface NavigationProps {
    currentPage?: 'search' | 'book' | 'watches' | 'confirmation' | 'about' | 'destination';
}

export default function GlobalNavigation({ currentPage }: NavigationProps) {
    const { user, signOut, isLoading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const pathname = usePathname();
    const [detectedPage, setDetectedPage] = useState<string>(currentPage || 'search');

    // Auto-detect current page if not provided, but only on client side to avoid hydration mismatch
    useEffect(() => {
        if (currentPage) {
            setDetectedPage(currentPage);
            return;
        }

        if (pathname === '/search') setDetectedPage('search');
        else if (pathname === '/') setDetectedPage('home');
        else if (pathname === '/about') setDetectedPage('about');
        else if (pathname === '/watches') setDetectedPage('watches');
        else if (pathname.startsWith('/book')) setDetectedPage('book');
        else if (pathname.startsWith('/confirmation')) setDetectedPage('confirmation');
        else if (pathname.startsWith('/destinations/')) setDetectedPage('destination');
        else setDetectedPage('search');
    }, [pathname, currentPage]);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">✈️</span>
                        </div>
                        <span className="text-base sm:text-lg font-light text-white tracking-wide hidden sm:block">Travel Conductor</span>
                        <span className="text-base font-light text-white tracking-wide sm:hidden">TC</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex space-x-6 lg:space-x-8">
                        <Link
                            href="/search"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${detectedPage === 'search'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            🔍 Search
                        </Link>
                        <Link
                            href="/about"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${detectedPage === 'about'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            ℹ️ About
                        </Link>
                        <Link
                            href="/watches"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${detectedPage === 'watches'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            👁️ Watches
                        </Link>
                    </div>

                    {/* Desktop User Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-300 hidden lg:inline">
                                    Welcome, {user.firstName}!
                                </span>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
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
                                                <button
                                                    onClick={() => {
                                                        setShowSettingsModal(true);
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    ⚙️ Settings
                                                </button>
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    👤 Profile
                                                </Link>
                                                <Link href="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    ✈️ My Bookings
                                                </Link>
                                                {user.email === 'morphd335@yahoo.com' && (
                                                    <Link
                                                        href="/admin/access-requests"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-medium"
                                                    >
                                                        🛡️ Admin Panel
                                                    </Link>
                                                )}
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
                                    className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                                    disabled={isLoading}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthMode('signup');
                                        setShowAuthModal(true);
                                    }}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                                    disabled={isLoading}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        {/* Mobile user avatar (logged in users only) */}
                        {user && (
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="text-gray-300 hover:text-white p-2 rounded-md transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showMobileMenu ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-gray-700 bg-slate-900">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {/* Navigation Links */}
                            <Link
                                href="/search"
                                onClick={() => setShowMobileMenu(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${detectedPage === 'search'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                🔍 Search Flights
                            </Link>
                            <Link
                                href="/about"
                                onClick={() => setShowMobileMenu(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${detectedPage === 'about'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                ℹ️ About
                            </Link>
                            <Link
                                href="/watches"
                                onClick={() => setShowMobileMenu(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${detectedPage === 'watches'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                👁️ Price Watches
                            </Link>

                            {/* Mobile user menu */}
                            {user ? (
                                <>
                                    <div className="border-t border-gray-700 pt-4 pb-3">
                                        <div className="flex items-center px-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-semibold">
                                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-white">{user.firstName} {user.lastName}</div>
                                                <div className="text-sm font-medium text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-700 pt-3">
                                        <button
                                            onClick={() => {
                                                setShowSettingsModal(true);
                                                setShowMobileMenu(false);
                                            }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            ⚙️ Settings
                                        </button>
                                        <Link
                                            href="/profile"
                                            onClick={() => setShowMobileMenu(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            👤 Profile
                                        </Link>
                                        <Link
                                            href="/bookings"
                                            onClick={() => setShowMobileMenu(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            ✈️ My Bookings
                                        </Link>
                                        {user.email === 'morphd335@yahoo.com' && (
                                            <Link
                                                href="/admin/access-requests"
                                                onClick={() => setShowMobileMenu(false)}
                                                className="block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                                            >
                                                🛡️ Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                signOut();
                                                setShowMobileMenu(false);
                                            }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700"
                                        >
                                            🚪 Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="border-t border-gray-700 pt-3">
                                    <button
                                        onClick={() => {
                                            setAuthMode('signin');
                                            setShowAuthModal(true);
                                            setShowMobileMenu(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        disabled={isLoading}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAuthMode('signup');
                                            setShowAuthModal(true);
                                            setShowMobileMenu(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700 mt-2"
                                        disabled={isLoading}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Breadcrumb for booking flow */}
            {detectedPage === 'book' && (
                <div className="bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
                            <Link href="/search" className="hover:text-blue-600 whitespace-nowrap">Search</Link>
                            <span className="flex-shrink-0">→</span>
                            <span className="text-blue-600 font-medium whitespace-nowrap">Book Flight</span>
                        </div>
                    </div>
                </div>
            )}

            {detectedPage === 'confirmation' && (
                <div className="bg-green-50 border-t border-green-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-700 overflow-x-auto">
                            <Link href="/search" className="hover:text-green-800 whitespace-nowrap">Search</Link>
                            <span className="flex-shrink-0">→</span>
                            <Link href="#" className="hover:text-green-800 whitespace-nowrap">Book</Link>
                            <span className="flex-shrink-0">→</span>
                            <span className="font-medium whitespace-nowrap">✅ Confirmed</span>
                        </div>
                    </div>
                </div>
            )}

            {detectedPage === 'destination' && (
                <div className="bg-amber-50 border-t border-amber-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-amber-700 overflow-x-auto">
                            <Link href="/about" className="hover:text-amber-800 whitespace-nowrap">About</Link>
                            <span className="flex-shrink-0">→</span>
                            <span className="font-medium whitespace-nowrap">🗺️ Destination Guide</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close menus */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
            {showMobileMenu && (
                <div
                    className="fixed inset-0 z-30 md:hidden"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Authentication Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode={authMode}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </nav>
    );
}
