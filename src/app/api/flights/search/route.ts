import { NextRequest } from 'next/server';
import { unifiedFlightClient } from '@/lib/unifiedFlightClient';
import { userProfileManager } from '@/lib/databaseUserProfileManager';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            origin,
            destination,
            departDate,
            returnDate,
            adults = 1,
            children = 0,
            infants = 0,
            cabinClass = 'economy',
            currency = 'USD',
            max = 50,
            userId, // Optional - for search history recording
        } = body;

        // Validate required fields
        if (!origin || !destination || !departDate) {
            return Response.json(
                { error: 'Missing required fields: origin, destination, departDate' },
                { status: 400 }
            );
        }

        console.log(`🛫 New flight search: ${origin} → ${destination} on ${departDate}`);

        // Use unified flight search (Skyscanner + Amadeus fallback)
        const flights = await unifiedFlightClient.searchFlights({
            origin,
            destination,
            departDate,
            returnDate,
            adults,
            children,
            infants,
            cabinClass,
            currency,
            max,
        });

        const response = {
            results: flights,
            meta: {
                count: flights.length,
                currency,
                sources: [...new Set(flights.map(f => f.source))],
                airlines: [...new Set(flights.map(f => f.carrier))].sort(),
                priceRange: flights.length > 0 ? {
                    min: Math.min(...flights.map(f => f.price)),
                    max: Math.max(...flights.map(f => f.price))
                } : null
            }
        };

        console.log(`✅ Flight search completed: ${flights.length} results from ${response.meta.sources.join(', ')}`);
        console.log(`💰 Price range: ${response.meta.priceRange ? `$${response.meta.priceRange.min}-$${response.meta.priceRange.max}` : 'N/A'}`);
        console.log(`🛫 Airlines: ${response.meta.airlines.join(', ')}`);

        // Record search to user profile if user is authenticated
        if (userId && flights.length > 0) {
            try {
                const searchRecord = {
                    origin,
                    destination,
                    departDate,
                    returnDate,
                    adults,
                    children,
                    infants,
                    cabinClass,
                    currency,
                    resultCount: flights.length,
                    airlines: response.meta.airlines,
                    priceRange: response.meta.priceRange
                };

                userProfileManager.addRecentSearch(userId, searchRecord);
                console.log(`💾 Search recorded to user profile: ${userId}`);
            } catch (profileError) {
                console.error('⚠️ Failed to record search to user profile:', profileError);
                // Don't fail the search if profile save fails
            }
        }

        return Response.json(response);

    } catch (error: any) {
        console.error('❌ Unified flight search error:', error);

        return Response.json(
            {
                error: 'Flight search failed. Please try again.',
                details: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
