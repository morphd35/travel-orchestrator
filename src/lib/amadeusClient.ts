// Stable Amadeus client with OAuth token caching and result caching

export type NormalFlight = {
    total: number;
    currency: string;
    carrier: string;
    stopsOut: number;
    stopsBack?: number;
    raw: any;
};

// Typed errors for graceful degradation
export class AmadeusRateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AmadeusRateLimitError';
    }
}

export class AmadeusProviderError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AmadeusProviderError';
    }
}

export type FlightSearchParams = {
    origin: string;
    destination: string;
    departDate: string; // YYYY-MM-DD
    returnDate?: string; // YYYY-MM-DD
    adults?: number;
    currency?: string;
    max?: number;
};

// Environment variables
const AMADEUS_HOST = process.env.AMADEUS_HOST || 'https://test.api.amadeus.com';
const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

// Token cache
interface TokenCache {
    token: string;
    expiresAt: number; // timestamp in ms
}

let tokenCache: TokenCache | null = null;

// Result cache - TTL of 600 seconds (10 minutes)
interface CacheEntry {
    data: NormalFlight[];
    expiresAt: number;
}

const resultCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 600 * 1000; // 10 minutes

/**
 * Get cached access token or fetch a new one
 */
export async function getToken(): Promise<string> {
    // Check if we have a valid cached token
    if (tokenCache && tokenCache.expiresAt > Date.now()) {
        return tokenCache.token;
    }

    // Validate environment variables
    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
        throw new Error('AMADEUS_API_KEY and AMADEUS_API_SECRET must be set in environment variables');
    }

    try {
        // Add timeout and retry logic for better reliability
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(`${AMADEUS_HOST}/v1/security/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: AMADEUS_API_KEY,
                client_secret: AMADEUS_API_SECRET,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();

            // Handle rate limiting
            if (response.status === 429) {
                throw new AmadeusRateLimitError(`Rate limit exceeded: ${response.status} ${response.statusText}`);
            }

            // Handle server errors
            if (response.status >= 500) {
                throw new AmadeusProviderError(`Provider server error: ${response.status} ${response.statusText}`);
            }

            throw new Error(`OAuth token request failed: ${response.status} ${response.statusText}. Body: ${errorText.slice(0, 200)}`);
        }

        const tokenData = await response.json();

        if (!tokenData.access_token || !tokenData.expires_in) {
            throw new Error('Invalid token response: missing access_token or expires_in');
        }

        // Cache the token (subtract 60 seconds for safety margin)
        const expiresInMs = (tokenData.expires_in - 60) * 1000;
        tokenCache = {
            token: tokenData.access_token,
            expiresAt: Date.now() + expiresInMs,
        };

        console.log('✅ New Amadeus token obtained, expires in', Math.round(expiresInMs / 1000), 'seconds');

        return tokenCache.token;

    } catch (error: any) {
        console.error('❌ Failed to get Amadeus token:', error);
        tokenCache = null; // Clear cache on error

        // Handle specific connection errors
        if (error.name === 'AbortError') {
            throw new AmadeusProviderError('Connection timeout to Amadeus API. Please try again later.');
        }

        if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('Connect Timeout')) {
            throw new AmadeusProviderError('Connection timeout to Amadeus API. Please try again later.');
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new AmadeusProviderError('Unable to connect to Amadeus API. Please check your internet connection.');
        }

        throw error;
    }
}

/**
 * Normalize Amadeus flight offer to our simplified format
 */
function normalizeFlightOffer(offer: any): NormalFlight {
    try {
        const price = offer.price;
        const itineraries = offer.itineraries || [];

        // Get the first segment of outbound journey for carrier info
        const outboundSegments = itineraries[0]?.segments || [];
        const carrier = outboundSegments[0]?.carrierCode || 'UNKNOWN';

        // Count stops (segments - 1)
        const stopsOut = Math.max(0, outboundSegments.length - 1);

        let stopsBack: number | undefined;
        if (itineraries.length > 1) {
            const returnSegments = itineraries[1]?.segments || [];
            stopsBack = Math.max(0, returnSegments.length - 1);
        }

        return {
            total: parseFloat(price?.total || '0'),
            currency: price?.currency || 'USD',
            carrier,
            stopsOut,
            stopsBack,
            raw: offer,
        };
    } catch (error) {
        console.warn('⚠️ Failed to normalize flight offer:', error);
        return {
            total: 0,
            currency: 'USD',
            carrier: 'UNKNOWN',
            stopsOut: 0,
            raw: offer,
        };
    }
}

/**
 * Search flights with caching
 */
export async function searchFlights(params: FlightSearchParams): Promise<NormalFlight[]> {
    // Normalize parameters
    const normalizedParams = {
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
        returnDate: params.returnDate,
        adults: params.adults || 1,
        currency: params.currency || 'USD',
        max: params.max || 20,
    };

    // Generate cache key
    const cacheKey = JSON.stringify(normalizedParams);

    // Check cache first
    const cached = resultCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        console.log('🎯 Cache hit for flight search:', cacheKey.slice(0, 100) + '...');
        return cached.data;
    }

    try {
        // Get access token
        const token = await getToken();

        // Build API request parameters
        const apiParams = new URLSearchParams({
            originLocationCode: normalizedParams.origin,
            destinationLocationCode: normalizedParams.destination,
            departureDate: normalizedParams.departDate,
            adults: normalizedParams.adults.toString(),
            currencyCode: normalizedParams.currency,
            max: normalizedParams.max.toString(),
        });

        if (normalizedParams.returnDate) {
            apiParams.append('returnDate', normalizedParams.returnDate);
        }

        // Make API request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for flight search

        const response = await fetch(`${AMADEUS_HOST}/v2/shopping/flight-offers?${apiParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();

            // Handle rate limiting
            if (response.status === 429) {
                throw new AmadeusRateLimitError(`Flight search rate limit exceeded: ${response.status} ${response.statusText}`);
            }

            // Handle server errors
            if (response.status >= 500) {
                throw new AmadeusProviderError(`Flight search provider error: ${response.status} ${response.statusText}`);
            }

            throw new Error(`Flight search failed: ${response.status} ${response.statusText}. Body: ${errorText.slice(0, 300)}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            console.warn('⚠️ Unexpected API response format:', data);
            return [];
        }

        // Debug: Log first raw flight for analysis
        if (data.data && data.data.length > 0) {
            console.log('🔍 First raw flight from Amadeus:', JSON.stringify(data.data[0], null, 2).substring(0, 500) + '...');
        }

        // Normalize results
        const normalizedFlights = data.data.map(normalizeFlightOffer);

        // Debug: Log first normalized flight 
        if (normalizedFlights.length > 0) {
            console.log('🔄 First normalized flight:', JSON.stringify(normalizedFlights[0], null, 2));
        }

        // Cache results
        resultCache.set(cacheKey, {
            data: normalizedFlights,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });

        console.log(`✅ Flight search completed: ${normalizedFlights.length} offers found and cached`);

        return normalizedFlights;

    } catch (error: any) {
        console.error('❌ Flight search error:', error);

        // Handle specific connection errors
        if (error.name === 'AbortError') {
            throw new AmadeusProviderError('Flight search timeout. Please try again later.');
        }

        if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('Connect Timeout')) {
            throw new AmadeusProviderError('Flight search timeout. Please try again later.');
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new AmadeusProviderError('Unable to connect to flight search service. Please check your internet connection.');
        }

        throw error;
    }
}

/**
 * Clear all caches (useful for testing)
 */
export function clearCaches(): void {
    tokenCache = null;
    resultCache.clear();
    console.log('🧹 All caches cleared');
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getCacheStats() {
    return {
        tokenCached: tokenCache !== null,
        tokenExpiresAt: tokenCache?.expiresAt,
        resultCacheSize: resultCache.size,
        resultCacheKeys: Array.from(resultCache.keys()).map(key => key.slice(0, 100) + '...'),
    };
}
