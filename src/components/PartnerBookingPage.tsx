'use client';

import { useState } from 'react';
import { UnifiedFlightResult } from '@/lib/unifiedFlightClient';
import { PartnerBookingService, PartnerBookingData, PassengerInfo, ContactInfo, logBookingAttempt } from '@/lib/partnerBooking';

interface BookingPageProps {
  flight: UnifiedFlightResult;
  searchParams: {
    from: string;
    to: string;
    departure: string;
    return?: string;
  };
}

export default function BookingPage({ flight, searchParams }: BookingPageProps) {
  const [passengers, setPassengers] = useState<PassengerInfo[]>([{
    firstName: '',
    lastName: '',
  }]);
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPartnerInfo, setShowPartnerInfo] = useState(false);

  const airlineName = PartnerBookingService.getAirlineName(flight.carrier);
  const bookingMode = process.env.NEXT_PUBLIC_BOOKING_MODE || 'partner';

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const bookingReferenceId = PartnerBookingService.generateBookingReference();
      
      const bookingData: PartnerBookingData = {
        flight,
        passengers,
        contactInfo,
        partnerRedirectUrl: '',
        bookingReferenceId,
      };

      // Log the booking attempt for analytics
      await logBookingAttempt(bookingData);

      if (bookingMode === 'partner') {
        // Route to airline partner
        const partnerUrl = await PartnerBookingService.routeToPartner(bookingData);
        bookingData.partnerRedirectUrl = partnerUrl;
        
        // Show partner information modal first
        setShowPartnerInfo(true);
      } else {
        // Direct booking flow (for future implementation)
        console.log('Direct booking not yet implemented');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerRedirect = () => {
    // Open partner airline website in new tab
    const bookingData: PartnerBookingData = {
      flight,
      passengers,
      contactInfo,
      partnerRedirectUrl: '',
      bookingReferenceId: PartnerBookingService.generateBookingReference(),
    };

    PartnerBookingService.routeToPartner(bookingData).then(url => {
      window.open(url, '_blank');
    });
  };

  if (showPartnerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Booking with {airlineName}
              </h1>
              <p className="text-gray-600">
                We're connecting you directly with {airlineName} to complete your ticket purchase
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">How This Works:</h3>
              <ol className="text-blue-800 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-900 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                  We'll open {airlineName}'s booking page with your flight details pre-filled
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-900 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                  Complete your purchase directly with {airlineName} using your preferred payment method
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-900 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                  You'll receive your boarding pass and confirmation directly from {airlineName}
                </li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Flight Summary:</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Route:</strong> {flight.outbound.origin} → {flight.outbound.destination}</p>
                <p><strong>Departure:</strong> {new Date(flight.outbound.departure).toLocaleDateString()} at {new Date(flight.outbound.departure).toLocaleTimeString()}</p>
                {flight.inbound && (
                  <p><strong>Return:</strong> {new Date(flight.inbound.departure).toLocaleDateString()} at {new Date(flight.inbound.departure).toLocaleTimeString()}</p>
                )}
                <p><strong>Price:</strong> ${flight.price} {flight.currency}</p>
                <p><strong>Carrier:</strong> {flight.carrierName}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPartnerInfo(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Details
              </button>
              <button
                onClick={handlePartnerRedirect}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Continue to {airlineName}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Complete Your Booking</h1>
            <p className="text-blue-100">Enter passenger details to proceed</p>
          </div>

          <div className="p-6">
            {/* Flight Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Flight Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Outbound</h3>
                  <p className="text-sm text-gray-600">
                    {flight.outbound.origin} → {flight.outbound.destination}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.outbound.departure).toLocaleDateString()} at {new Date(flight.outbound.departure).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: {Math.floor(flight.outbound.duration / 60)}h {flight.outbound.duration % 60}m
                  </p>
                </div>
                
                {flight.inbound && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Return</h3>
                    <p className="text-sm text-gray-600">
                      {flight.inbound.origin} → {flight.inbound.destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(flight.inbound.departure).toLocaleDateString()} at {new Date(flight.inbound.departure).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {Math.floor(flight.inbound.duration / 60)}h {flight.inbound.duration % 60}m
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                  <span className="text-2xl font-bold text-blue-600">${flight.price} {flight.currency}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Operated by {flight.carrierName}</p>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Passenger Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={passengers[0]?.firstName || ''}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[0] = { ...updated[0], firstName: e.target.value };
                        setPassengers(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={passengers[0]?.lastName || ''}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[0] = { ...updated[0], lastName: e.target.value };
                        setPassengers(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Smith"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-800">Important Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Travel Conductor provides flight search and price monitoring. You will complete your actual ticket purchase directly with {airlineName}. We do not process payments or issue tickets.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : `Continue to ${airlineName}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
