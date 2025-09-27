import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();

    // TODO: validate input; TODO: call real providers.
    // For now, return a couple of mock packages.
    const { origin, destination, startDate, endDate, includeHotel, includeCar } = body;

    const results = [
        {
            id: 'pkg_1',
            summary: `${origin} → ${destination}, ${startDate}–${endDate}, 3★ hotel`,
            total: 642,
            components: {
                flight: { carrier: 'AA', stops: 0 },
                hotel: includeHotel ? { name: 'Beach Inn' } : undefined,
                car: includeCar ? { vendor: 'Hertz' } : undefined,
            },
        },
        {
            id: 'pkg_2',
            summary: `${origin} → ${destination}, ${startDate}–${endDate}, 4★ hotel`,
            total: 788,
            components: {
                flight: { carrier: 'WN', stops: 1 },
                hotel: includeHotel ? { name: 'Sunset Suites' } : undefined,
                car: includeCar ? { vendor: 'Avis' } : undefined,
            },
        },
    ];

    return NextResponse.json({ results });
}
