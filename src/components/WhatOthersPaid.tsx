'use client';

import { useState, useEffect } from 'react';

interface PurchaseData {
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

interface WhatOthersPaidProps {
    origin: string;
    destination: string;
    cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export default function WhatOthersPaid({ origin, destination, cabin = 'economy' }: WhatOthersPaidProps) {
    const [data, setData] = useState<PurchaseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPurchaseData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/analytics/purchases?origin=${origin}&destination=${destination}&cabin=${cabin}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch purchase data');
                }

                const purchaseData = await response.json();
                setData(purchaseData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchPurchaseData();
    }, [origin, destination, cabin]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Purchase Data Coming Soon
                    </h3>
                    <p className="text-gray-600">
                        We're working on gathering real traveler purchase data for the {origin} → {destination} route.
                        Check back soon for insights on what others have paid!
                    </p>
                </div>
            </div>
        );
    }

    const {
        sampleCount,
        avgPrice,
        medianPrice,
        minPrice,
        maxPrice,
        p25Price,
        p75Price,
        mostCommonAirline,
        directFlightPercentage,
        avgDaysAdvance,
        priceDistribution
    } = data;

    // Create price distribution chart (simple ASCII-style for now)
    const maxCount = Math.max(...priceDistribution.map(bucket => bucket.count));

    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What Others Paid</h2>
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Recent {cabin.replace('_', ' ')} Purchases: {origin} → {destination}
                        </h3>
                        <div className="text-sm text-gray-500">
                            Based on {sampleCount.toLocaleString()} actual bookings
                        </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Real traveler data from the last 90 days, similar to what you'd see on Cars.com
                        for actual vehicle purchases.
                    </p>
                </div>

                {/* Price Statistics */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800">
                            ${Math.round(medianPrice).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">Median Price</div>
                        <div className="text-xs text-blue-500 mt-1">Most common</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-800">
                            ${Math.round(avgPrice).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Average Price</div>
                        <div className="text-xs text-green-500 mt-1">Mean value</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-800">
                            ${Math.round(minPrice).toLocaleString()} - ${Math.round(maxPrice).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Price Range</div>
                        <div className="text-xs text-gray-500 mt-1">Min to max</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-800">
                            ${Math.round(p25Price).toLocaleString()} - ${Math.round(p75Price).toLocaleString()}
                        </div>
                        <div className="text-sm text-purple-600">Middle 50%</div>
                        <div className="text-xs text-purple-500 mt-1">25th-75th percentile</div>
                    </div>
                </div>

                {/* Price Distribution Chart */}
                <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Price Distribution</h4>
                    <div className="space-y-3">
                        {priceDistribution.map((bucket, index) => (
                            <div key={index} className="flex items-center">
                                <div className="w-24 text-sm text-gray-600 flex-shrink-0">
                                    ${bucket.bucketMin}-{bucket.bucketMax}
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-gray-200 rounded-full h-6 relative">
                                        <div
                                            className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                                            style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                                        >
                                            <span className="text-xs text-white font-medium">
                                                {bucket.count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-16 text-sm text-gray-600 text-right">
                                    {bucket.percentage.toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Insights */}
                <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Booking Patterns</h4>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-lg font-bold text-yellow-800">
                                {Math.round(avgDaysAdvance)} days
                            </div>
                            <div className="text-sm text-yellow-600">Average advance booking</div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <div className="text-lg font-bold text-indigo-800">
                                {mostCommonAirline}
                            </div>
                            <div className="text-sm text-indigo-600">Most popular airline</div>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <div className="text-lg font-bold text-emerald-800">
                                {directFlightPercentage.toFixed(0)}%
                            </div>
                            <div className="text-sm text-emerald-600">Choose direct flights</div>
                        </div>
                    </div>
                </div>

                {/* Data source note */}
                <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                    💡 Data sources: Airline direct bookings, travel agencies, and industry reports.
                    Updated weekly. Anonymous and aggregated for privacy.
                </div>
            </div>
        </section>
    );
}
