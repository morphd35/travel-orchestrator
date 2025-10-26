/**
 * Booking Success/Confirmation Page
 * Shows booking details and explains production vs test environment
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BookingDetails {
    bookingReference: string;
    status: string;
    passengers: any[];
    flightDetails: any;
    totalAmount: number;
    currency: string;
}

export default function BookingConfirmationPage() {
    const searchParams = useSearchParams();
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [isTestEnvironment] = useState(true); // This would be dynamic in real app

    useEffect(() => {
        // In a real app, this would fetch booking details from API
        // For now, we'll show the demo success page
        const mockBooking: BookingDetails = {
            bookingReference: searchParams.get('ref') || 'TEST-' + Date.now(),
            status: 'CONFIRMED',
            passengers: [],
            flightDetails: {},
            totalAmount: parseFloat(searchParams.get('amount') || '0'),
            currency: searchParams.get('currency') || 'USD'
        };
        setBooking(mockBooking);
    }, [searchParams]);

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading booking details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                        <p className="text-lg text-gray-600">Your flight has been successfully booked</p>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">
                                Booking Reference: <span className="font-mono text-lg">{booking.bookingReference}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Test Environment Notice */}
                {isTestEnvironment && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Test Environment</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>This is a <strong>test booking</strong> using Amadeus Test API. No real payment was processed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Production Flow Information */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Production Booking Flow</h2>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Secure Payment Processing</h3>
                                <p className="text-gray-600 mt-1">
                                    In production, you would be redirected to <strong>Amadeus's secure payment portal</strong> or airline website
                                    to complete payment using credit card, PayPal, or other payment methods.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Seat Selection</h3>
                                <p className="text-gray-600 mt-1">
                                    Interactive seat map allowing you to choose specific seats, with pricing for premium locations
                                    (extra legroom, window, aisle preferences).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Additional Services</h3>
                                <p className="text-gray-600 mt-1">
                                    Option to add baggage, meals, travel insurance, car rentals, and hotel bookings
                                    through integrated partner services.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">4</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Confirmation & E-tickets</h3>
                                <p className="text-gray-600 mt-1">
                                    Receive confirmation email with e-tickets, boarding passes, and booking management links.
                                    Integration with airline apps and mobile wallets.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Immediate Actions</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Check-in online 24hrs before
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Download airline mobile app
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Review baggage policies
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Travel Conductor</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>
                                    <Link href="/watches" className="text-blue-600 hover:text-blue-800">
                                        Set up price alerts for future trips
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                                        Search for more flights
                                    </Link>
                                </li>
                                <li>
                                    <span className="text-gray-500">
                                        Manage your bookings (coming soon)
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-8">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Search More Flights
                    </Link>
                    <Link
                        href="/watches"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Set Price Alerts
                    </Link>
                </div>
            </div>
        </div>
    );
}
