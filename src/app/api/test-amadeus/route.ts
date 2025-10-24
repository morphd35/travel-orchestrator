import { NextRequest } from 'next/server';
import { searchFlights, getCacheStats, clearCaches } from '@/lib/amadeusClient';
import { z } from 'zod';

// Validation schema for flight search parameters
const FlightSearchSchema = z.object({
    origin: z.string().min(3).max(3, 'Origin must be 3-letter IATA code'),
    destination: z.string().min(3).max(3, 'Destination must be 3-letter IATA code'),
    departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Depart date must be YYYY-MM-DD format'),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Return date must be YYYY-MM-DD format').optional(),
    adults: z.number().int().min(1).max(9).optional(),
    currency: z.string().length(3).optional(),
    max: z.number().int().min(1).max(250).optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Special endpoints
        if (searchParams.get('action') === 'stats') {
            return Response.json(getCacheStats());
        }

        if (searchParams.get('action') === 'clear') {
            clearCaches();
            return Response.json({ message: 'Caches cleared successfully' });
        }

        // Parse and validate search parameters
        const rawParams = {
            origin: searchParams.get('origin'),
            destination: searchParams.get('destination'),
            departDate: searchParams.get('departDate'),
            returnDate: searchParams.get('returnDate') || undefined,
            adults: searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined,
            currency: searchParams.get('currency') || undefined,
            max: searchParams.get('max') ? parseInt(searchParams.get('max')!) : undefined,
        };

        // Remove undefined values
        const cleanParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== undefined && value !== null)
        );

        // Validate required parameters
        if (!cleanParams.origin || !cleanParams.destination || !cleanParams.departDate) {
            return Response.json(
                {
                    error: 'Missing required parameters',
                    required: ['origin', 'destination', 'departDate'],
                    received: Object.keys(cleanParams)
                },
                { status: 400 }
            );
        }

        // Validate with Zod
        const validatedParams = FlightSearchSchema.parse(cleanParams);

        // Perform flight search
        const startTime = Date.now();
        const flights = await searchFlights(validatedParams);
        const duration = Date.now() - startTime;

        return Response.json({
            success: true,
            searchParams: validatedParams,
            resultsCount: flights.length,
            searchDurationMs: duration,
            flights: flights.slice(0, 5), // Return first 5 for brevity
            cacheStats: getCacheStats(),
        });

    } catch (error) {
        console.error('❌ Test flight search error:', error);

        if (error instanceof z.ZodError) {
            return Response.json(
                {
                    error: 'Validation failed',
                    details: error.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                        code: issue.code,
                    })),
                },
                { status: 400 }
            );
        }

        // Handle API errors
        if (error instanceof Error) {
            const statusMatch = error.message.match(/failed: (\d+)/);
            const status = statusMatch ? parseInt(statusMatch[1]) : 500;

            return Response.json(
                {
                    error: 'Flight search failed',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                },
                { status: Math.min(status, 500) } // Cap at 500 for server errors
            );
        }

        return Response.json(
            { error: 'Internal server error', timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}
