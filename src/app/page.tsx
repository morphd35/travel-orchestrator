'use client';

import { useState } from 'react';

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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate minimum end date (day after start date)
  const minEndDate = startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : today;

  async function onSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    setResults([]);

    const payload: SearchReq = {
      origin: (formData.get('origin') as string || '').toUpperCase(),
      destination: (formData.get('destination') as string || '').toUpperCase(),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      flexibilityDays: Number(formData.get('flexibilityDays') || 0),
      includeHotel: Boolean(formData.get('includeHotel')),
      includeCar: Boolean(formData.get('includeCar')),
      includeActivities: Boolean(formData.get('includeActivities')),
      budgetUsd: formData.get('budgetUsd') ? Number(formData.get('budgetUsd')) : undefined,
    };

    // Validate dates
    if (new Date(payload.startDate) >= new Date(payload.endDate)) {
      setError('Return date must be after departure date');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/offers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error (${res.status}): ${errorText || 'Please try again later'}`);
      }
      const json = await res.json();
      setResults(json.results || []);
    } catch (e: any) {
      setError(e.message || 'Unable to search. Please check your connection and try again.');
      console.error('Search error:', e);
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
              {/* Location Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    From
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      name="origin"
                      type="text"
                      placeholder="DFW, LAX, JFK..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    To
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      name="destination"
                      type="text"
                      placeholder="CUN, CDG, NRT..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
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
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Book Now</span>
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
