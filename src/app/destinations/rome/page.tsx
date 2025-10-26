import Link from 'next/link';

export default function RomeDestination() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-600 to-orange-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Flying to Rome
                        </h1>
                        <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
                            Everything you need to know about finding great deals on flights from DFW to Rome,
                            plus when to go and what to expect.
                        </p>
                        <div className="bg-white bg-opacity-95 rounded-lg p-4 inline-block border-2 border-yellow-400">
                            <p className="text-gray-900 font-semibold">
                                💰 Target Price: <span className="text-green-700 font-bold">$900 roundtrip</span> in economy
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
                        <div className="text-gray-600">10-12 hours</div>
                        <div className="text-sm text-gray-500">1-2 stops typical</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-2xl mb-2">🌡️</div>
                        <div className="font-semibold text-gray-900">Best Weather</div>
                        <div className="text-gray-600">May & October</div>
                        <div className="text-sm text-gray-500">Perfect temps</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-2xl mb-2">🏛️</div>
                        <div className="font-semibold text-gray-900">Trip Length</div>
                        <div className="text-gray-600">6-9 nights</div>
                        <div className="text-sm text-gray-500">Most popular</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-2xl mb-2">✈️</div>
                        <div className="font-semibold text-gray-900">Airlines</div>
                        <div className="text-gray-600">American, Delta</div>
                        <div className="text-sm text-gray-500">United, Lufthansa</div>
                    </div>
                </div>

                {/* Best Time to Go */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Best Time to Visit Rome</h2>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="text-2xl mr-3">🌟</span>
                                May: The Sweet Spot (Shoulder Season)
                            </h3>
                            <p className="text-gray-700 text-lg mb-4">
                                May is widely considered the best month to visit Rome. You'll get perfect weather,
                                fewer crowds than summer, and better flight prices than peak season.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Why May is Perfect:</h4>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Temperatures: 65-75°F (18-24°C)</li>
                                        <li>• Lower humidity than summer</li>
                                        <li>• Fewer tourists than June-August</li>
                                        <li>• All attractions open with shorter lines</li>
                                        <li>• Perfect for walking the city</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">What to Expect:</h4>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Occasional light rain (bring a jacket)</li>
                                        <li>• Shoulder season hotel rates</li>
                                        <li>• Restaurants less crowded</li>
                                        <li>• Great photo lighting</li>
                                        <li>• Comfortable sightseeing weather</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Other Good Times to Visit:</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded">
                                    <strong className="text-blue-900">October</strong>
                                    <p className="text-blue-700 text-sm">Similar to May, great weather and fewer crowds</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded">
                                    <strong className="text-yellow-900">April & November</strong>
                                    <p className="text-yellow-700 text-sm">Good deals, mild weather, some rain</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded">
                                    <strong className="text-red-900">Avoid: July-August</strong>
                                    <p className="text-red-700 text-sm">Extremely hot, crowded, highest prices</p>
                                </div>
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
                                DFW → Rome Roundtrip Pricing Guide
                            </h3>
                            <p className="text-gray-700 mb-6">
                                Flight prices from Dallas to Rome vary significantly by season and how far in advance you book.
                                Here's what to expect and what to target:
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="border border-green-200 bg-green-50 p-6 rounded-lg">
                                <h4 className="font-bold text-green-900 text-lg mb-2">Great Deal</h4>
                                <div className="text-2xl font-bold text-green-800 mb-2">$750-900</div>
                                <p className="text-green-700 text-sm">
                                    Book immediately! These prices usually last hours, not days.
                                    Often 1-2 stops with good airlines.
                                </p>
                            </div>
                            <div className="border border-blue-200 bg-blue-50 p-6 rounded-lg">
                                <h4 className="font-bold text-blue-900 text-lg mb-2">Good Price</h4>
                                <div className="text-2xl font-bold text-blue-800 mb-2">$900-1200</div>
                                <p className="text-blue-700 text-sm">
                                    Solid value for May travel. Worth booking if your dates aren't flexible.
                                    Mix of 1-2 stops available.
                                </p>
                            </div>
                            <div className="border border-orange-200 bg-orange-50 p-6 rounded-lg">
                                <h4 className="font-bold text-orange-900 text-lg mb-2">Wait or Watch</h4>
                                <div className="text-2xl font-bold text-orange-800 mb-2">$1200+</div>
                                <p className="text-orange-700 text-sm">
                                    Unless you need to book now, consider setting up a price watch
                                    and waiting for better deals.
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips for Better Prices:</h4>
                            <ul className="space-y-2 text-yellow-800">
                                <li>• Be flexible with dates (even +/- 3 days helps significantly)</li>
                                <li>• Consider flying Tuesday-Thursday for lower prices</li>
                                <li>• Book 2-8 weeks in advance for shoulder season (May/October)</li>
                                <li>• 1-stop flights are often $200-400 cheaper than nonstop</li>
                                <li>• Clear your browser cookies before booking</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Trip Planning */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Planning Your Trip</h2>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    How Long Should You Stay?
                                </h3>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-green-500 pl-4">
                                        <strong className="text-gray-900">6-7 nights:</strong>
                                        <p className="text-gray-600 text-sm">Perfect for first-time visitors. See the major sights without rushing.</p>
                                    </div>
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <strong className="text-gray-900">8-9 nights:</strong>
                                        <p className="text-gray-600 text-sm">Sweet spot for many travelers. Time for Rome plus day trips to Vatican or Tivoli.</p>
                                    </div>
                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <strong className="text-gray-900">10+ nights:</strong>
                                        <p className="text-gray-600 text-sm">Add Florence, Naples, or explore Rome's neighborhoods deeply.</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Must-Do in Rome
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-yellow-500 mr-2">🏛️</span>
                                        Colosseum & Roman Forum (book skip-the-line tickets)
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-500 mr-2">🎨</span>
                                        Vatican Museums & Sistine Chapel (book ahead)
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-500 mr-2">⛲</span>
                                        Trevi Fountain (go early morning or late evening)
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-500 mr-2">🍝</span>
                                        Trastevere neighborhood for authentic food
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-500 mr-2">🌅</span>
                                        Sunrise at Spanish Steps or Pantheon
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Price Watch CTA */}
                <section className="text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">Get Notified When Rome Flights Drop</h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Set up a price watch and we'll email you the moment DFW→Rome flights hit your target price.
                            No more daily checking – we'll send you direct booking links when deals appear.
                        </p>
                        <div className="space-x-4">
                            <Link
                                href="/?from=DFW&to=FCO&watchPrice=900"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                            >
                                Watch Rome Flights
                            </Link>
                            <Link
                                href="/about"
                                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                            >
                                How It Works
                            </Link>
                        </div>
                        <div className="mt-6 text-sm text-blue-200">
                            <p>💡 <strong>Tip:</strong> Set your target at $900 for economy or $1200 for premium economy</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
