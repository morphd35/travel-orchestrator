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
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Trip Builder (MVP)</h1>

        <form action={onSubmit} className="grid gap-4 bg-white p-4 rounded-2xl shadow">
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Origin (IATA)</span>
              <input name="origin" placeholder="DFW" className="border rounded px-3 py-2" required />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Destination (IATA)</span>
              <input name="destination" placeholder="CUN" className="border rounded px-3 py-2" required />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Start</span>
              <input type="date" name="startDate" className="border rounded px-3 py-2" required />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">End</span>
              <input type="date" name="endDate" className="border rounded px-3 py-2" required />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Flexibility (± days)</span>
              <input type="number" min={0} max={3} defaultValue={0} name="flexibilityDays" className="border rounded px-3 py-2" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Budget (USD)</span>
              <input type="number" name="budgetUsd" placeholder="1000" className="border rounded px-3 py-2" />
            </label>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="includeHotel" className="size-4" />
              <span>Hotel</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="includeCar" className="size-4" />
              <span>Car</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="includeActivities" className="size-4" />
              <span>Activities</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error && <p className="text-red-600 mt-4">Error: {error}</p>}

        <section className="mt-6 grid gap-3">
          {results.map((r) => (
            <div key={r.id} className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{r.summary}</h3>
                <div className="text-lg font-semibold">${r.total.toFixed(0)}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {r.components.flight && <>Flight: {r.components.flight.carrier} • {r.components.flight.stops} stops<br /></>}
                {r.components.hotel && <>Hotel: {r.components.hotel.name}<br /></>}
                {r.components.car && <>Car: {r.components.car.vendor}<br /></>}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 rounded-lg border">Book each step</button>
                <button className="px-3 py-1.5 rounded-lg border">Watch this</button>
              </div>
            </div>
          ))}

          {!loading && results.length === 0 && (
            <p className="text-gray-500">No results yet—try a search.</p>
          )}
        </section>
      </div>
    </main>
  );
}
