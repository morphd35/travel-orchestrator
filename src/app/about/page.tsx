import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Never Miss a Flight Deal Again
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Travel Conductor automatically monitors flight prices and alerts you the moment
                            your dream trip becomes affordable. No more checking prices every day.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* How It Works */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Set Your Target</h3>
                            <p className="text-gray-600">
                                Tell us where you want to go and what you want to pay. We'll watch that route 24/7
                                so you don't have to.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">We Monitor Prices</h3>
                            <p className="text-gray-600">
                                Our system checks flight prices multiple times per day across major airlines
                                and booking sites, tracking every price change.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📧</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Instant Alerts</h3>
                            <p className="text-gray-600">
                                When prices drop to your target, we send you an email with direct booking links.
                                No apps to check, no daily searches.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Who This Is For */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Who This Is For</h2>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Perfect For Travelers Who:</h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Plan trips to popular destinations like Rome, Cancun, or Cabo
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Fly from major hubs like DFW, LAX, or JFK
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Have flexible travel dates (within a week or two)
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Want to save hundreds on flights without the daily hassle
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Prefer email alerts over constantly checking flight apps
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Routes We Monitor:</h3>
                                <div className="space-y-2 text-gray-600">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <strong>DFW → Rome:</strong> Track deals from $800-1200
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <strong>LAX → Cancun:</strong> Watch for sub-$400 flights
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <strong>JFK → London:</strong> Alert on $500-700 roundtrip deals
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <strong>MIA → Barcelona:</strong> Monitor $600-900 price range
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why We Exist */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why We Exist</h2>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-8">
                        <div className="max-w-3xl mx-auto text-center">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                                Flight Prices Change Every Single Day
                            </h3>
                            <p className="text-lg text-gray-700 mb-6">
                                Airlines adjust prices constantly based on demand, seasonality, fuel costs, and booking patterns.
                                A flight that costs $1,200 today might be $850 next Tuesday, or $1,400 next Friday.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6 text-left">
                                <div className="bg-white p-6 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3">The Problem</h4>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Checking prices daily is exhausting</li>
                                        <li>• You miss deals when you're busy</li>
                                        <li>• Best prices often last just hours</li>
                                        <li>• Multiple booking sites to monitor</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-6 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3">Our Solution</h4>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Set it once, we watch forever</li>
                                        <li>• Never miss a deal while working</li>
                                        <li>• Instant alerts to your email</li>
                                        <li>• One service, all major airlines</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="text-gray-700 italic">
                                    "Normal people shouldn't have to become flight price experts just to take a vacation."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center">
                    <div className="bg-blue-600 rounded-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">Ready to Stop Missing Deals?</h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Join thousands of travelers who let us handle the price watching while they focus on planning their trips.
                        </p>
                        <div className="space-x-4">
                            <Link
                                href="/"
                                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                            >
                                Start Watching Prices
                            </Link>
                            <Link
                                href="/destinations/rome"
                                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                            >
                                See Rome Travel Guide
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
