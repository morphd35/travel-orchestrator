/**
 * Amadeus Booking Client - Production Ready
 * Handles flight search, price confirmation, and booking creation
 */

import { getToken, AmadeusRateLimitError, AmadeusProviderError } from './amadeusClient';

// Environment variables
const AMADEUS_HOST = process.env.AMADEUS_HOST || 'https://test.api.amadeus.com';

export interface PassengerInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: 'MALE' | 'FEMALE';
    email: string;
    phone: {
        countryCode: string; // e.g., "1"
        number: string; // e.g., "1234567890"
    };
    // For international flights
    documents?: {
        type: 'PASSPORT' | 'IDENTITY_CARD';
        number: string;
        expiryDate: string; // YYYY-MM-DD
        issuanceCountry: string; // ISO country code
        nationality: string; // ISO country code
    }[];
}

export interface BookingRequest {
    selectedOffer: any; // Raw Amadeus flight offer from search
    passengers: PassengerInfo[];
    contactInfo: {
        email: string;
        phone: {
            countryCode: string;
            number: string;
        };
        address: {
            lines: string[];
            postalCode: string;
            cityName: string;
            countryCode: string;
        };
    };
    // Optional special requests
    specialRequests?: string[];
    seatPreferences?: {
        passengerIndex: number;
        seatPreference: 'WINDOW' | 'AISLE' | 'NO_PREFERENCE';
    }[];
}

export interface BookingConfirmation {
    bookingReference: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    totalPrice: {
        amount: number;
        currency: string;
    };
    passengers: {
        firstName: string;
        lastName: string;
        confirmationNumber?: string;
    }[];
    itinerary: {
        flights: {
            flightNumber: string;
            airline: string;
            departure: {
                airport: string;
                dateTime: string;
            };
            arrival: {
                airport: string;
                dateTime: string;
            };
        }[];
    };
    ticketingDeadline?: string;
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
    bookingDate: string;
}

export interface PriceConfirmation {
    originalPrice: {
        amount: number;
        currency: string;
    };
    currentPrice: {
        amount: number;
        currency: string;
    };
    priceChanged: boolean;
    percentageChange?: number;
    offerValid: boolean;
    validUntil?: string;
}

/**
 * Confirm current price for a flight offer with retry logic
 * Essential step before booking to ensure price hasn't changed
 */
export async function confirmFlightPrice(flightOffer: any): Promise<PriceConfirmation> {
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Price confirmation attempt ${attempt}/${maxRetries}`);
            return await confirmFlightPriceAttempt(flightOffer);
        } catch (error: any) {
            lastError = error;
            console.warn(`⚠️ Price confirmation attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delay = attempt * 2000;
                console.log(`⏰ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Single attempt to confirm flight price
 */
async function confirmFlightPriceAttempt(flightOffer: any): Promise<PriceConfirmation> {
    try {
        const token = await getToken();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // Increased to 25 seconds

        const response = await fetch(`${AMADEUS_HOST}/v1/shopping/flight-offers/pricing`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    type: 'flight-offers-pricing',
                    flightOffers: [flightOffer]
                }
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();

            if (response.status === 429) {
                throw new AmadeusRateLimitError(`Price confirmation rate limit: ${response.status}`);
            }

            if (response.status >= 500) {
                throw new AmadeusProviderError(`Price confirmation server error: ${response.status}`);
            }

            throw new Error(`Price confirmation failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const pricedOffer = data.data?.flightOffers?.[0];

        if (!pricedOffer) {
            throw new Error('No priced offer returned from API');
        }

        const originalAmount = parseFloat(flightOffer.price.total);
        const currentAmount = parseFloat(pricedOffer.price.total);
        const priceChanged = Math.abs(originalAmount - currentAmount) > 0.01;
        const percentageChange = priceChanged ? ((currentAmount - originalAmount) / originalAmount) * 100 : 0;

        console.log(`💰 Price confirmation: ${flightOffer.price.currency} ${originalAmount} → ${currentAmount} (${priceChanged ? 'CHANGED' : 'UNCHANGED'})`);

        return {
            originalPrice: {
                amount: originalAmount,
                currency: flightOffer.price.currency
            },
            currentPrice: {
                amount: currentAmount,
                currency: pricedOffer.price.currency
            },
            priceChanged,
            percentageChange: priceChanged ? percentageChange : undefined,
            offerValid: true,
            validUntil: pricedOffer.validatingAirlineCodes ? undefined : new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        };

    } catch (error: any) {
        console.error('❌ Price confirmation error:', error);

        if (error.name === 'AbortError') {
            throw new AmadeusProviderError('Price confirmation timeout');
        }

        throw error;
    }
}

/**
 * Create a flight booking
 * NOTE: This requires a paid Amadeus production account with booking capabilities
 */
export async function createFlightBooking(bookingRequest: BookingRequest): Promise<BookingConfirmation> {
    try {
        const token = await getToken();

        // First, confirm the price
        const priceConfirmation = await confirmFlightPrice(bookingRequest.selectedOffer);

        if (!priceConfirmation.offerValid) {
            throw new Error('Flight offer is no longer valid');
        }

        // Format passengers for Amadeus API
        const formattedPassengers = bookingRequest.passengers.map((passenger, index) => ({
            id: (index + 1).toString(),
            dateOfBirth: passenger.dateOfBirth,
            name: {
                firstName: passenger.firstName.toUpperCase(),
                lastName: passenger.lastName.toUpperCase()
            },
            gender: passenger.gender,
            contact: {
                emailAddress: passenger.email,
                phones: [{
                    deviceType: 'MOBILE',
                    countryCallingCode: passenger.phone.countryCode,
                    number: passenger.phone.number
                }]
            },
            documents: passenger.documents?.map(doc => ({
                documentType: doc.type,
                number: doc.number,
                expiryDate: doc.expiryDate,
                issuanceCountry: doc.issuanceCountry,
                nationality: doc.nationality,
                holder: true
            })) || []
        }));

        const bookingPayload = {
            data: {
                type: 'flight-order',
                flightOffers: [bookingRequest.selectedOffer],
                travelers: formattedPassengers,
                contacts: [{
                    addresseeName: {
                        firstName: bookingRequest.passengers[0].firstName.toUpperCase(),
                        lastName: bookingRequest.passengers[0].lastName.toUpperCase()
                    },
                    companyName: 'Travel Conductor',
                    purpose: 'STANDARD',
                    address: {
                        lines: bookingRequest.contactInfo.address.lines,
                        postalCode: bookingRequest.contactInfo.address.postalCode,
                        cityName: bookingRequest.contactInfo.address.cityName,
                        countryCode: bookingRequest.contactInfo.address.countryCode
                    },
                    phones: [{
                        deviceType: 'MOBILE',
                        countryCallingCode: bookingRequest.contactInfo.phone.countryCode,
                        number: bookingRequest.contactInfo.phone.number
                    }],
                    emailAddress: bookingRequest.contactInfo.email
                }]
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds for booking

        const response = await fetch(`${AMADEUS_HOST}/v1/booking/flight-orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(bookingPayload),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Booking API Error:', errorText);

            if (response.status === 429) {
                throw new AmadeusRateLimitError(`Booking rate limit: ${response.status}`);
            }

            if (response.status >= 500) {
                throw new AmadeusProviderError(`Booking server error: ${response.status}`);
            }

            // Handle specific booking errors
            if (response.status === 400) {
                throw new Error(`Booking validation error: ${errorText.slice(0, 500)}`);
            }

            throw new Error(`Booking failed: ${response.status} ${response.statusText}`);
        }

        const bookingData = await response.json();
        console.log('✅ Booking created successfully:', bookingData.data?.id);

        // Transform to our format
        const booking = bookingData.data;
        const itinerary = booking.flightOffers[0]?.itineraries || [];

        const confirmation: BookingConfirmation = {
            bookingReference: booking.id,
            status: booking.flightOffers[0]?.type === 'flight-offer' ? 'CONFIRMED' : 'PENDING',
            totalPrice: {
                amount: parseFloat(booking.flightOffers[0]?.price?.total || '0'),
                currency: booking.flightOffers[0]?.price?.currency || 'USD'
            },
            passengers: booking.travelers?.map((traveler: any) => ({
                firstName: traveler.name?.firstName || '',
                lastName: traveler.name?.lastName || '',
                confirmationNumber: booking.id
            })) || [],
            itinerary: {
                flights: itinerary.flatMap((itin: any) =>
                    itin.segments?.map((segment: any) => ({
                        flightNumber: `${segment.carrierCode}${segment.number}`,
                        airline: segment.carrierCode,
                        departure: {
                            airport: segment.departure?.iataCode || '',
                            dateTime: segment.departure?.at || ''
                        },
                        arrival: {
                            airport: segment.arrival?.iataCode || '',
                            dateTime: segment.arrival?.at || ''
                        }
                    })) || []
                )
            },
            paymentStatus: 'PENDING', // Would need payment integration
            bookingDate: new Date().toISOString()
        };

        return confirmation;

    } catch (error: any) {
        console.error('❌ Booking creation error:', error);

        if (error.name === 'AbortError') {
            throw new AmadeusProviderError('Booking creation timeout');
        }

        throw error;
    }
}

/**
 * Get seat map for a flight (if available)
 */
export async function getFlightSeatMap(flightOffer: any): Promise<any> {
    try {
        const token = await getToken();

        const firstSegment = flightOffer.itineraries?.[0]?.segments?.[0];
        if (!firstSegment) {
            throw new Error('No flight segments found');
        }

        const params = new URLSearchParams({
            'flight-orderId': flightOffer.id || 'dummy',
            'flight-number': `${firstSegment.carrierCode}${firstSegment.number}`,
            'carrierCode': firstSegment.carrierCode,
            'departure': firstSegment.departure.iataCode,
            'arrival': firstSegment.arrival.iataCode,
            'departureDate': firstSegment.departure.at.split('T')[0]
        });

        const response = await fetch(`${AMADEUS_HOST}/v1/shopping/seatmaps?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        });

        if (response.ok) {
            const seatData = await response.json();
            console.log('✅ Seat map retrieved');
            return seatData;
        } else {
            console.log('⚠️ Seat map not available for this flight');
            return null;
        }

    } catch (error) {
        console.log('⚠️ Could not retrieve seat map:', error);
        return null;
    }
}

/**
 * Check if booking capabilities are available (test vs production)
 */
export function isBookingEnabled(): boolean {
    // In test mode, booking API returns mock responses
    // In production, requires paid account and additional setup
    return AMADEUS_HOST.includes('test.api.amadeus.com') || process.env.AMADEUS_BOOKING_ENABLED === 'true';
}

/**
 * Get booking status and limitations
 */
export function getBookingCapabilities() {
    const isTest = AMADEUS_HOST.includes('test.api.amadeus.com');

    return {
        priceConfirmation: true,
        seatMaps: true,
        bookingCreation: isTest ? 'TEST_MODE' : 'PRODUCTION_REQUIRED',
        paymentRequired: !isTest,
        testMode: isTest,
        limitations: isTest
            ? ['Test bookings only', 'No real tickets issued', 'Mock payment processing']
            : ['Requires production Amadeus account', 'Real payment processing required', 'Live ticket issuance']
    };
}
