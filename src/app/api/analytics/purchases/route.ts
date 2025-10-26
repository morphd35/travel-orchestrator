import { NextRequest, NextResponse } from 'next/server';

// This will eventually query real purchase data from the database
// For now, we'll return mock data that shows the structure

interface PurchaseAnalytics {
    sampleCount: number;
    avgPrice: number;
    medianPrice: number;
    minPrice: number;
    maxPrice: number;
    p25Price: number;
    p75Price: number;
    mostCommonAirline: string;
    directFlightPercentage: number;
    avgDaysAdvance: number;
    periodStart: string;
    periodEnd: string;
    priceDistribution: Array<{
        bucketMin: number;
        bucketMax: number;
        count: number;
        percentage: number;
    }>;
}

// Mock data generator - simulates real purchase data
function generateMockPurchaseData(origin: string, destination: string, cabin: string): PurchaseAnalytics {
    // Base price varies by route
    const routePricing: Record<string, number> = {
        'DFW-FCO': 900,  // Rome
        'DFW-CUN': 350,  // Cancun
        'DFW-LHR': 650,  // London
        'LAX-NRT': 800,  // Tokyo
        'JFK-CDG': 550,  // Paris
    };

    const routeKey = `${origin}-${destination}`;
    const basePrice = routePricing[routeKey] || 800;

    // Cabin multipliers
    const cabinMultipliers = {
        'economy': 1.0,
        'premium_economy': 1.5,
        'business': 3.0,
        'first': 5.0
    };

    const multiplier = cabinMultipliers[cabin as keyof typeof cabinMultipliers] || 1.0;
    const adjustedBase = basePrice * multiplier;

    // Generate realistic distribution
    const minPrice = Math.round(adjustedBase * 0.6);
    const maxPrice = Math.round(adjustedBase * 1.8);
    const medianPrice = Math.round(adjustedBase * 0.9);
    const avgPrice = Math.round(adjustedBase * 1.05);
    const p25Price = Math.round(adjustedBase * 0.75);
    const p75Price = Math.round(adjustedBase * 1.25);

    // Create price distribution buckets
    const bucketSize = Math.round((maxPrice - minPrice) / 8);
    const priceDistribution = [];
    let totalCount = 0;

    for (let i = 0; i < 8; i++) {
        const bucketMin = minPrice + (i * bucketSize);
        const bucketMax = bucketMin + bucketSize - 1;

        // Normal distribution simulation - more purchases around median
        const distanceFromMedian = Math.abs((bucketMin + bucketMax) / 2 - medianPrice);
        const normalizedDistance = distanceFromMedian / (maxPrice - minPrice);
        const count = Math.round(150 * Math.exp(-Math.pow(normalizedDistance * 3, 2)));

        totalCount += count;
        priceDistribution.push({
            bucketMin,
            bucketMax,
            count,
            percentage: 0 // Will calculate after
        });
    }

    // Calculate percentages
    priceDistribution.forEach(bucket => {
        bucket.percentage = (bucket.count / totalCount) * 100;
    });

    // Route-specific airline preferences
    const airlinesByRoute: Record<string, string> = {
        'DFW-FCO': 'AF', // Air France
        'DFW-CUN': 'AA', // American
        'DFW-LHR': 'BA', // British Airways
        'LAX-NRT': 'JL', // JAL
        'JFK-CDG': 'AF', // Air France
    };

    return {
        sampleCount: totalCount,
        avgPrice,
        medianPrice,
        minPrice,
        maxPrice,
        p25Price,
        p75Price,
        mostCommonAirline: airlinesByRoute[routeKey] || 'UA',
        directFlightPercentage: origin.includes('DFW') && destination === 'CUN' ? 85 : 35,
        avgDaysAdvance: Math.round(45 + Math.random() * 30),
        periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        priceDistribution
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const origin = searchParams.get('origin');
        const destination = searchParams.get('destination');
        const cabin = searchParams.get('cabin') || 'economy';

        if (!origin || !destination) {
            return NextResponse.json(
                { error: 'Origin and destination parameters required' },
                { status: 400 }
            );
        }

        // TODO: Query real database when we have purchase data
        // const purchaseData = await queryPurchaseAnalytics(origin, destination, cabin);

        // For now, return mock data
        const mockData = generateMockPurchaseData(origin, destination, cabin);

        return NextResponse.json(mockData, {
            headers: {
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });

    } catch (error) {
        console.error('Purchase analytics API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/*
Future implementation with real data:

async function queryPurchaseAnalytics(origin: string, destination: string, cabin: string) {
    const db = await getDatabase();
    const routeKey = `${origin}-${destination}`;
    const endDate = new Date();
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Get cached stats or compute them
    const stats = await db.get(`
        SELECT * FROM route_price_stats 
        WHERE route_key = ? AND cabin_type = ? 
        AND period_start >= ? AND period_end <= ?
        ORDER BY computed_at DESC LIMIT 1
    `, [routeKey, cabin, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

    if (stats && isRecentlyComputed(stats.computed_at)) {
        // Return cached data
        const distribution = await db.all(`
            SELECT * FROM price_distribution 
            WHERE route_key = ? AND cabin_type = ?
            ORDER BY price_bucket_min
        `, [routeKey, cabin]);

        return {
            ...stats,
            priceDistribution: distribution.map(d => ({
                bucketMin: d.price_bucket_min,
                bucketMax: d.price_bucket_max,
                count: d.purchase_count,
                percentage: d.percentage
            }))
        };
    }

    // Compute fresh stats from raw purchase data
    const purchases = await db.all(`
        SELECT * FROM flight_purchases 
        WHERE route_key = ? AND cabin_type = ? 
        AND travel_date >= ? AND travel_date <= ?
        ORDER BY total_price_usd
    `, [routeKey, cabin, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

    return computeAnalytics(purchases);
}
*/
