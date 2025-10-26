import { NextRequest, NextResponse } from 'next/server';

// This would eventually connect to external APIs or databases
// For now, it's a centralized place to manage destination data

interface DestinationData {
    name: string;
    country: string;
    airportCode: string;
    alternateAirports: string[];
    climate: string;
    currency: string;
    language: string;
    targetPrice?: number;
    flightTime?: string;
    stops?: string;
    tripLength?: string;
    bestMonths?: string[];
    isGeneric?: boolean;
    fromHub?: string;
    lastUpdated: string;
}

// Destination database - in the future this could be:
// 1. External travel API (like TripAdvisor, Lonely Planet API)
// 2. SQLite database with admin interface
// 3. Headless CMS (Contentful, Strapi)
// 4. Third-party destination data service
const destinationDatabase: Record<string, Partial<DestinationData>> = {
    'rome': {
        name: 'Rome',
        country: 'Italy',
        airportCode: 'FCO',
        alternateAirports: ['CIA'],
        climate: 'Mediterranean',
        currency: 'EUR',
        language: 'Italian',
        tripLength: '6-9 nights',
        bestMonths: ['May', 'September', 'October']
    },
    'cancun': {
        name: 'Cancún',
        country: 'Mexico',
        airportCode: 'CUN',
        alternateAirports: [],
        climate: 'Tropical',
        currency: 'MXN',
        language: 'Spanish',
        tripLength: '5-7 nights',
        bestMonths: ['December', 'January', 'February', 'March']
    },
    'london': {
        name: 'London',
        country: 'United Kingdom',
        airportCode: 'LHR',
        alternateAirports: ['LGW', 'STN', 'LTN'],
        climate: 'Temperate',
        currency: 'GBP',
        language: 'English',
        tripLength: '4-7 nights',
        bestMonths: ['May', 'June', 'September', 'October']
    },
    'tokyo': {
        name: 'Tokyo',
        country: 'Japan',
        airportCode: 'NRT',
        alternateAirports: ['HND'],
        climate: 'Subtropical',
        currency: 'JPY',
        language: 'Japanese',
        tripLength: '7-10 nights',
        bestMonths: ['March', 'April', 'May', 'October', 'November']
    },
    'paris': {
        name: 'Paris',
        country: 'France',
        airportCode: 'CDG',
        alternateAirports: ['ORY'],
        climate: 'Temperate',
        currency: 'EUR',
        language: 'French',
        tripLength: '4-6 nights',
        bestMonths: ['April', 'May', 'September', 'October']
    }
};

// Pricing logic based on routes - this would come from flight APIs
function calculatePricing(destination: string, fromHub: string): {
    targetPrice: number;
    flightTime: string;
    stops: string;
} {
    const pricingMatrix: Record<string, Record<string, any>> = {
        'rome': {
            'DFW': { targetPrice: 900, flightTime: '10-12 hours', stops: '1-2 stops typical' },
            'LAX': { targetPrice: 800, flightTime: '12-14 hours', stops: '1-2 stops typical' },
            'JFK': { targetPrice: 650, flightTime: '8-9 hours', stops: 'Direct or 1 stop' }
        },
        'cancun': {
            'DFW': { targetPrice: 350, flightTime: '3.5-4 hours', stops: 'Direct available' },
            'LAX': { targetPrice: 450, flightTime: '5-6 hours', stops: 'Direct or 1 stop' },
            'JFK': { targetPrice: 400, flightTime: '4-5 hours', stops: 'Direct available' }
        },
        'london': {
            'DFW': { targetPrice: 650, flightTime: '9-11 hours', stops: 'Direct or 1 stop' },
            'LAX': { targetPrice: 600, flightTime: '11-13 hours', stops: '1-2 stops typical' },
            'JFK': { targetPrice: 500, flightTime: '7-8 hours', stops: 'Direct available' }
        },
        'tokyo': {
            'DFW': { targetPrice: 1200, flightTime: '13-15 hours', stops: '1-2 stops typical' },
            'LAX': { targetPrice: 800, flightTime: '11-13 hours', stops: 'Direct or 1 stop' },
            'JFK': { targetPrice: 1000, flightTime: '14-16 hours', stops: '1-2 stops typical' }
        },
        'paris': {
            'DFW': { targetPrice: 700, flightTime: '9-11 hours', stops: 'Direct or 1 stop' },
            'LAX': { targetPrice: 650, flightTime: '11-13 hours', stops: '1-2 stops typical' },
            'JFK': { targetPrice: 550, flightTime: '7-8 hours', stops: 'Direct available' }
        }
    };

    const route = pricingMatrix[destination]?.[fromHub];
    if (route) {
        return route;
    }

    // Default pricing for unknown routes
    return {
        targetPrice: 1000,
        flightTime: '8-12 hours',
        stops: '1-2 stops typical'
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const destination = searchParams.get('destination')?.toLowerCase();
        const fromHub = searchParams.get('from') || 'DFW';

        if (!destination) {
            return NextResponse.json({ error: 'Destination parameter required' }, { status: 400 });
        }

        const baseData = destinationDatabase[destination];
        const pricing = calculatePricing(destination, fromHub);

        if (!baseData) {
            // Return generic data for unknown destinations
            const genericData: DestinationData = {
                name: destination.charAt(0).toUpperCase() + destination.slice(1),
                country: 'Unknown',
                airportCode: 'XXX',
                alternateAirports: [],
                climate: 'Unknown',
                currency: 'USD',
                language: 'Local',
                isGeneric: true,
                fromHub,
                ...pricing,
                lastUpdated: new Date().toISOString()
            };
            return NextResponse.json(genericData);
        }

        const fullData: DestinationData = {
            ...baseData,
            fromHub,
            ...pricing,
            lastUpdated: new Date().toISOString()
        } as DestinationData;

        return NextResponse.json(fullData);

    } catch (error) {
        console.error('Destination API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Future enhancement: POST endpoint to update destination data
export async function POST(request: NextRequest) {
    try {
        // This would allow updating destination data
        // Could be used by admin interface or external data sync
        return NextResponse.json({ message: 'Destination updates not yet implemented' }, { status: 501 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
