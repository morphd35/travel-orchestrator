/**
 * Flight Offer Expiration Warning Component
 * Shows users when flight offers are about to expire
 */

'use client';

import { useEffect, useState } from 'react';

interface FlightExpirationWarningProps {
    searchTime: number; // When the flight search was performed
    onRefreshNeeded: () => void;
}

export default function FlightExpirationWarning({ searchTime, onRefreshNeeded }: FlightExpirationWarningProps) {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    // Flight offers typically expire after 5-10 minutes
    const EXPIRATION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes
    const EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - searchTime;
            setTimeElapsed(elapsed);

            if (elapsed > EXPIRATION_WARNING_TIME) {
                setShowWarning(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [searchTime]);

    if (!showWarning) {
        return null;
    }

    const minutesElapsed = Math.floor(timeElapsed / 60000);
    const isExpired = timeElapsed > EXPIRATION_TIME;

    return (
        <div className={`border-l-4 p-4 mb-4 ${isExpired
                ? 'bg-red-50 border-red-400'
                : 'bg-yellow-50 border-yellow-400'
            }`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <span className={`text-xl ${isExpired ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                        {isExpired ? '🚫' : '⏰'}
                    </span>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${isExpired ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                        {isExpired ? 'Flight Offers Expired' : 'Flight Offers Expiring Soon'}
                    </h3>
                    <p className={`text-sm mt-1 ${isExpired ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                        {isExpired
                            ? `These flight offers expired ${minutesElapsed - 10} minutes ago. Booking may fail.`
                            : `These flight offers were found ${minutesElapsed} minutes ago and may expire soon.`
                        }
                    </p>
                    <div className="mt-2">
                        <button
                            onClick={onRefreshNeeded}
                            className={`text-sm px-3 py-1 rounded-md font-medium transition-colors ${isExpired
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                }`}
                        >
                            🔍 Search Fresh Flights
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
