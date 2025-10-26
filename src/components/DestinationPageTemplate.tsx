import Link from 'next/link';
import { DestinationData } from '@/lib/destinationData';

interface DestinationPageProps {
    destination: DestinationData;
}

export default function DestinationPageTemplate({ destination }: DestinationPageProps) {
    const {
        name,
        airportCode,
        fromHub,
        targetPrice,
        flightTime,
        stops,
        bestMonths,
        tripLength,
        airlines,
        seasonalPricing,
        bestTimeToVisit,
        highlights,
        pricingTips
    } = destination;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-600 to-orange-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Flying to {name}
                        </h1>
                        <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
                            Everything you need to know about finding great deals on flights from {fromHub} to {name},
                            plus when to go and what to expect.
                        </p>
                        <div className="bg-white bg-opacity-95 rounded-lg p-4 inline-block border-2 border-yellow-400">
                            <p className="text-gray-900 font-semibold">
                                💰 Target Price: <span className="text-green-700 font-bold">${targetPrice.economy} roundtrip</span> in economy
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-2xl mb-2">🕐</div>
                        <div className="font-semibold text-gray-900">Flight Time</div>
                        <div className="text-gray-600">{flightTime}</div>
                        <div className="text-sm text-gray-500">{stops}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-2xl mb-2">🌡️</div>
                        <div className="font-semibold text-gray-900">Best Weather</div>
                        <div className="text-gray-600">{bestMonths.join(' & ')}</div>
                        <div className="text-sm text-gray-500">Perfect temps</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-2xl mb-2">🏛️</div>
                        <div className="font-semibold text-gray-900">Trip Length</div>
                        <div className="text-gray-600">{tripLength}</div>
                        <div className="text-sm text-gray-500">Most popular</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-2xl mb-2">✈️</div>
                        <div className="font-semibold text-gray-900">Airlines</div>
                        <div className="text-gray-600">{airlines.slice(0, 2).join(', ')}</div>
                        <div className="text-sm text-gray-500">{airlines.slice(2).join(', ')}</div>
                    </div>
                </div>

                {/* Best Time to Go */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Best Time to Visit {name}</h2>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="text-2xl mr-3">🌟</span>
                                {bestTimeToVisit.optimal.month}: The Sweet Spot (Shoulder Season)
                            </h3>
                            <p className="text-gray-700 text-lg mb-4">
                                {bestTimeToVisit.optimal.month} is widely considered the best month to visit {name}. {bestTimeToVisit.optimal.reason}.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Why {bestTimeToVisit.optimal.month} is Perfect:</h4>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Temperatures: {bestTimeToVisit.optimal.temperature}</li>
                                        {bestTimeToVisit.optimal.pros.map((pro, index) => (
                                            <li key={index}>• {pro}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">What to Expect:</h4>
                                    <ul className="space-y-2 text-gray-600">
                                        {bestTimeToVisit.optimal.cons.map((con, index) => (
                                            <li key={index}>• {con}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Other Times to Visit:</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                {bestTimeToVisit.alternatives.map((alt, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded ${alt.type === 'good' ? 'bg-blue-50' :
                                                alt.type === 'okay' ? 'bg-yellow-50' : 'bg-red-50'
                                            }`}
                                    >
                                        <strong className={
                                            alt.type === 'good' ? 'text-blue-900' :
                                                alt.type === 'okay' ? 'text-yellow-900' : 'text-red-900'
                                        }>
                                            {alt.period}
                                        </strong>
                                        <p className={`text-sm ${alt.type === 'good' ? 'text-blue-700' :
                                                alt.type === 'okay' ? 'text-yellow-700' : 'text-red-700'
                                            }`}>
                                            {alt.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Flight Prices */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">What's a Good Price?</h2>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {fromHub} → {name} Roundtrip Pricing Guide
                            </h3>
                            <p className="text-gray-700 mb-6">
                                Flight prices from {fromHub === 'DFW' ? 'Dallas' : fromHub} to {name} vary significantly by season and how far in advance you book.
                                Here's what to expect and what to target:
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="border border-green-200 bg-green-50 p-6 rounded-lg">
                                <h4 className="font-bold text-green-900 text-lg mb-2">Great Deal</h4>
                                <div className="text-2xl font-bold text-green-800 mb-2">{seasonalPricing.great}</div>
                                <p className="text-green-700 text-sm">
                                    Book immediately! These prices usually last hours, not days.
                                    Often {stops.toLowerCase()} with good airlines.
                                </p>
                            </div>
                            <div className="border border-blue-200 bg-blue-50 p-6 rounded-lg">
                                <h4 className="font-bold text-blue-900 text-lg mb-2">Good Price</h4>
                                <div className="text-2xl font-bold text-blue-800 mb-2">{seasonalPricing.good}</div>
                                <p className="text-blue-700 text-sm">
                                    Solid value for {bestMonths[0]} travel. Worth booking if your dates aren't flexible.
                                    Mix of flight options available.
                                </p>
                            </div>
                            <div className="border border-orange-200 bg-orange-50 p-6 rounded-lg">
                                <h4 className="font-bold text-orange-900 text-lg mb-2">Wait or Watch</h4>
                                <div className="text-2xl font-bold text-orange-800 mb-2">{seasonalPricing.avoid}</div>
                                <p className="text-orange-700 text-sm">
                                    Unless you need to book now, consider setting up a price watch
                                    and waiting for better deals.
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips for Better Prices:</h4>
                            <ul className="space-y-2 text-yellow-800">
                                {pricingTips.map((tip, index) => (
                                    <li key={index}>• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Highlights */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Must-Do in {name}</h2>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <ul className="space-y-3 text-gray-600">
                            {highlights.map((highlight, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-yellow-500 mr-3">🌟</span>
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Price Watch CTA */}
                <section className="text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">Get Notified When {name} Flights Drop</h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Set up a price watch and we'll email you the moment {fromHub}→{name} flights hit your target price.
                            No more daily checking – we'll send you direct booking links when deals appear.
                        </p>
                        <div className="space-x-4">
                            <Link
                                href={`/?from=${fromHub}&to=${airportCode}&watchPrice=${targetPrice.economy}`}
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                            >
                                Watch {name} Flights
                            </Link>
                            <Link
                                href="/about"
                                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                            >
                                How It Works
                            </Link>
                        </div>
                        <div className="mt-6 text-sm text-blue-200">
                            <p>💡 <strong>Tip:</strong> Set your target at ${targetPrice.economy} for economy{targetPrice.premiumEconomy ? ` or $${targetPrice.premiumEconomy} for premium economy` : ''}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
