'use client';

import { useState } from 'react';
import { apiPath } from '@/lib/apiBase';
import { getCityFromIATA, normalizeToIATA } from '@/lib/iataCity';
import { bookingCityDeeplink } from '@/lib/booking';
import AirportAutocomplete from '@/components/AirportAutocomplete';

type SearchReq = {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  flexibilityDays: number;
  includeHotel: boolean;
  includeCar: boolean;
  includeActivities: boolean;
  budgetUsd?: number;
};

type PackageResult = {
  id: string;
  summary: string;
  total: number;
  components: {
    flight?: { carrier: string; stops: number };
    hotel?: { name: string };
    car?: { vendor: string };
  };
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PackageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchParams, setSearchParams] = useState<SearchReq | null>(null);
  const [originIATA, setOriginIATA] = useState('');
  const [destinationIATA, setDestinationIATA] = useState('');
  const [activities, setActivities] = useState<any[]>([]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate minimum end date (day after start date)
  const minEndDate = startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : today;

  async function onSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    setResults([]);
    setActivities([]); // Clear previous activities

    const payload: SearchReq = {
      origin: originIATA.toUpperCase() || (formData.get('origin') as string || '').toUpperCase(),
      destination: destinationIATA.toUpperCase() || (formData.get('destination') as string || '').toUpperCase(),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      flexibilityDays: Number(formData.get('flexibilityDays') || 0),
      includeHotel: Boolean(formData.get('includeHotel')),
      includeCar: Boolean(formData.get('includeCar')),
      includeActivities: Boolean(formData.get('includeActivities')),
      budgetUsd: formData.get('budgetUsd') ? Number(formData.get('budgetUsd')) : undefined,
    };

    // Store search params for use in results
    setSearchParams(payload);

    // Validate dates
    if (new Date(payload.startDate) >= new Date(payload.endDate)) {
      setError('Return date must be after departure date');
      setLoading(false);
      return;
    }

    try {
      // Normalize airport codes (convert NYC→JFK, etc.)
      const normalizedOrigin = normalizeToIATA(payload.origin);
      const normalizedDestination = normalizeToIATA(payload.destination);
      
      // Call Amadeus flight search API directly
      const flightRes = await fetch(apiPath('/api/providers/amadeus/flight-search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLocationCode: normalizedOrigin,
          destinationLocationCode: normalizedDestination,
          departureDate: payload.startDate,
          returnDate: payload.endDate,
          adults: 1,
          currencyCode: 'USD',
          max: 20,
        }),
      });

      if (!flightRes.ok) {
        // If Amadeus fails, show error but don't crash
        const errorText = await flightRes.text().catch(() => '');
        console.error('Flight search error:', errorText);
        setError('Unable to fetch flight data. Showing limited results.');
        
        // Show minimal mock results as fallback
        setResults([
          {
            id: 'fallback_1',
            summary: `${payload.origin} → ${payload.destination}, ${payload.startDate}–${payload.endDate}`,
            total: 500,
            components: {
              flight: { carrier: 'Various', stops: 0 },
            },
          },
        ]);
        return;
      }

      const flightData = await flightRes.json();
      const flights = flightData.results || [];

      if (flights.length === 0) {
        setError('No flights found for this route. Try different dates or locations.');
        setLoading(false);
        return;
      }

      // Build travel packages from real flight data
      const packages = flights.map((flight: any, index: number) => {
        const flightPrice = flight.total || 0;
        
        // Calculate nights
        const start = new Date(payload.startDate);
        const end = new Date(payload.endDate);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        // Add hotel price if requested (estimated)
        const hotelPrice = payload.includeHotel ? 150 * nights : 0;
        
        // Add car rental if requested (estimated)
        const carPrice = payload.includeCar ? 50 * nights : 0;
        
        const totalPrice = flightPrice + hotelPrice + carPrice;

        // Hotel names
        const hotelNames = [
          'Marriott Downtown', 'Hilton City Center', 'Hyatt Regency',
          'Sheraton Plaza', 'InterContinental', 'Westin Grand',
          'DoubleTree Suites', 'Courtyard by Marriott'
        ];
        
        // Car vendors
        const carVendors = ['Hertz', 'Enterprise', 'Avis', 'Budget', 'National', 'Alamo'];

        return {
          id: `pkg_${flight.id || index}`,
          summary: `${payload.origin} → ${payload.destination}, ${payload.startDate}–${payload.endDate}${payload.includeHotel ? ', Hotel' : ''}${payload.includeCar ? ', Car' : ''}`,
          total: Math.round(totalPrice * 100) / 100,
          components: {
            flight: {
              carrier: flight.carrier,
              stops: flight.stops,
            },
            hotel: payload.includeHotel ? {
              name: hotelNames[index % hotelNames.length],
            } : undefined,
            car: payload.includeCar ? {
              vendor: carVendors[index % carVendors.length],
            } : undefined,
          },
        };
      });

      setResults(packages);

      // Fetch activities if requested (don't block main results)
      if (payload.includeActivities && flights.length > 0) {
        console.log('🎯 Fetching activities for:', getCityFromIATA(normalizedDestination));
        try {
          const activitiesRes = await fetch(apiPath('/api/providers/viator/search'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destination: getCityFromIATA(normalizedDestination),
              startDate: payload.startDate,
              endDate: payload.endDate,
              limit: 3,
            }),
          });

          if (activitiesRes.ok) {
            const activitiesData = await activitiesRes.json();
            console.log('✅ Activities received:', activitiesData.activities?.length || 0);
            setActivities(activitiesData.activities || []);
            
            if (activitiesData.message) {
              console.log('ℹ️ Viator message:', activitiesData.message);
            }
          } else {
            console.error('❌ Activities API error:', activitiesRes.status);
            setActivities([]);
          }
        } catch (activityError) {
          console.error('❌ Failed to fetch activities:', activityError);
          setActivities([]);
        }
      } else {
        console.log('ℹ️ Activities not requested or no flights found');
        setActivities([]);
      }
    } catch (e: any) {
      // Provide user-friendly error messages
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        setError('Network connection issue. Please check your internet and try again.');
      } else if (e.message.includes('502') || e.message.includes('503')) {
        setError('Service temporarily unavailable. Please refresh and try again.');
      } else {
        setError(e.message || 'Unable to search. Please try again.');
      }
      console.error('Search error:', e);
      
      // Show fallback results even on error
      setResults([
        {
          id: 'fallback_1',
          summary: `${payload.origin} → ${payload.destination}, ${payload.startDate}–${payload.endDate}`,
          total: 500,
          components: {
            flight: { carrier: 'Various', stops: 0 },
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-40"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Travel Orchestrator</h1>
                <p className="text-xs text-slate-500">Smart travel planning</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                Beta Access
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-700">Real-time search • Best prices guaranteed</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Plan Your Perfect Trip
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Search flights, hotels, and car rentals all in one place. Compare prices and save on your next adventure.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto mb-12">
          <form action={onSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 lg:p-8 space-y-6">
              {/* Location Inputs with Autocomplete */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    From
                  </label>
                  <AirportAutocomplete
                    name="origin"
                    placeholder="Dallas, Los Angeles, New York..."
                    required
                    value={originIATA}
                    onChange={(iata, display) => setOriginIATA(iata)}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    To
                  </label>
                  <AirportAutocomplete
                    name="destination"
                    placeholder="Rome, Paris, Tokyo..."
                    required
                    value={destinationIATA}
                    onChange={(iata, display) => setDestinationIATA(iata)}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Departure
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      // If end date is before or equal to new start date, clear it
                      if (endDate && new Date(endDate) <= new Date(e.target.value)) {
                        setEndDate('');
                      }
                    }}
                    min={today}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Return
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={minEndDate}
                    disabled={!startDate}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  {!startDate && (
                    <p className="text-xs text-slate-500 mt-1">Select departure date first</p>
                  )}
                </div>
              </div>

              {/* Options Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Date Flexibility
                  </label>
                  <select
                    name="flexibilityDays"
                    defaultValue={0}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={0}>Exact dates</option>
                    <option value={1}>± 1 day</option>
                    <option value={2}>± 2 days</option>
                    <option value={3}>± 3 days</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Budget (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      $
                    </div>
                    <input
                      type="number"
                      name="budgetUsd"
                      placeholder="2000"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Include in search
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="relative flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group">
                    <input
                      type="checkbox"
                      name="includeHotel"
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏨</span>
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">Hotels</span>
                    </div>
                  </label>

                  <label className="relative flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group">
                    <input
                      type="checkbox"
                      name="includeCar"
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚗</span>
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">Car Rental</span>
                    </div>
                  </label>

                  <label className="relative flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group">
                    <input
                      type="checkbox"
                      name="includeActivities"
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">Activities</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Travel Packages</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900">Search Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {results.length} Package{results.length !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-sm text-slate-500 mt-1">Sorted by best value</p>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((r, index) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1">{r.summary}</h4>
                          <p className="text-sm text-slate-500">Complete travel package</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ${r.total.toFixed(0)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Total price</p>
                      </div>
                    </div>

                    {/* Components Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      {r.components.flight && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <span className="text-2xl">✈️</span>
                          <div>
                            <p className="font-semibold text-blue-900 text-sm">{r.components.flight.carrier}</p>
                            <p className="text-xs text-blue-600">{r.components.flight.stops} stop{r.components.flight.stops !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      )}
                      {r.components.hotel && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                          <span className="text-2xl">🏨</span>
                          <div>
                            <p className="font-semibold text-purple-900 text-sm">{r.components.hotel.name}</p>
                            <p className="text-xs text-purple-600">Accommodation</p>
                          </div>
                        </div>
                      )}
                      {r.components.car && (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                          <span className="text-2xl">🚗</span>
                          <div>
                            <p className="font-semibold text-orange-900 text-sm">{r.components.car.vendor}</p>
                            <p className="text-xs text-orange-600">Rental car</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {r.components.hotel && searchParams && (
                        <a
                          href={bookingCityDeeplink(
                            getCityFromIATA(searchParams.destination),
                            searchParams.startDate,
                            searchParams.endDate
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>View Stays</span>
                        </a>
                      )}
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Book Flight</span>
                      </button>
                      <button className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span>Watch Price</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Activities Section */}
        {searchParams?.includeActivities && results.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Things to Do in {getCityFromIATA(searchParams.destination)}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Top-rated activities and tours</p>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-slate-600">Loading activities...</p>
              </div>
            ) : null}
          </div>
        )}

        {activities.length > 0 && results.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Things to Do in {searchParams?.destination}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Top-rated activities and tours</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  {activity.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {activity.rating > 0 && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-sm font-semibold text-slate-900">{activity.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2">
                      {activity.title}
                    </h4>
                    
                    {activity.reviewCount > 0 && (
                      <p className="text-xs text-slate-500 mb-3">
                        {activity.reviewCount.toLocaleString()} reviews
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-slate-500">From</p>
                        <p className="text-lg font-bold text-green-600">
                          ${activity.fromPrice.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    
                    <a
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>Book on Viator</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Start Your Journey</h3>
            <p className="text-slate-600">Enter your travel details above to discover the best deals and packages for your trip.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            © 2025 Travel Orchestrator. Find your perfect adventure.
          </p>
        </div>
      </footer>
    </div>
  );
}
