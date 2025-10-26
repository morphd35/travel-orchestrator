import { NextRequest } from 'next/server';
import { z } from 'zod';
import { confirmFlightPrice, createFlightBooking, getBookingCapabilities, isBookingEnabled } from '@/lib/amadeusBooking';
import { searchFlights } from '@/lib/amadeusClient';
import { userProfileManager } from '@/lib/databaseUserProfileManager';

// Validation schemas
const PassengerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
    gender: z.enum(['MALE', 'FEMALE']),
    email: z.string().email('Valid email is required'),
    phone: z.object({
        countryCode: z.string().min(1, 'Country code is required'),
        number: z.string().min(10, 'Phone number is required')
    }),
    documents: z.array(z.object({
        type: z.enum(['PASSPORT', 'IDENTITY_CARD']),
        number: z.string().min(1, 'Document number is required'),
        expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be YYYY-MM-DD'),
        issuanceCountry: z.string().length(2, 'Country code must be 2 characters'),
        nationality: z.string().length(2, 'Nationality must be 2 characters')
    })).optional()
});

const BookingRequestSchema = z.object({
    // User ID for profile management
    userId: z.string().min(1, 'User ID is required'),
    // Flight search parameters to re-find the offer
    searchParams: z.object({
        origin: z.string().min(3, 'Origin is required'),
        destination: z.string().min(3, 'Destination is required'),
        departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Depart date must be YYYY-MM-DD'),
        returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Return date must be YYYY-MM-DD').optional(),
        adults: z.number().int().min(1).max(9).default(1),
        currency: z.string().default('USD')
    }),
    // Original offer details for verification
    originalOffer: z.object({
        total: z.number().positive(),
        currency: z.string(),
        carrier: z.string()
    }),
    // Passenger information
    passengers: z.array(PassengerSchema).min(1, 'At least one passenger is required'),
    // Contact information
    contactInfo: z.object({
        email: z.string().email('Valid email is required'),
        phone: z.object({
            countryCode: z.string().min(1, 'Country code is required'),
            number: z.string().min(10, 'Phone number is required')
        }),
        address: z.object({
            lines: z.array(z.string()).min(1, 'Street address is required'),
            postalCode: z.string().min(1, 'Postal code is required'),
            cityName: z.string().min(1, 'City is required'),
            countryCode: z.string().min(2, 'Country code is required')
        })
    }),
    // Optional requests
    specialRequests: z.array(z.string()).optional(),
    seatPreferences: z.array(z.object({
        passengerIndex: z.number().int().min(0),
        seatPreference: z.enum(['WINDOW', 'AISLE', 'NO_PREFERENCE'])
    })).optional()
});

const PriceCheckSchema = z.object({
    searchParams: z.object({
        origin: z.string().min(3),
        destination: z.string().min(3),
        departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        adults: z.number().int().min(1).max(9).default(1),
        currency: z.string().default('USD')
    }),
    originalOffer: z.object({
        total: z.number().positive(),
        currency: z.string(),
        carrier: z.string()
    })
});

/**
 * POST /api/booking/flight - Create a flight booking
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = BookingRequestSchema.parse(body);

        // Check if booking is enabled
        if (!isBookingEnabled()) {
            return Response.json({
                error: 'Booking not available',
                message: 'Flight booking requires a production Amadeus account. Currently in search-only mode.',
                capabilities: getBookingCapabilities()
            }, { status: 503 });
        }

        console.log(`🎫 Starting booking process for ${validatedData.searchParams.origin} → ${validatedData.searchParams.destination}`);

        // Step 1: We should use the stored complete flight offer instead of re-searching
        // TODO: Implement proper flight offer storage/retrieval
        // For now, let's re-search and find the best match
        const currentOffers = await searchFlights({
            origin: validatedData.searchParams.origin,
            destination: validatedData.searchParams.destination,
            departDate: validatedData.searchParams.departDate,
            returnDate: validatedData.searchParams.returnDate,
            adults: validatedData.searchParams.adults,
            currency: validatedData.searchParams.currency,
            max: 20 // Increased to find more options
        });

        if (currentOffers.length === 0) {
            return Response.json({
                error: 'No flights available',
                message: 'The requested flight is no longer available. Please search for alternative flights.'
            }, { status: 404 });
        }

        console.log(`🔍 Looking for: ${validatedData.originalOffer.carrier} flight at $${validatedData.originalOffer.total}`);
        console.log(`📊 Available carriers: ${currentOffers.map(o => o.carrier).join(', ')}`);
        console.log(`💰 Available prices: ${currentOffers.map(o => `${o.carrier}:$${o.total}`).join(', ')}`);

        // Step 2: Find matching offer with more flexible matching
        let matchingOffer = currentOffers.find(offer => 
            offer.carrier === validatedData.originalOffer.carrier &&
            Math.abs(offer.total - validatedData.originalOffer.total) <= (validatedData.originalOffer.total * 0.15) // Within 15%
        );

        // If exact carrier match not found, try broader price matching
        if (!matchingOffer) {
            matchingOffer = currentOffers.find(offer => 
                Math.abs(offer.total - validatedData.originalOffer.total) <= (validatedData.originalOffer.total * 0.1) // Within 10% regardless of carrier
            );
        }

        // If still no match, get the closest one by price
        if (!matchingOffer) {
            matchingOffer = currentOffers.reduce((closest, current) => 
                Math.abs(current.total - validatedData.originalOffer.total) < 
                Math.abs(closest.total - validatedData.originalOffer.total) ? current : closest
            );

            console.log(`⚠️ No exact match found. Using closest: ${matchingOffer.carrier} at $${matchingOffer.total} (original: ${validatedData.originalOffer.carrier} at $${validatedData.originalOffer.total})`);
        } else {
            console.log(`✅ Found matching offer: ${matchingOffer.carrier} at $${matchingOffer.total}`);
        }

        // Step 3: Confirm current price
        const priceConfirmation = await confirmFlightPrice(matchingOffer.raw);
        
        if (priceConfirmation.priceChanged) {
            return Response.json({
                error: 'Price changed during booking',
                message: 'The flight price changed while processing your booking.',
                priceConfirmation,
                requiresReconfirmation: true
            }, { status: 409 });
        }

        // Step 4: Create the booking
        const bookingRequest = {
            selectedOffer: matchingOffer.raw,
            passengers: validatedData.passengers,
            contactInfo: validatedData.contactInfo,
            specialRequests: validatedData.specialRequests,
            seatPreferences: validatedData.seatPreferences
        };

        const bookingConfirmation = await createFlightBooking(bookingRequest);

        console.log(`✅ Booking created successfully: ${bookingConfirmation.bookingReference}`);

        // Save booking to user profile
        try {
            const bookingForProfile = {
                id: `booking_${Date.now()}`,
                bookingReference: bookingConfirmation.bookingReference || 'N/A',
                origin: validatedData.searchParams.origin,
                destination: validatedData.searchParams.destination,
                departDate: validatedData.searchParams.departDate,
                returnDate: validatedData.searchParams.returnDate,
                passengers: validatedData.passengers.map(p => ({
                    firstName: p.firstName,
                    lastName: p.lastName,
                    dateOfBirth: p.dateOfBirth,
                    gender: p.gender === 'MALE' ? 'M' as const : p.gender === 'FEMALE' ? 'F' as const : 'Other' as const,
                    email: p.email,
                    phone: `${p.phone.countryCode}${p.phone.number}`,
                    address: {
                        lines: validatedData.contactInfo.address.lines,
                        city: validatedData.contactInfo.address.cityName,
                        postal: validatedData.contactInfo.address.postalCode,
                        country: validatedData.contactInfo.address.countryCode
                    }
                })),
                totalAmount: matchingOffer.total,
                currency: matchingOffer.currency,
                bookedAt: new Date().toISOString()
            };
            
            userProfileManager.addBookingToHistory(validatedData.userId, bookingForProfile);
            console.log(`💾 Booking saved to user profile: ${validatedData.userId}`);
        } catch (profileError) {
            console.error('⚠️ Failed to save booking to user profile:', profileError);
            // Don't fail the booking if profile save fails
        }

        return Response.json({
            success: true,
            booking: bookingConfirmation,
            priceConfirmation,
            message: 'Your flight has been successfully booked!'
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({
                error: 'Validation failed',
                details: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            }, { status: 400 });
        }

        console.error('❌ Booking error:', error);
        
        return Response.json({
            error: 'Booking failed',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            supportInfo: 'Please contact support if this problem persists.'
        }, { status: 500 });
    }
}

/**
 * GET /api/booking/flight - Check booking capabilities and pricing
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'capabilities') {
            return Response.json({
                capabilities: getBookingCapabilities(),
                enabled: isBookingEnabled()
            });
        }

        if (action === 'price-check') {
            // Parse price check parameters
            const priceCheckData = {
                searchParams: {
                    origin: searchParams.get('origin') || '',
                    destination: searchParams.get('destination') || '',
                    departDate: searchParams.get('departDate') || '',
                    returnDate: searchParams.get('returnDate') || undefined,
                    adults: parseInt(searchParams.get('adults') || '1'),
                    currency: searchParams.get('currency') || 'USD'
                },
                originalOffer: {
                    total: parseFloat(searchParams.get('total') || '0'),
                    currency: searchParams.get('currency') || 'USD',
                    carrier: searchParams.get('carrier') || ''
                }
            };

            const validatedData = PriceCheckSchema.parse(priceCheckData);

            // Re-search to get current prices
            const currentOffers = await searchFlights(validatedData.searchParams);
            
            if (currentOffers.length === 0) {
                return Response.json({
                    available: false,
                    message: 'Flight no longer available'
                });
            }

            const matchingOffer = currentOffers.find(offer => 
                offer.carrier === validatedData.originalOffer.carrier
            ) || currentOffers[0];

            try {
                const priceConfirmation = await confirmFlightPrice(matchingOffer.raw);

                return Response.json({
                    available: true,
                    priceConfirmation,
                    currentOffer: {
                        total: matchingOffer.total,
                        currency: matchingOffer.currency,
                        carrier: matchingOffer.carrier,
                        stopsOut: matchingOffer.stopsOut,
                        stopsBack: matchingOffer.stopsBack
                    }
                });
            } catch (priceError: any) {
                console.error('💥 Price confirmation failed:', priceError.message);
                
                // Return flight as unavailable if price confirmation fails
                return Response.json({
                    available: false,
                    message: 'Unable to confirm current flight prices',
                    error: priceError.message
                });
            }
        }

        return Response.json({
            error: 'Invalid action',
            availableActions: ['capabilities', 'price-check']
        }, { status: 400 });

    } catch (error) {
        console.error('❌ Booking GET error:', error);
        return Response.json({
            error: 'Request failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
