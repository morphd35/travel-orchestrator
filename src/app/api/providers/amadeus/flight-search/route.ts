import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusApiKey, getAmadeusApiSecret, getAmadeusHost, validateServerEnv } from '@/lib/env';

// Validate environment on module load
const envValidation = validateServerEnv();
if (!envValidation.valid) {
  console.error('❌ Environment validation failed:');
  envValidation.errors.forEach(err => console.error('  -', err));
}

// Amadeus API configuration
const AMADEUS_API_KEY = getAmadeusApiKey();
const AMADEUS_API_SECRET = getAmadeusApiSecret();
const AMADEUS_HOST = getAmadeusHost();

// Token cache to avoid fetching new token for every request
let cachedToken: { access_token: string; expires_at: number } | null = null;

/**
 * Get OAuth 2.0 access token from Amadeus
 */
async function getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60 second buffer)
    if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
        return cachedToken.access_token;
    }

    try {
        const tokenUrl = `${AMADEUS_HOST}/v1/security/oauth2/token`;
        
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: AMADEUS_API_KEY,
                client_secret: AMADEUS_API_SECRET,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token fetch failed (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        // Cache token with expiration time
        cachedToken = {
            access_token: data.access_token,
            expires_at: Date.now() + (data.expires_in * 1000),
        };

        return data.access_token;
    } catch (error) {
        console.error('Failed to get Amadeus access token:', error);
        throw new Error('Authentication failed');
    }
}

/**
 * Search for flights using Amadeus API
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        const { 
            originLocationCode, 
            destinationLocationCode, 
            departureDate,
            adults = 1,
            returnDate,
            currencyCode = 'USD',
            max = 20
        } = body;

        if (!originLocationCode || !destinationLocationCode || !departureDate) {
            return NextResponse.json(
                { error: 'Missing required fields: originLocationCode, destinationLocationCode, departureDate' },
                { status: 400 }
            );
        }

        // Get access token
        const accessToken = await getAccessToken();

        // Build query parameters
        const params = new URLSearchParams({
            originLocationCode,
            destinationLocationCode,
            departureDate,
            adults: adults.toString(),
            currencyCode,
            max: max.toString(),
        });

        // Add optional return date for round trip
        if (returnDate) {
            params.append('returnDate', returnDate);
        }

        // Call Amadeus Flight Offers Search API
        const searchUrl = `${AMADEUS_HOST}/v2/shopping/flight-offers?${params.toString()}`;
        
        const searchResponse = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error('Amadeus API error:', errorText);
            
            if (searchResponse.status === 401) {
                // Token might be expired, clear cache and retry once
                cachedToken = null;
                return NextResponse.json(
                    { error: 'Authentication expired, please retry' },
                    { status: 401 }
                );
            }
            
            return NextResponse.json(
                { error: `Flight search failed (${searchResponse.status})` },
                { status: searchResponse.status }
            );
        }

        const flightData = await searchResponse.json();

        // Map results to simplified format
        const results = flightData.data?.map((offer: any) => {
            // Get price information
            const price = offer.price || {};
            const total = parseFloat(price.total || '0');
            const currency = price.currency || currencyCode;

            // Get first itinerary and first segment for carrier info
            const firstItinerary = offer.itineraries?.[0];
            const firstSegment = firstItinerary?.segments?.[0];
            const carrier = firstSegment?.carrierCode || 'Unknown';

            // Calculate total stops across all segments
            const stops = firstItinerary?.segments?.length - 1 || 0;

            return {
                id: offer.id,
                total,
                currency,
                carrier,
                stops,
                // Include full offer data for detailed display
                fullOffer: offer,
            };
        }) || [];

        return NextResponse.json({ 
            results,
            meta: {
                count: results.length,
                currency: currencyCode,
            }
        });

    } catch (error: any) {
        console.error('Flight search error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to search flights' },
            { status: 500 }
        );
    }
}
