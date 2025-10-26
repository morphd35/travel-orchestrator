'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAirlineName, getAirportName, formatStopsInfo } from '@/lib/airlineUtils';
import BookingForm from '@/components/BookingForm';
import FlightExpirationWarning from '@/components/FlightExpirationWarning';

interface FlightBookingDetails {
  origin: string;
  destination: string;
  depart: string;
  returnDate?: string;
  total: number;
  currency: string;
  carrier: string;
  stopsOut: number;
  stopsBack?: number;
  segments?: string;
  targetPrice?: number;
  adults: number;
}

export default function BookFlightPage() {
  const searchParams = useSearchParams();
  const [flight, setFlight] = useState<FlightBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);
  const [searchTimestamp] = useState(Date.now()); // Track when this booking page was loaded

  useEffect(() => {
    try {
      // Parse flight details from URL parameters
      const flightData: FlightBookingDetails = {
        origin: searchParams.get('o') || '',
        destination: searchParams.get('d') || '',
        depart: searchParams.get('ds') || '',
        returnDate: searchParams.get('rs') || undefined,
        total: parseFloat(searchParams.get('p') || '0'),
        currency: searchParams.get('c') || 'USD',
        carrier: searchParams.get('car') || '',
        stopsOut: parseInt(searchParams.get('so') || '0'),
        stopsBack: searchParams.get('sb') ? parseInt(searchParams.get('sb')!) : undefined,
        segments: searchParams.get('seg') || undefined,
        targetPrice: searchParams.get('tp') ? parseFloat(searchParams.get('tp')!) : undefined,
        adults: parseInt(searchParams.get('adults') || '1'), // Extract adults count from URL
      };

      if (flightData.origin && flightData.destination) {
        setFlight(flightData);
      }
    } catch (error) {
      console.error('Error parsing flight details:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Flight Link</h1>
          <p className="text-gray-600 mb-6">
            The flight booking link appears to be invalid or expired. Please try searching for flights again.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Flights
          </a>
        </div>
      </div>
    );
  }

  const originCity = getAirportName(flight.origin);
  const destinationCity = getAirportName(flight.destination);
  const airlineName = getAirlineName(flight.carrier);
  const tripType = flight.returnDate ? 'Round-trip' : 'One-way';
  const savings = flight.targetPrice && flight.total < flight.targetPrice 
    ? flight.targetPrice - flight.total 
    : 0;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleBookNow = () => {
    // Check if direct booking is available
    fetch('/api/booking/flight?action=capabilities')
      .then(res => res.json())
      .then(data => {
        if (data.enabled) {
          // Show the advanced booking form
          setShowBookingForm(true);
        } else {
          // Fallback to external booking reference
          showExternalBookingReference();
        }
      })
      .catch(() => {
        // On error, show external booking reference
        showExternalBookingReference();
      });
  };

  const showExternalBookingReference = () => {
    const bookingDetails = {
      route: `${flight!.origin} → ${flight!.destination}`,
      depart: flight!.depart,
      return: flight!.returnDate,
      price: flight!.total,
      currency: flight!.currency,
      airline: flight!.carrier,
      stops: `${flight!.stopsOut} outbound, ${flight!.stopsBack || 0} return`,
      segments: flight!.segments,
      target: flight!.targetPrice
    };

    const bookingSummary = `
FLIGHT BOOKING DETAILS
======================
Route: ${bookingDetails.route}
Departure: ${bookingDetails.depart}
${bookingDetails.return ? `Return: ${bookingDetails.return}` : ''}
Price Found: ${bookingDetails.currency} ${bookingDetails.price}
${bookingDetails.target ? `Your Target: ${bookingDetails.currency} ${bookingDetails.target}` : ''}
Airline: ${bookingDetails.airline}
Stops: ${bookingDetails.stops}

Flight Segments:
${bookingDetails.segments || 'Details available in email'}

BOOKING OPTIONS:
1. Search directly on airline website: ${getAirlineWebsite(flight!.carrier)}
2. Compare prices on: Google Flights, Kayak, Expedia
3. Contact travel agent with these details
4. Use this reference for price matching

Found by Travel Conductor - ${new Date().toLocaleDateString()}
    `.trim();

    // Copy to clipboard and show modal
    navigator.clipboard.writeText(bookingSummary).then(() => {
      alert(`✈️ Booking details copied to clipboard!\n\nYou can now:\n• Paste into travel booking sites\n• Share with travel agents\n• Use for price comparison\n\nTip: Search directly on ${getAirlineWebsite(flight!.carrier)} for best rates!`);
    }).catch(() => {
      // Fallback: open in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${bookingSummary}</pre>`);
        newWindow.document.title = 'Flight Booking Details';
      }
    });
  };

  const handleBookingComplete = (confirmation: any) => {
    setBookingConfirmation(confirmation);
    setShowBookingForm(false);
  };

  const getAirlineWebsite = (carrier: string): string => {
    const airlines: Record<string, string> = {
      'AA': 'aa.com',
      'DL': 'delta.com', 
      'UA': 'united.com',
      'BA': 'britishairways.com',
      'LH': 'lufthansa.com',
      'AF': 'airfrance.com',
      'KL': 'klm.com',
      'VS': 'virginatlantic.com',
      'NK': 'spirit.com',
      'F9': 'flyfrontier.com',
      'B6': 'jetblue.com'
    };
    return airlines[carrier] || 'google.com/flights';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✈️ Your Flight Deal</h1>
          <p className="text-gray-600">Ready to book this amazing price?</p>
        </div>

        {/* Main Flight Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          
          {/* Price Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {flight.currency} {flight.total.toFixed(2)}
                </div>
                <div className="text-green-100">{tripType} flight</div>
                {savings > 0 && (
                  <div className="bg-green-700 bg-opacity-50 rounded-lg px-3 py-1 mt-2 inline-block">
                    💰 {flight.currency} {savings.toFixed(2)} below your target!
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-green-100 text-sm">Found by</div>
                <div className="text-xl font-semibold">Travel Conductor</div>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="p-8">
            
            {/* Flight Expiration Warning */}
            <FlightExpirationWarning 
              searchTime={searchTimestamp}
              onRefreshNeeded={() => {
                const searchUrl = `/?o=${flight.origin}&d=${flight.destination}&ds=${flight.depart}&rs=${flight.returnDate || ''}&adults=${flight.adults}`;
                window.location.href = searchUrl;
              }}
            />
            
            {/* Route Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-6">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-800">{originCity}</div>
                  <div className="text-gray-500 text-lg">{flight.origin}</div>
                  <div className="text-blue-600 font-medium mt-1">{formatDate(flight.depart)}</div>
                </div>
                
                <div className="flex-shrink-0 mx-8">
                  <div className="text-center">
                    <div className="text-3xl mb-2">✈️</div>
                    <div className="text-sm text-gray-500">{airlineName}</div>
                    <div className="text-xs text-gray-400">{flight.carrier}</div>
                  </div>
                </div>
                
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-800">{destinationCity}</div>
                  <div className="text-gray-500 text-lg">{flight.destination}</div>
                  {flight.returnDate && (
                    <div className="text-blue-600 font-medium mt-1">{formatDate(flight.returnDate)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Flight Info Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-blue-600 text-sm font-medium uppercase tracking-wide">Airline</div>
                <div className="text-gray-800 font-bold mt-1">{airlineName}</div>
                <div className="text-gray-500 text-sm">{flight.carrier}</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-blue-600 text-sm font-medium uppercase tracking-wide">Outbound</div>
                <div className="text-gray-800 font-bold mt-1">
                  {formatStopsInfo(flight.stopsOut)}
                </div>
              </div>
              
              {flight.returnDate && (
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-blue-600 text-sm font-medium uppercase tracking-wide">Return</div>
                  <div className="text-gray-800 font-bold mt-1">
                    {formatStopsInfo(flight.stopsBack || 0)}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Segments */}
            {flight.segments && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Flight Route Details</h3>
                <div className="font-mono text-sm text-gray-600 whitespace-pre-line">
                  {decodeURIComponent(flight.segments)}
                </div>
              </div>
            )}

            {/* Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-800 font-medium">Act Fast!</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Flight prices change frequently. This price was found recently and may no longer be available.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBookNow}
                className="flex-1 bg-blue-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">🎫</span>
                Book This Flight
              </button>
              
              <a
                href="/"
                className="flex-1 bg-gray-200 text-gray-800 py-4 px-8 rounded-lg font-bold text-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-center"
              >
                <span className="mr-2">🔍</span>
                Search Different Flights
              </a>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm text-center">
                This flight was found by Travel Conductor's automated price monitoring system. 
                Prices are subject to availability and may change without notice.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Booking Form Modal */}
      {showBookingForm && flight && (
        <BookingForm
          flightDetails={{
            origin: flight.origin,
            destination: flight.destination,
            depart: flight.depart,
            returnDate: flight.returnDate,
            total: flight.total,
            currency: flight.currency,
            carrier: flight.carrier,
            adults: flight.adults
          }}
          onBookingComplete={handleBookingComplete}
          onCancel={() => setShowBookingForm(false)}
        />
      )}

      {/* Booking Confirmation Modal */}
      {bookingConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-6">
              <div className="text-center">
                <div className="text-5xl mb-2">✅</div>
                <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                <p className="text-green-100 mt-2">Your flight has been successfully booked</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmation Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div><span className="font-medium">Booking Reference:</span> {bookingConfirmation.bookingReference}</div>
                  <div><span className="font-medium">Status:</span> {bookingConfirmation.status}</div>
                  <div><span className="font-medium">Total Price:</span> {bookingConfirmation.totalPrice.currency} {bookingConfirmation.totalPrice.amount}</div>
                  <div><span className="font-medium">Booking Date:</span> {new Date(bookingConfirmation.bookingDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Passengers</h3>
                <div className="space-y-2">
                  {bookingConfirmation.passengers.map((passenger: any, index: number) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3 text-sm">
                      <span className="font-medium">{passenger.firstName} {passenger.lastName}</span>
                      {passenger.confirmationNumber && (
                        <span className="ml-2 text-blue-600">({passenger.confirmationNumber})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Flight Itinerary</h3>
                <div className="space-y-3">
                  {bookingConfirmation.itinerary.flights.map((flight: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{flight.flightNumber}</div>
                          <div className="text-sm text-gray-600">{flight.airline}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            {flight.departure.airport} → {flight.arrival.airport}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(flight.departure.dateTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400 text-xl">📧</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-yellow-800 font-medium">Important</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      A confirmation email with your e-tickets has been sent to your email address. 
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print Confirmation
                </button>
                <button
                  onClick={() => {
                    setBookingConfirmation(null);
                    window.location.href = '/';
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
