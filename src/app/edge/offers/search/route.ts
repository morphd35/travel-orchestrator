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

        // Call Amadeus Flight Search API
        const flightSearchUrl = new URL('/edge/providers/amadeus/flight-search', req.url);
        
        const flightResponse = await fetch(flightSearchUrl.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate: startDate,
                returnDate: endDate,
                adults: 1,
                currencyCode: 'USD',
                max: 20,
            }),
        });

        if (!flightResponse.ok) {
            console.error('Flight search failed:', await flightResponse.text());
            throw new Error('Failed to fetch flight data');
        }

        const flightData = await flightResponse.json();
        const flights = flightData.results || [];

        // Build travel packages from real flight data
        const results = flights.map((flight: any, index: number) => {
            const flightPrice = flight.total || 0;
            
            // Add estimated hotel price if requested (mock for now)
            const hotelPrice = includeHotel ? 150 * calculateNights(startDate, endDate) : 0;
            
            // Add estimated car rental if requested (mock for now)
            const carPrice = includeCar ? 50 * calculateNights(startDate, endDate) : 0;
            
            const totalPrice = flightPrice + hotelPrice + carPrice;

            return {
                id: `pkg_${flight.id || index}`,
                summary: `${origin} → ${destination}, ${startDate}–${endDate}${includeHotel ? ', Hotel included' : ''}${includeCar ? ', Car rental' : ''}`,
                total: Math.round(totalPrice * 100) / 100,
                components: {
                    flight: {
                        carrier: flight.carrier,
                        stops: flight.stops,
                        price: flightPrice,
                    },
                    hotel: includeHotel ? {
                        name: getHotelName(index),
                        pricePerNight: 150,
                        nights: calculateNights(startDate, endDate),
                    } : undefined,
                    car: includeCar ? {
                        vendor: getCarVendor(index),
                        pricePerDay: 50,
                        days: calculateNights(startDate, endDate),
                    } : undefined,
                },
                // Include full flight offer for detailed view
                fullFlightOffer: flight.fullOffer,
            };
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process search request' },
            { status: 500 }
        );
    }
}

// Helper functions
function calculateNights(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getHotelName(index: number): string {
    const hotels = [
        'Marriott Downtown',
        'Hilton City Center',
        'Hyatt Regency',
        'Sheraton Plaza',
        'InterContinental',
        'Westin Grand',
        'DoubleTree Suites',
        'Courtyard by Marriott',
    ];
    return hotels[index % hotels.length];
}

function getCarVendor(index: number): string {
    const vendors = ['Hertz', 'Enterprise', 'Avis', 'Budget', 'National', 'Alamo'];
    return vendors[index % vendors.length];
}
