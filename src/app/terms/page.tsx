import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">✈️</span>
                            </div>
                            <span className="text-xl font-semibold text-gray-900">Travel Conductor</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-6">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Beta Program Terms</h2>
                        <p className="text-gray-600 mb-4">
                            Travel Conductor is currently in private beta testing. By requesting and receiving access, you agree to:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Use the platform for evaluation and testing purposes only</li>
                            <li>Provide feedback to help improve the service</li>
                            <li>Maintain confidentiality of beta features and capabilities</li>
                            <li>Accept that the service may be modified or discontinued at any time</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Partner Relationships</h2>
                        <p className="text-gray-600 mb-4">
                            Travel Conductor works with various travel industry partners including:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Airlines and travel providers</li>
                            <li>Booking platforms and aggregators</li>
                            <li>Affiliate networks and marketing partners</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
                        <p className="text-gray-600">
                            All technology, designs, and content related to Travel Conductor remain the property of the platform owners.
                            Beta users are granted limited access for evaluation purposes only.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                        <p className="text-gray-600">
                            During the beta phase, Travel Conductor is provided "as is" without warranties.
                            Users participate in testing at their own discretion and assume any associated risks.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
                        <p className="text-gray-600">
                            For questions about these terms, please contact us through our access request form with "Terms Inquiry" in your message.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                    <Link href="/" className="text-emerald-600 hover:text-emerald-700">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
