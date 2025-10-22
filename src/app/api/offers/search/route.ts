import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        const { origin, destination, startDate, endDate, includeHotel, includeCar } = body;
        
        if (!origin || !destination || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate date logic
        if (new Date(startDate) >= new Date(endDate)) {
            return NextResponse.json(
                { error: 'Return date must be after departure date' },
                { status: 400 }
            );
        }

        // TODO: Call real travel API providers (Amadeus, Skyscanner, etc.)
        // For now, return mock packages with realistic data
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
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process search request' },
            { status: 500 }
        );
    }
}
