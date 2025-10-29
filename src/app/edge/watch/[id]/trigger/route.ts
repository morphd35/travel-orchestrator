import { NextRequest } from 'next/server';
import { getWatch, updateWatch } from '@/lib/watchStore';
import { searchFlights, type NormalFlight, AmadeusRateLimitError, AmadeusProviderError } from '@/lib/amadeusClient';
import { sendEmail } from '@/lib/notifier';
import { renderFareEmail, renderFareEmailText } from '@/lib/templates/notifyFareDrop';

// Flight search result with provider information
interface FlightSearchResult {
    flights: NormalFlight[];
    provider: string;
    sourceLink?: string;
}

// Search flights using the specified provider
async function searchFlightsByProvider(
    provider: "amadeus" | "skyscanner",
    searchParams: any,
    bestFlight?: NormalFlight
): Promise<FlightSearchResult> {
    switch (provider) {
        case 'amadeus':
            const flights = await searchFlights(searchParams);
            // Generate airline-specific booking link if we have flight data
            const sourceLink = bestFlight
                ? generateAirlineBookingLink(bestFlight, searchParams)
                : generateGoogleFlightsUrl(searchParams);

            return {
                flights,
                provider: 'amadeus',
                sourceLink
            };

        case 'skyscanner':
            // TODO: Implement Skyscanner API integration
            console.log('🚧 Skyscanner provider not yet implemented, falling back to Amadeus');
            const fallbackFlights = await searchFlights(searchParams);
            const fallbackSourceLink = bestFlight
                ? generateAirlineBookingLink(bestFlight, searchParams)
                : generateGoogleFlightsUrl(searchParams);

            return {
                flights: fallbackFlights,
                provider: 'amadeus', // Record actual provider used
                sourceLink: fallbackSourceLink
            };

        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

// Generate airline-specific booking link based on flight data
function generateAirlineBookingLink(flight: NormalFlight, searchParams: any): string {
    const carrierCode = flight.carrier?.toUpperCase();

    switch (carrierCode) {
        case 'NK': // Spirit Airlines
            return generateSpiritBookingUrl(searchParams);
        case 'F9': // Frontier Airlines
            return generateFrontierBookingUrl(searchParams);
        case 'AA': // American Airlines
            return generateAmericanBookingUrl(searchParams);
        case 'UA': // United Airlines
            return generateUnitedBookingUrl(searchParams);
        case 'DL': // Delta Airlines
            return generateDeltaBookingUrl(searchParams);
        case 'WN': // Southwest Airlines
            return generateSouthwestBookingUrl(searchParams);
        case 'B6': // JetBlue Airways
            return generateJetBlueBookingUrl(searchParams);
        case 'AS': // Alaska Airlines
            return generateAlaskaBookingUrl(searchParams);
        case 'TK': // Turkish Airlines
            return generateTurkishBookingUrl(searchParams);
        default:
            // Fallback to improved Google Flights URL
            return generateGoogleFlightsUrl(searchParams);
    }
}

// Spirit Airlines booking URL
function generateSpiritBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        OrigCity: params.origin,
        DestCity: params.destination,
        DeptDate: params.departDate,
        Adults: params.adults?.toString() || '1',
    });

    if (params.returnDate) {
        searchParams.set('RetDate', params.returnDate);
    }

    return `https://www.spirit.com/BookFlight?${searchParams.toString()}`;
}

// Frontier Airlines booking URL
function generateFrontierBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        departureCity: params.origin,
        arrivalCity: params.destination,
        departureDate: params.departDate,
        adults: params.adults?.toString() || '1',
    });

    if (params.returnDate) {
        searchParams.set('returnDate', params.returnDate);
    }

    return `https://www.flyfrontier.com/flight/select?${searchParams.toString()}`;
}

// American Airlines booking URL
function generateAmericanBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        from: params.origin,
        to: params.destination,
        departDate: params.departDate,
        passengers: params.adults?.toString() || '1',
        cabin: 'economy',
    });

    if (params.returnDate) {
        searchParams.set('returnDate', params.returnDate);
    }

    return `https://www.aa.com/booking/search?${searchParams.toString()}`;
}

// United Airlines booking URL
function generateUnitedBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        f: params.origin,
        t: params.destination,
        d: params.departDate,
        px: params.adults?.toString() || '1',
        cm: 'econ',
    });

    if (params.returnDate) {
        searchParams.set('r', params.returnDate);
    }

    return `https://www.united.com/en/us/fsr/choose-flights?${searchParams.toString()}`;
}

// Delta Airlines booking URL
function generateDeltaBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        originAirportCode: params.origin,
        destinationAirportCode: params.destination,
        departureDate: params.departDate,
        passengerCount: params.adults?.toString() || '1',
        serviceClass: 'COACH',
    });

    if (params.returnDate) {
        searchParams.set('returnDate', params.returnDate);
    }

    return `https://www.delta.com/shop/ow/search?${searchParams.toString()}`;
}

// Southwest Airlines booking URL
function generateSouthwestBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        originAirport: params.origin,
        destinationAirport: params.destination,
        departureDate: params.departDate,
        adultPassengersCount: params.adults?.toString() || '1',
    });

    if (params.returnDate) {
        searchParams.set('returnDate', params.returnDate);
    }

    return `https://www.southwest.com/air/booking/select.html?${searchParams.toString()}`;
}

// JetBlue Airways booking URL
function generateJetBlueBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        from: params.origin,
        to: params.destination,
        depart: params.departDate,
        passengers: params.adults?.toString() || '1',
    });

    if (params.returnDate) {
        searchParams.set('return', params.returnDate);
    }

    return `https://www.jetblue.com/booking/flights?${searchParams.toString()}`;
}

// Alaska Airlines booking URL
function generateAlaskaBookingUrl(params: any): string {
    const searchParams = new URLSearchParams({
        from: params.origin,
        to: params.destination,
        departureDate: params.departDate,
        numAdults: params.adults?.toString() || '1',
    });

    if (params.returnDate) {
        searchParams.set('returnDate', params.returnDate);
    }

    return `https://www.alaskaair.com/booking/reservation/search?${searchParams.toString()}`;
}

// Turkish Airlines booking URL - fallback to Google Flights with Turkish Airlines filter
function generateTurkishBookingUrl(params: any): string {
    // Turkish Airlines direct booking URLs are currently returning 404 errors
    // Use Google Flights with Turkish Airlines filter as a more reliable alternative
    const searchParams = new URLSearchParams({
        f: '0',
        gl: 'us',
        hl: 'en',
        curr: 'USD',
        // Build tfs parameter for specific flight search
        tfs: `f.${params.origin}.${params.destination}.${params.departDate}${params.returnDate ? `*f.${params.destination}.${params.origin}.${params.returnDate}` : ''}`,
        // Add Turkish Airlines filter
        airline: 'TK'
    });

    return `https://www.google.com/travel/flights?${searchParams.toString()}`;
}

// Improved Google Flights URL (fallback)
function generateGoogleFlightsUrl(params: any): string {
    const searchParams = new URLSearchParams();

    // Use the correct Google Flights format
    searchParams.set('hl', 'en');
    searchParams.set('gl', 'us');
    searchParams.set('curr', 'USD');

    // Build the tfs parameter correctly for round-trip or one-way
    let tfsValue = `f.${params.origin}.${params.destination}.${params.departDate}`;
    if (params.returnDate) {
        tfsValue += `*f.${params.destination}.${params.origin}.${params.returnDate}`;
    }
    searchParams.set('tfs', tfsValue);

    // Add passenger count if more than 1
    if (params.adults && params.adults > 1) {
        searchParams.set('px', params.adults.toString());
    }

    return `https://www.google.com/travel/flights?${searchParams.toString()}`;
}

// Map cabin types to Amadeus travel class if needed
function mapCabinToAmadeus(cabin: string): string {
    const mapping: Record<string, string> = {
        'ECONOMY': 'ECONOMY',
        'PREMIUM_ECONOMY': 'PREMIUM_ECONOMY',
        'BUSINESS': 'BUSINESS',
        'FIRST': 'FIRST'
    };
    return mapping[cabin] || 'ECONOMY';
}

// Get airline name from IATA code
function getAirlineName(iataCode: string): string {
    const airlines: Record<string, string> = {
        'AA': 'American Airlines',
        'UA': 'United Airlines',
        'DL': 'Delta Air Lines',
        'WN': 'Southwest Airlines',
        'B6': 'JetBlue Airways',
        'AS': 'Alaska Airlines',
        'F9': 'Frontier Airlines',
        'NK': 'Spirit Airlines',
        'TK': 'Turkish Airlines',
        'SY': 'Sun Country Airlines',
        'G4': 'Allegiant Air',
    };

    return airlines[iataCode?.toUpperCase()] || `${iataCode} Airlines`;
}

// Generate date combinations within the watch window based on trip type preference
function generateDateCombinations(start: string, end: string, flexDays: number, tripType: "oneway" | "roundtrip"): Array<{ depart: string, return?: string }> {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const combinations: Array<{ depart: string, return?: string }> = [];

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Helper to add days to a date
    const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    // Generate depart dates within the window
    const current = new Date(startDate);
    const departDates: Date[] = [];

    while (current <= endDate) {
        departDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    // Add flexibility around start and end if flexDays > 0
    if (flexDays > 0) {
        for (let i = 1; i <= flexDays; i++) {
            const beforeStart = addDays(startDate, -i);
            const afterEnd = addDays(endDate, i);

            if (beforeStart >= new Date()) { // Don't go into the past
                departDates.unshift(beforeStart);
            }
            departDates.push(afterEnd);
        }
    }

    // Generate combinations based on user's trip type preference
    let count = 0;
    const maxCombinations = tripType === "oneway" ? 15 : 10; // Allow more one-way searches since they're simpler

    for (const departDate of departDates) {
        if (count >= maxCombinations) break;

        if (tripType === "oneway") {
            // Only generate one-way combinations
            combinations.push({
                depart: formatDate(departDate)
            });
            count++;
        } else {
            // Only generate round-trip combinations
            // Try round-trip with 7-day stay
            const returnDate = addDays(departDate, 7);
            if (returnDate <= addDays(endDate, flexDays)) {
                combinations.push({
                    depart: formatDate(departDate),
                    return: formatDate(returnDate)
                });
                count++;
            }

            if (count >= maxCombinations) break;

            // If flexDays > 0, try +/- 2 days for return
            if (flexDays > 0) {
                for (const returnOffset of [5, 9]) { // 7-2 and 7+2 days
                    if (count >= maxCombinations) break;

                    const flexReturnDate = addDays(departDate, returnOffset);
                    if (flexReturnDate <= addDays(endDate, flexDays)) {
                        combinations.push({
                            depart: formatDate(departDate),
                            return: formatDate(flexReturnDate)
                        });
                        count++;
                    }
                }
            }
        }
    }

    return combinations.slice(0, maxCombinations);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {

        // Load watch by ID
        const watch = getWatch(id);
        if (!watch) {
            return Response.json(
                { error: 'Watch not found' },
                { status: 404 }
            );
        }

        // Check if watch is active
        if (!watch.active) {
            return Response.json(
                { error: 'Watch is not active' },
                { status: 400 }
            );
        }

        console.log(`🔍 Triggering price check for watch ${id}: ${watch.origin} → ${watch.destination}`);

        // Generate date combinations based on user's trip type preference
        const dateCombinations = generateDateCombinations(watch.start, watch.end, watch.flexDays, watch.tripType);
        console.log(`📅 Generated ${dateCombinations.length} ${watch.tripType} date combinations to check`);

        let bestFlight: NormalFlight | null = null;
        let bestDates: { depart: string, return?: string } | null = null;

        // Search flights for each date combination
        let hasRateLimitError = false;
        let hasProviderError = false;
        let usedProvider: string = watch.provider;
        let sourceLink: string | undefined;

        for (const dates of dateCombinations) {
            try {
                console.log(`🔎 Searching flights for ${dates.depart}` + (dates.return ? ` → ${dates.return}` : ' (one-way)') + ` using ${watch.provider} provider`);

                const searchParams = {
                    origin: watch.origin,
                    destination: watch.destination,
                    departDate: dates.depart,
                    returnDate: dates.return,
                    adults: watch.adults,
                    currency: watch.currency,
                    cabinClass: watch.cabin, // Include user's cabin class preference
                    max: 20 // Get more results to find best options
                };

                const searchResult = await searchFlightsByProvider(watch.provider, searchParams);
                const flights = searchResult.flights;

                // Update tracking variables
                usedProvider = searchResult.provider;
                sourceLink = searchResult.sourceLink;

                // Filter by maxStops
                const validFlights = flights.filter(flight => {
                    const outboundValid = flight.stopsOut <= watch.maxStops;
                    const returnValid = flight.stopsBack === undefined || flight.stopsBack <= watch.maxStops;
                    return outboundValid && returnValid;
                });

                console.log(`✈️ Found ${flights.length} flights, ${validFlights.length} within stop limit`);

                // Find the best (cheapest) flight from this search
                for (const flight of validFlights) {
                    if (!bestFlight || flight.total < bestFlight.total) {
                        bestFlight = flight;
                        bestDates = dates;
                    }
                }

            } catch (error) {
                if (error instanceof AmadeusRateLimitError) {
                    console.warn(`⚠️ Rate limit hit for ${dates.depart}:`, error.message);
                    hasRateLimitError = true;
                    break; // Stop searching if rate limited
                } else if (error instanceof AmadeusProviderError) {
                    console.warn(`⚠️ Provider error for ${dates.depart}:`, error.message);
                    hasProviderError = true;
                    // Continue with other dates in case it's transient
                } else {
                    console.warn(`⚠️ Failed to search flights for ${dates.depart}:`, error);
                    // Continue with other dates
                }
            }
        }

        // Handle rate limit or provider errors
        if (hasRateLimitError && !bestFlight) {
            console.log('❌ Rate limit exceeded, no flights found');
            return Response.json({
                action: 'NOOP',
                reason: 'rate_limited',
                watchId: id,
                searchedCombinations: dateCombinations.length
            });
        }

        if (hasProviderError && !bestFlight) {
            console.log('❌ Provider errors occurred, no flights found');
            return Response.json({
                action: 'NOOP',
                reason: 'provider_error',
                watchId: id,
                searchedCombinations: dateCombinations.length
            });
        }

        // Handle no results
        if (!bestFlight || !bestDates) {
            console.log('❌ No valid flights found');
            return Response.json({
                action: 'NOOP',
                reason: 'no_results',
                watchId: id,
                searchedCombinations: dateCombinations.length
            });
        }

        console.log(`💰 Best flight found: $${bestFlight.total} ${bestFlight.currency} (${bestFlight.carrier}) via ${usedProvider}`);

        // Generate airline-specific booking link for the best flight
        const bestFlightSearchParams = {
            origin: watch.origin,
            destination: watch.destination,
            departDate: bestDates.depart,
            returnDate: bestDates.return,
            adults: watch.adults,
            currency: watch.currency,
            cabinClass: watch.cabin
        };
        const airlineSpecificLink = generateAirlineBookingLink(bestFlight, bestFlightSearchParams);

        console.log(`🔗 Generated booking link for ${bestFlight.carrier}: ${airlineSpecificLink}`);

        // Update watch with best price and provider information
        const updatedWatch = updateWatch(id, {
            lastBestUsd: bestFlight.total,
            lastProvider: usedProvider,
            lastSourceLink: airlineSpecificLink, // Use airline-specific link
            updatedAt: new Date().toISOString()
        });

        if (!updatedWatch) {
            throw new Error('Failed to update watch');
        }

        // Decision logic for notifications
        let action: 'NOTIFY' | 'NOOP' = 'NOOP';
        let reason: string | undefined;

        if (bestFlight.total <= watch.targetUsd) {
            // Price is below target
            if (watch.lastNotifiedUsd === undefined) {
                // Never notified before
                action = 'NOTIFY';
                reason = 'first_time_below_target';
            } else if (bestFlight.total <= watch.lastNotifiedUsd - 25) {
                // Price dropped by at least $25 from last notification
                action = 'NOTIFY';
                reason = 'significant_price_drop';
            } else {
                reason = 'below_target_but_not_significant_drop';
            }
        } else {
            reason = 'above_target_price';
        }

        // Update lastNotifiedUsd and send email if we're notifying
        let emailResult: { messageId?: string; provider?: string } = {};

        if (action === 'NOTIFY') {
            updateWatch(id, {
                lastNotifiedUsd: bestFlight.total,
                updatedAt: new Date().toISOString()
            });
            console.log(`🔔 NOTIFY: Price $${bestFlight.total} triggers notification (reason: ${reason})`);

            // Send email notification
            try {
                // Use user's email if provided, otherwise fallback to NOTIFY_TO for admin watches
                const notifyTo = watch.email || process.env.NOTIFY_TO;
                if (notifyTo) {
                    // Build deeplink URL - use correct port 3000 for development
                    const baseUrl = process.env.VERCEL_URL
                        ? `https://${process.env.VERCEL_URL}`
                        : process.env.NODE_ENV === 'production'
                            ? 'https://www.travelconductor.com'
                            : 'http://localhost:3000';

                    // Build enhanced deeplink URL with complete flight details for booking page
                    const flightSegments = bestFlight.raw?.itineraries?.[0]?.segments || [];
                    const segmentDetails = flightSegments.map((seg: any) => {
                        const departure = seg.departure;
                        const arrival = seg.arrival;
                        return `${departure.iataCode} → ${arrival.iataCode} (${seg.carrierCode}${seg.number})`;
                    }).join('\n');

                    const deeplinkParams = new URLSearchParams({
                        o: watch.origin,
                        d: watch.destination,
                        ds: bestDates.depart,
                        p: bestFlight.total.toString(),
                        c: bestFlight.currency,
                        car: bestFlight.carrier,
                        so: bestFlight.stopsOut.toString(),
                    });

                    if (bestDates.return) {
                        deeplinkParams.set('rs', bestDates.return);
                    }
                    if (bestFlight.stopsBack !== undefined) {
                        deeplinkParams.set('sb', bestFlight.stopsBack.toString());
                    }
                    if (watch.targetUsd) {
                        deeplinkParams.set('tp', watch.targetUsd.toString());
                    }
                    if (segmentDetails) {
                        deeplinkParams.set('seg', encodeURIComponent(segmentDetails));
                    }

                    const deeplinkUrl = `${baseUrl}/?${deeplinkParams.toString()}`;

                    // Prepare email data with segment details from raw flight data
                    const segments = bestFlight.raw?.itineraries?.[0]?.segments || [];
                    const airlineName = getAirlineName(bestFlight.carrier);

                    const emailData = {
                        origin: watch.origin,
                        destination: watch.destination,
                        depart: bestDates.depart,
                        returnDate: bestDates.return,
                        total: bestFlight.total,
                        currency: bestFlight.currency,
                        carrier: bestFlight.carrier,
                        airlineName: airlineName,
                        stops: {
                            out: bestFlight.stopsOut,
                            back: bestFlight.stopsBack,
                        },
                        deeplinkUrl,
                        airlineBookingUrl: airlineSpecificLink, // Direct airline booking link
                        targetPrice: watch.targetUsd,
                        segments: segments, // Include segment details for detailed stop information
                        tripType: watch.tripType, // Include trip type for clarity
                    };

                    // Send email
                    const result = await sendEmail({
                        to: notifyTo,
                        subject: `Fare drop: ${watch.origin} → ${watch.destination} $${bestFlight.total}`,
                        html: renderFareEmail(emailData),
                        text: renderFareEmailText(emailData),
                    });

                    emailResult = { messageId: result.messageId, provider: result.provider };
                    console.log(`📧 Email sent: messageId=${result.messageId}, provider=${result.provider}`);

                } else {
                    console.log('📧 Email disabled: NOTIFY_TO environment variable not set');
                }
            } catch (emailError) {
                console.error('❌ Failed to send notification email:', emailError);
                // Don't fail the request if email fails
            }

        } else {
            console.log(`🔕 NOOP: Price $${bestFlight.total} does not trigger notification (reason: ${reason})`);
        }

        // Return response
        return Response.json({
            action,
            reason,
            best: {
                total: bestFlight.total,
                currency: bestFlight.currency,
                carrier: bestFlight.carrier,
                stopsOut: bestFlight.stopsOut,
                stopsBack: bestFlight.stopsBack,
                dates: bestDates
            },
            email: emailResult.messageId ? {
                sent: true,
                messageId: emailResult.messageId,
                provider: emailResult.provider
            } : {
                sent: false,
                reason: process.env.NOTIFY_TO ? 'email_provider_not_configured' : 'notify_to_not_set'
            },
            watchId: id,
            targetUsd: watch.targetUsd,
            lastNotifiedUsd: updatedWatch.lastNotifiedUsd,
            searchedCombinations: dateCombinations.length
        });

    } catch (error) {
        console.error('❌ Error triggering watch:', error);
        return Response.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
                watchId: id
            },
            { status: 500 }
        );
    }
}
