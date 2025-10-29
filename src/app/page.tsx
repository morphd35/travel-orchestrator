'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, message }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        setCompany('');
        setMessage('');
      } else {
        setSubmitStatus('error');
        console.error('Access request failed:', result.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Access request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
      <main>
        {/* Hero Section */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent pb-2">
                  Travel Intelligence
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Advanced flight search, intelligent price monitoring, and curated travel experiences.
                Currently in private beta while we partner with leading travel providers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#access"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all"
                >
                  Request Access
                </a>
                <a
                  href="#about"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Revolutionizing Travel Search
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Travel Conductor combines cutting-edge technology with travel expertise to deliver
                unparalleled search capabilities and pricing intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Built for the Modern Traveler</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Real-time Price Monitoring</h4>
                      <p className="text-gray-600">Advanced algorithms track price changes across multiple providers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Integrated Booking</h4>
                      <p className="text-gray-600">Seamless integration with flights, hotels, and activities</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Partner Network</h4>
                      <p className="text-gray-600">Direct partnerships with airlines and travel providers</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Currently in Development</h4>
                  <p className="text-gray-600">
                    We're working with select partners to build the most comprehensive travel platform.
                    Request access to be part of our exclusive beta program.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Partner Integration Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Designed for seamless integration with travel industry partners and affiliates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Search API</h3>
                <p className="text-gray-600">RESTful API for flight search with flexible filtering and sorting options.</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Alerts</h3>
                <p className="text-gray-600">Intelligent monitoring system with customizable alerts and thresholds.</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Affiliate Integration</h3>
                <p className="text-gray-600">Built-in affiliate tracking and commission management for partners including Awin and other leading affiliate networks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Access Request Section */}
        <section id="access" className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Request Access
              </h2>
              <p className="text-lg text-gray-600">
                We're currently working with select partners. Submit your information to request access to our platform.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-green-500 mr-2">✓</div>
                    <div>
                      <h3 className="text-green-800 font-medium">Request Submitted Successfully!</h3>
                      <p className="text-green-700 text-sm">We'll review your request and get back to you within 24 hours.</p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-red-500 mr-2">⚠</div>
                    <div>
                      <h3 className="text-red-800 font-medium">Submission Failed</h3>
                      <p className="text-red-700 text-sm">Please check your information and try again.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAccessRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="your@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us about your organization and use case
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describe your company, role, and how you'd like to use Travel Conductor..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email || !name}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Access'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✈️</span>
              </div>
              <span className="text-xl font-semibold">Travel Conductor</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Travel Conductor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
