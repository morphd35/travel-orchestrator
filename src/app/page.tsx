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

    try {
      const res = await fetch('/api/offers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResults(json.results || []);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-no-repeat"></div>
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-cyan-900/40"></div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-20">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-white to-cyan-100 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-bold text-sm">✈</span>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Travel Orchestrator
              </h1>
              <span className="ml-2 px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">BETA</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-screen px-6 py-12">
          <div className="w-full max-w-4xl">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
                Find the Best Travel Deals
              </h2>
              <p className="text-2xl text-white/90 mb-4 drop-shadow-lg">
                Compare flights, hotels, and car rentals all in one place
              </p>
              <p className="text-lg text-white/80 drop-shadow-md">
                🏆 Lowest price guarantee • 🔍 Real-time search • 💫 All-in-one booking
              </p>
            </div>

            <form action={onSubmit} className="grid gap-6 bg-white/90 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-2xl shadow-black/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                🛫 Departing from
              </span>
              <div className="relative">
                <input
                  name="origin"
                  placeholder="DFW, LAX, JFK..."
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
                  required
                />
              </div>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                🛬 Going to
              </span>
              <div className="relative">
                <input
                  name="destination"
                  placeholder="CUN, CDG, NRT..."
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
                  required
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                📅 Departure Date
              </span>
              <input
                type="date"
                name="startDate"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                📅 Return Date
              </span>
              <input
                type="date"
                name="endDate"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                📊 Flexibility (± days)
              </span>
              <select
                name="flexibilityDays"
                defaultValue={0}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
              >
                <option value={0}>Exact dates</option>
                <option value={1}>± 1 day</option>
                <option value={2}>± 2 days</option>
                <option value={3}>± 3 days</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                💰 Budget (USD)
              </span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="budgetUsd"
                  placeholder="2000"
                  className="w-full rounded-xl border-2 border-gray-200 pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50"
                />
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              ✨ Include in search
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white/30 hover:bg-white/50 cursor-pointer transition-all duration-200 group">
                <input
                  type="checkbox"
                  name="includeHotel"
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏨</span>
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Hotels</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white/30 hover:bg-white/50 cursor-pointer transition-all duration-200 group">
                <input
                  type="checkbox"
                  name="includeCar"
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚗</span>
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Car Rental</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white/30 hover:bg-white/50 cursor-pointer transition-all duration-200 group">
                <input
                  type="checkbox"
                  name="includeActivities"
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Activities</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Searching for the best deals...
              </>
            ) : (
              <>
                <span className="text-lg">🔍</span>
                Find My Perfect Trip
              </>
            )}
          </button>
        </form>

            {error && (
              <div className="mt-6 bg-red-500/90 backdrop-blur-md border border-red-400/50 p-4 rounded-2xl shadow-xl">
                <div className="flex">
                  <span className="text-red-100 text-lg mr-3">⚠️</span>
                  <div>
                    <p className="text-red-100 font-medium">Search Error</p>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <section className="mt-8 space-y-4">
              {results.length > 0 && (
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                    Found {results.length} amazing deal{results.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="text-sm text-white/80 drop-shadow-md">
                    Sorted by best value
                  </div>
                </div>
              )}

              {results.map((r, index) => (
                <div key={r.id} className="bg-white/95 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{r.summary}</h3>
                    <p className="text-sm text-gray-500">Complete travel package</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    ${r.total.toFixed(0)}
                  </div>
                  <p className="text-sm text-gray-500">total cost</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {r.components.flight && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <span className="text-2xl">✈️</span>
                    <div>
                      <p className="font-medium text-blue-900">{r.components.flight.carrier}</p>
                      <p className="text-sm text-blue-700">{r.components.flight.stops} stops</p>
                    </div>
                  </div>
                )}
                {r.components.hotel && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <span className="text-2xl">🏨</span>
                    <div>
                      <p className="font-medium text-purple-900">{r.components.hotel.name}</p>
                      <p className="text-sm text-purple-700">Hotel stay</p>
                    </div>
                  </div>
                )}
                {r.components.car && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="font-medium text-orange-900">{r.components.car.vendor}</p>
                      <p className="text-sm text-orange-700">Car rental</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
                  <span>📋</span>
                  Book Complete Package
                </button>
                <button className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2">
                  <span>👁️</span>
                  Watch for Price Drops
                </button>
              </div>
            </div>
          ))}

              {!loading && results.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌍</div>
                  <p className="text-xl font-medium text-white/90 mb-2 drop-shadow-lg">Ready to explore the world?</p>
                  <p className="text-white/70 drop-shadow-md">Enter your travel details above to find the best deals</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
