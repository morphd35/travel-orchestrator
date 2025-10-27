import Link from 'next/link';

export default function PrivacyPage() {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-6">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                        <p className="text-gray-600 mb-4">
                            Travel Conductor is currently in private beta. We collect minimal information necessary to:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Process access requests and communicate with potential partners</li>
                            <li>Provide travel search and booking services</li>
                            <li>Improve our platform and user experience</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Usage</h2>
                        <p className="text-gray-600 mb-4">
                            During our beta phase, we use collected information solely for:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Platform development and testing</li>
                            <li>Partner evaluation and onboarding</li>
                            <li>Service improvement and optimization</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Protection</h2>
                        <p className="text-gray-600">
                            We implement appropriate security measures to protect your personal information.
                            Access to user data is strictly limited to authorized personnel involved in platform development and partner relations.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
                        <p className="text-gray-600">
                            For privacy-related questions or concerns, please contact us through our access request form with "Privacy Inquiry" in your message.
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
