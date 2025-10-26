import Link from 'next/link';
import { notFound } from 'next/navigation';
import WhatOthersPaid from '@/components/WhatOthersPaid';

interface DestinationPageProps {
    params: {
        destination: string;
    };
    searchParams: {
        from?: string;
        airportCode?: string;
    };
}

// This will eventually come from an API or database
async function getDestinationData(destination: string, fromHub?: string) {
    // For now, mock some basic data structure
    // In the future, this would call an external API or database

    const destinationKey = destination.toLowerCase();

    // Basic destination mapping - this would come from API
    const destinationMap: Record<string, any> = {
        'rome': {
            name: 'Rome',
            country: 'Italy',
            airportCode: 'FCO',
            alternateAirports: ['CIA'],
            climate: 'Mediterranean',
            currency: 'EUR',
            language: 'Italian'
        },
        'cancun': {
            name: 'Cancún',
            country: 'Mexico',
            airportCode: 'CUN',
            alternateAirports: [],
            climate: 'Tropical',
            currency: 'MXN',
            language: 'Spanish'
        },
        'london': {
            name: 'London',
            country: 'United Kingdom',
            airportCode: 'LHR',
            alternateAirports: ['LGW', 'STN', 'LTN'],
            climate: 'Temperate',
            currency: 'GBP',
            language: 'English'
        },
        'tokyo': {
            name: 'Tokyo',
            country: 'Japan',
            airportCode: 'NRT',
            alternateAirports: ['HND'],
            climate: 'Subtropical',
            currency: 'JPY',
            language: 'Japanese'
        },
        'las': {
            name: 'Las Vegas',
            country: 'United States',
            airportCode: 'LAS',
            alternateAirports: [],
            climate: 'Desert',
            currency: 'USD',
            language: 'English'
        },
        'lasvegas': {
            name: 'Las Vegas',
            country: 'United States',
            airportCode: 'LAS',
            alternateAirports: [],
            climate: 'Desert',
            currency: 'USD',
            language: 'English'
        },
        'vegas': {
            name: 'Las Vegas',
            country: 'United States',
            airportCode: 'LAS',
            alternateAirports: [],
            climate: 'Desert',
            currency: 'USD',
            language: 'English'
        },
        'orlando': {
            name: 'Orlando',
            country: 'United States',
            airportCode: 'MCO',
            alternateAirports: ['SFB'],
            climate: 'Subtropical',
            currency: 'USD',
            language: 'English'
        },
        'mco': {
            name: 'Orlando',
            country: 'United States',
            airportCode: 'MCO',
            alternateAirports: ['SFB'],
            climate: 'Subtropical',
            currency: 'USD',
            language: 'English'
        },
        'miami': {
            name: 'Miami',
            country: 'United States',
            airportCode: 'MIA',
            alternateAirports: ['FLL'],
            climate: 'Tropical',
            currency: 'USD',
            language: 'English'
        },
        'mia': {
            name: 'Miami',
            country: 'United States',
            airportCode: 'MIA',
            alternateAirports: ['FLL'],
            climate: 'Tropical',
            currency: 'USD',
            language: 'English'
        },
        'newyork': {
            name: 'New York',
            country: 'United States',
            airportCode: 'JFK',
            alternateAirports: ['LGA', 'EWR'],
            climate: 'Continental',
            currency: 'USD',
            language: 'English'
        },
        'nyc': {
            name: 'New York',
            country: 'United States',
            airportCode: 'JFK',
            alternateAirports: ['LGA', 'EWR'],
            climate: 'Continental',
            currency: 'USD',
            language: 'English'
        },
        'jfk': {
            name: 'New York',
            country: 'United States',
            airportCode: 'JFK',
            alternateAirports: ['LGA', 'EWR'],
            climate: 'Continental',
            currency: 'USD',
            language: 'English'
        },
        'losangeles': {
            name: 'Los Angeles',
            country: 'United States',
            airportCode: 'LAX',
            alternateAirports: ['BUR', 'LGB'],
            climate: 'Mediterranean',
            currency: 'USD',
            language: 'English'
        },
        'lax': {
            name: 'Los Angeles',
            country: 'United States',
            airportCode: 'LAX',
            alternateAirports: ['BUR', 'LGB'],
            climate: 'Mediterranean',
            currency: 'USD',
            language: 'English'
        },
        'la': {
            name: 'Los Angeles',
            country: 'United States',
            airportCode: 'LAX',
            alternateAirports: ['BUR', 'LGB'],
            climate: 'Mediterranean',
            currency: 'USD',
            language: 'English'
        }
    };

    const baseData = destinationMap[destinationKey];

    if (!baseData) {
        // Generate basic data for unknown destinations
        return {
            name: destination.charAt(0).toUpperCase() + destination.slice(1),
            country: 'Unknown',
            airportCode: 'XXX',
            alternateAirports: [],
            climate: 'Unknown',
            currency: 'USD',
            language: 'Local',
            isGeneric: true
        };
    }

    // Pricing logic based on from hub
    const fromAirport = fromHub || 'DFW';
    let targetPrice = 1000; // default
    let flightTime = '8-12 hours'; // default

    // Simple pricing logic - would come from flight API
    if (destinationKey === 'rome') {
        targetPrice = fromAirport === 'DFW' ? 900 : 800;
        flightTime = fromAirport === 'DFW' ? '10-12 hours' : '8-10 hours';
    } else if (destinationKey === 'cancun') {
        targetPrice = fromAirport === 'DFW' ? 350 : 500;
        flightTime = fromAirport === 'DFW' ? '3.5-4 hours' : '5-8 hours';
    } else if (destinationKey === 'london') {
        targetPrice = fromAirport === 'DFW' ? 650 : 500;
        flightTime = fromAirport === 'DFW' ? '9-11 hours' : '6-9 hours';
    } else if (['las', 'lasvegas', 'vegas'].includes(destinationKey)) {
        targetPrice = fromAirport === 'DFW' ? 180 : 250;
        flightTime = fromAirport === 'DFW' ? '2.5-3 hours' : '2-5 hours';
    } else if (['orlando', 'mco'].includes(destinationKey)) {
        targetPrice = fromAirport === 'DFW' ? 220 : 280;
        flightTime = fromAirport === 'DFW' ? '2.5-3 hours' : '2-5 hours';
    } else if (['miami', 'mia'].includes(destinationKey)) {
        targetPrice = fromAirport === 'DFW' ? 280 : 320;
        flightTime = fromAirport === 'DFW' ? '3-3.5 hours' : '2-5 hours';
    } else if (['newyork', 'nyc', 'jfk'].includes(destinationKey)) {
        targetPrice = fromAirport === 'DFW' ? 320 : 280;
        flightTime = fromAirport === 'DFW' ? '3.5-4 hours' : '2-6 hours';
    } else if (['losangeles', 'lax', 'la'].includes(destinationKey)) {
        targetPrice = fromAirport === 'DFW' ? 240 : 300;
        flightTime = fromAirport === 'DFW' ? '3-3.5 hours' : '2-6 hours';
    }

    return {
        ...baseData,
        fromHub: fromAirport,
        targetPrice,
        flightTime,
        stops: targetPrice < 400 ? 'Direct available' : '1-2 stops typical',
        tripLength: '5-8 nights',
        bestMonths: ['May', 'September', 'October'],
        lastUpdated: new Date().toISOString()
    };
}

export default async function DynamicDestinationPage({ params, searchParams }: DestinationPageProps) {
    const { destination } = await params;
    const { from, airportCode } = await searchParams;

    const destinationData = await getDestinationData(destination, from);    // If it's a completely unknown destination with no data, show 404
    if (!destinationData) {
        notFound();
    }

    const isGeneric = destinationData.isGeneric;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-600 to-orange-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Flying to {destinationData.name}
                        </h1>
                        <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
                            {isGeneric ? (
                                `Discover travel information and flight deals to ${destinationData.name}. We're gathering the latest data for this destination.`
                            ) : (
                                `Everything you need to know about finding great deals on flights from ${destinationData.fromHub} to ${destinationData.name}, plus when to go and what to expect.`
                            )}
                        </p>

                        {!isGeneric && (
                            <div className="bg-white bg-opacity-95 rounded-lg p-4 inline-block border-2 border-yellow-400">
                                <p className="text-gray-900 font-semibold">
                                    💰 Target Price: <span className="text-green-700 font-bold">${destinationData.targetPrice} roundtrip</span> from {destinationData.fromHub}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {isGeneric ? (
                    /* Generic destination content */
                    <div className="text-center">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
                            <div className="text-4xl mb-4">🔍</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                We're Building Your {destinationData.name} Guide
                            </h2>
                            <p className="text-gray-700 mb-6">
                                This destination is new to our system. We're working on gathering comprehensive travel information,
                                flight pricing data, and local insights for {destinationData.name}.
                            </p>
                            <div className="bg-white rounded-lg p-6 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">What we can help with right now:</h3>
                                <ul className="text-left space-y-2 text-gray-600">
                                    <li>• Set up price watches for flights to {destinationData.name}</li>
                                    <li>• Monitor deals from your preferred departure airport</li>
                                    <li>• Get email alerts when prices drop</li>
                                    <li>• Compare flight options when available</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Rich destination content */
                    <>
                        {/* Quick Stats */}
                        <div className="grid md:grid-cols-4 gap-6 mb-16">
                            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                                <div className="text-2xl mb-2">🕐</div>
                                <div className="font-semibold text-gray-900">Flight Time</div>
                                <div className="text-gray-600">{destinationData.flightTime}</div>
                                <div className="text-sm text-gray-500">{destinationData.stops}</div>
                            </div>
                            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                                <div className="text-2xl mb-2">🌍</div>
                                <div className="font-semibold text-gray-900">Country</div>
                                <div className="text-gray-600">{destinationData.country}</div>
                                <div className="text-sm text-gray-500">{destinationData.language}</div>
                            </div>
                            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                                <div className="text-2xl mb-2">💱</div>
                                <div className="font-semibold text-gray-900">Currency</div>
                                <div className="text-gray-600">{destinationData.currency}</div>
                                <div className="text-sm text-gray-500">{destinationData.climate} climate</div>
                            </div>
                            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                                <div className="text-2xl mb-2">✈️</div>
                                <div className="font-semibold text-gray-900">Airport</div>
                                <div className="text-gray-600">{destinationData.airportCode}</div>
                                <div className="text-sm text-gray-500">
                                    {destinationData.alternateAirports.length > 0 ?
                                        `+${destinationData.alternateAirports.length} more` :
                                        'Main airport'
                                    }
                                </div>
                            </div>
                        </div>

                        {/* What Others Paid Section */}
                        <WhatOthersPaid
                            origin={destinationData.fromHub}
                            destination={destinationData.airportCode}
                            cabin="economy"
                        />

                        {/* Pricing Section */}
                        <section className="mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Flight Pricing Guide</h2>
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        {destinationData.fromHub} → {destinationData.name} Pricing
                                    </h3>
                                    <p className="text-gray-700 mb-6">
                                        Based on current market data and seasonal trends for flights to {destinationData.name}.
                                    </p>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                                    <h4 className="font-semibold text-yellow-900 mb-2">💡 Pricing Strategy:</h4>
                                    <p className="text-yellow-800">
                                        Target price of <strong>${destinationData.targetPrice}</strong> represents a good deal for this route.
                                        Set up a price watch to get notified when flights hit this target or better.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* Price Watch CTA - Always shown */}
                <section className="text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">
                            Get Notified When {destinationData.name} Flights Drop
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Set up a price watch and we'll email you the moment flights to {destinationData.name} hit your target price.
                            No more daily checking – we'll send you direct booking links when deals appear.
                        </p>
                        <div className="space-x-4">
                            <Link
                                href={`/?from=${destinationData.fromHub}&to=${destinationData.airportCode}&watchPrice=${destinationData.targetPrice}&destination=${destination}`}
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                            >
                                Watch {destinationData.name} Flights
                            </Link>
                            <Link
                                href="/about"
                                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                            >
                                How It Works
                            </Link>
                        </div>
                        <div className="mt-6 text-sm text-blue-200">
                            {!isGeneric && (
                                <p>💡 <strong>Tip:</strong> Set your target at ${destinationData.targetPrice} for good value on this route</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: DestinationPageProps) {
    const { destination } = await params;
    const destinationName = destination.charAt(0).toUpperCase() + destination.slice(1);

    return {
        title: `${destinationName} Travel Guide - Flight Deals & Tips | Travel Conductor`,
        description: `Find the best flight deals to ${destinationName}. Get pricing insights, travel tips, and set up price watches for flights to ${destinationName}.`,
    };
}
