/**
 * Destination Data Management
 * 
 * This file contains destination-specific information that can be used to populate
 * destination pages dynamically. Currently manual, but could be moved to a CMS or database.
 */

export interface DestinationData {
    id: string;
    name: string;
    airportCode: string;
    fromHub: string;
    targetPrice: {
        economy: number;
        premiumEconomy?: number;
    };
    flightTime: string;
    stops: string;
    bestMonths: string[];
    tripLength: string;
    airlines: string[];
    seasonalPricing: {
        great: string;
        good: string;
        avoid: string;
    };
    bestTimeToVisit: {
        optimal: {
            month: string;
            reason: string;
            temperature: string;
            pros: string[];
            cons: string[];
        };
        alternatives: Array<{
            period: string;
            description: string;
            type: 'good' | 'okay' | 'avoid';
        }>;
    };
    highlights: string[];
    pricingTips: string[];
}

export const destinations: Record<string, DestinationData> = {
    rome: {
        id: 'rome',
        name: 'Rome',
        airportCode: 'FCO',
        fromHub: 'DFW',
        targetPrice: {
            economy: 900,
            premiumEconomy: 1200
        },
        flightTime: '10-12 hours',
        stops: '1-2 stops typical',
        bestMonths: ['May', 'October'],
        tripLength: '6-9 nights',
        airlines: ['American', 'Delta', 'United', 'Lufthansa'],
        seasonalPricing: {
            great: '$750-900',
            good: '$900-1200',
            avoid: '$1200+'
        },
        bestTimeToVisit: {
            optimal: {
                month: 'May',
                reason: 'Perfect weather, fewer crowds, shoulder season pricing',
                temperature: '65-75°F (18-24°C)',
                pros: [
                    'Lower humidity than summer',
                    'Fewer tourists than June-August',
                    'All attractions open with shorter lines',
                    'Perfect for walking the city',
                    'Great photo lighting'
                ],
                cons: [
                    'Occasional light rain (bring a jacket)',
                    'Some variability in weather'
                ]
            },
            alternatives: [
                {
                    period: 'October',
                    description: 'Similar to May, great weather and fewer crowds',
                    type: 'good'
                },
                {
                    period: 'April & November',
                    description: 'Good deals, mild weather, some rain',
                    type: 'okay'
                },
                {
                    period: 'July-August',
                    description: 'Extremely hot, crowded, highest prices',
                    type: 'avoid'
                }
            ]
        },
        highlights: [
            'Colosseum & Roman Forum (book skip-the-line tickets)',
            'Vatican Museums & Sistine Chapel (book ahead)',
            'Trevi Fountain (go early morning or late evening)',
            'Trastevere neighborhood for authentic food',
            'Sunrise at Spanish Steps or Pantheon'
        ],
        pricingTips: [
            'Be flexible with dates (even +/- 3 days helps significantly)',
            'Consider flying Tuesday-Thursday for lower prices',
            'Book 2-8 weeks in advance for shoulder season (May/October)',
            '1-stop flights are often $200-400 cheaper than nonstop',
            'Clear your browser cookies before booking'
        ]
    },

    // Template for future destinations
    // cancun: {
    //     id: 'cancun',
    //     name: 'Cancún',
    //     airportCode: 'CUN',
    //     fromHub: 'DFW',
    //     targetPrice: {
    //         economy: 350,
    //         premiumEconomy: 500
    //     },
    //     flightTime: '3.5-4 hours',
    //     stops: 'Direct available',
    //     bestMonths: ['December', 'January', 'February'],
    //     tripLength: '5-7 nights',
    //     airlines: ['American', 'Southwest', 'United'],
    //     // ... rest of the data structure
    // }
};

export function getDestination(id: string): DestinationData | null {
    return destinations[id] || null;
}

export function getAllDestinations(): DestinationData[] {
    return Object.values(destinations);
}

/**
 * Future Enhancement Ideas:
 * 
 * 1. Move to Database/CMS:
 *    - Store destination data in SQLite with your existing setup
 *    - Create admin interface to manage destination content
 *    - Add fields for seasonal pricing variations
 * 
 * 2. Dynamic Route Generation:
 *    - Use Next.js generateStaticParams for SEO-friendly URLs
 *    - Create template component that uses this data
 *    - Automatically generate pages for new destinations
 * 
 * 3. Content Sources:
 *    - Integrate with travel APIs for real-time pricing data
 *    - Pull weather data from APIs
 *    - Use flight booking APIs for current route availability
 * 
 * 4. User Personalization:
 *    - Track which destinations users view
 *    - Suggest destinations based on price watch history
 *    - Customize pricing based on user's departure airport
 * 
 * 5. SEO Optimization:
 *    - Generate meta tags from destination data
 *    - Create structured data for search engines
 *    - Auto-generate social media preview cards
 */
