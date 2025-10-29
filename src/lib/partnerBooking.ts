import { UnifiedFlightResult } from './unifiedFlightClient';

export interface PartnerBookingData {
    flight: UnifiedFlightResult;
    passengers: PassengerInfo[];
    contactInfo: ContactInfo;
    partnerRedirectUrl: string;
    bookingReferenceId: string;
}

export interface PassengerInfo {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: 'M' | 'F';
    passportNumber?: string;
    passportExpiry?: string;
    nationality?: string;
}

export interface ContactInfo {
    email: string;
    phone: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
}

/**
 * Generate airline-specific booking URLs with pre-filled flight data
 */
export class PartnerBookingService {

    /**
     * Route user to appropriate airline partner for booking
     */
    static async routeToPartner(bookingData: PartnerBookingData): Promise<string> {
        const { flight } = bookingData;
        const carrierCode = flight.carrier;

        switch (carrierCode?.toUpperCase()) {
            case 'AA':
                return this.generateAmericanAirlinesUrl(bookingData);
            case 'UA':
                return this.generateUnitedAirlinesUrl(bookingData);
            case 'DL':
                return this.generateDeltaAirlinesUrl(bookingData);
            case 'WN':
                return this.generateSouthwestUrl(bookingData);
            case 'B6':
                return this.generateJetBlueUrl(bookingData);
            case 'AS':
                return this.generateAlaskaAirlinesUrl(bookingData);
            case 'NK':
                return this.generateSpiritAirlinesUrl(bookingData);
            case 'F9':
                return this.generateFrontierAirlinesUrl(bookingData);
            case 'TK':
                return this.generateTurkishAirlinesUrl(bookingData);
            default:
                // Fallback to generic search URL with flight details
                return this.generateGenericAirlineUrl(bookingData);
        }
    }

    /**
     * American Airlines booking URL
     */
    private static generateAmericanAirlinesUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            from: flight.outbound.origin,
            to: flight.outbound.destination,
            departDate: flight.outbound.departure.split('T')[0],
            returnDate: flight.inbound?.departure.split('T')[0] || '',
            passengers: '1',
            cabin: 'economy', // Default to economy for now
        });

        return `https://www.aa.com/booking/search?${params.toString()}`;
    }

    /**
     * United Airlines booking URL
     */
    private static generateUnitedAirlinesUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            f: flight.outbound.origin,
            t: flight.outbound.destination,
            d: flight.outbound.departure.split('T')[0],
            r: flight.inbound?.departure.split('T')[0] || '',
            px: '1',
            cm: 'econ',
        });

        return `https://www.united.com/en/us/fsr/choose-flights?${params.toString()}`;
    }

    /**
     * Delta Airlines booking URL
     */
    private static generateDeltaAirlinesUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            originAirportCode: flight.outbound.origin,
            destinationAirportCode: flight.outbound.destination,
            departureDate: flight.outbound.departure.split('T')[0],
            returnDate: flight.inbound?.departure.split('T')[0] || '',
            passengerCount: '1',
            serviceClass: 'COACH',
        });

        return `https://www.delta.com/shop/ow/search?${params.toString()}`;
    }

    /**
     * Southwest Airlines booking URL
     */
    private static generateSouthwestUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            originAirport: flight.outbound.origin,
            destinationAirport: flight.outbound.destination,
            departureDate: flight.outbound.departure.split('T')[0],
            returnDate: flight.inbound?.departure.split('T')[0] || '',
            adultPassengersCount: '1',
        });

        return `https://www.southwest.com/air/booking/select.html?${params.toString()}`;
    }

    /**
     * JetBlue booking URL
     */
    private static generateJetBlueUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            from: flight.outbound.origin,
            to: flight.outbound.destination,
            depart: flight.outbound.departure.split('T')[0],
            return: flight.inbound?.departure.split('T')[0] || '',
            passengers: '1',
        });

        return `https://www.jetblue.com/booking/flights?${params.toString()}`;
    }

    /**
     * Alaska Airlines booking URL
     */
    private static generateAlaskaAirlinesUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            from: flight.outbound.origin,
            to: flight.outbound.destination,
            departureDate: flight.outbound.departure.split('T')[0],
            returnDate: flight.inbound?.departure.split('T')[0] || '',
            numAdults: '1',
        });

        return `https://www.alaskaair.com/booking/reservation/search?${params.toString()}`;
    }

    /**
     * Spirit Airlines booking URL
     */
    private static generateSpiritAirlinesUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            OrigCity: flight.outbound.origin,
            DestCity: flight.outbound.destination,
            DeptDate: flight.outbound.departure.split('T')[0],
            RetDate: flight.inbound?.departure.split('T')[0] || '',
            Adults: '1',
        });

        return `https://www.spirit.com/BookFlight?${params.toString()}`;
    }

    /**
     * Frontier Airlines booking URL
     */
    private static generateFrontierAirlinesUrl(data: PartnerBookingData): string {
        const { flight } = data;

        const params = new URLSearchParams({
            departureCity: flight.outbound.origin,
            arrivalCity: flight.outbound.destination,
            departureDate: flight.outbound.departure.split('T')[0],
            returnDate: flight.inbound?.departure.split('T')[0] || '',
            adults: '1',
        });

        return `https://www.flyfrontier.com/flight/select?${params.toString()}`;
    }

    /**
     * Turkish Airlines booking URL - fallback to Google Flights with Turkish Airlines filter
     * Note: Turkish Airlines' direct booking URLs are not working consistently
     */
    private static generateTurkishAirlinesUrl(data: PartnerBookingData): string {
        const { flight } = data;

        // Turkish Airlines direct booking URLs are currently returning 404 errors
        // Use Google Flights with Turkish Airlines filter as a more reliable alternative
        const params = new URLSearchParams({
            f: '0',
            gl: 'us',
            hl: 'en',
            curr: 'USD',
            // Use tfs parameter for specific flight search
            tfs: `f.${flight.outbound.origin}.${flight.outbound.destination}.${flight.outbound.departure.split('T')[0]}${flight.inbound ? `*f.${flight.inbound.origin}.${flight.inbound.destination}.${flight.inbound.departure.split('T')[0]}` : ''}`,
            // Add Turkish Airlines filter
            airline: 'TK'
        });

        return `https://www.google.com/travel/flights?${params.toString()}`;
    }

    /**
     * Generic airline booking URL (fallback)
     */
    private static generateGenericAirlineUrl(data: PartnerBookingData): string {
        const { flight } = data;

        // Use Google Flights as fallback with specific flight details
        const params = new URLSearchParams({
            f: '0',
            gl: 'us',
            hl: 'en',
            curr: 'USD',
            tfs: `f.${flight.outbound.origin}.${flight.outbound.destination}.${flight.outbound.departure.split('T')[0]}${flight.inbound ? `*f.${flight.inbound.origin}.${flight.inbound.destination}.${flight.inbound.departure.split('T')[0]}` : ''}`,
        });

        return `https://www.google.com/travel/flights?${params.toString()}`;
    }

    /**
     * Map Amadeus cabin class to standard format
     */
    private static mapCabinClass(cabin?: string): string {
        switch (cabin?.toUpperCase()) {
            case 'ECONOMY':
                return 'economy';
            case 'PREMIUM_ECONOMY':
                return 'premium-economy';
            case 'BUSINESS':
                return 'business';
            case 'FIRST':
                return 'first';
            default:
                return 'economy';
        }
    }

    /**
     * Map cabin class for United Airlines
     */
    private static mapUnitedCabinClass(cabin?: string): string {
        switch (cabin?.toUpperCase()) {
            case 'ECONOMY':
                return 'econ';
            case 'PREMIUM_ECONOMY':
                return 'pecon';
            case 'BUSINESS':
                return 'business';
            case 'FIRST':
                return 'first';
            default:
                return 'econ';
        }
    }

    /**
     * Map cabin class for Delta Airlines
     */
    private static mapDeltaCabinClass(cabin?: string): string {
        switch (cabin?.toUpperCase()) {
            case 'ECONOMY':
                return 'COACH';
            case 'PREMIUM_ECONOMY':
                return 'PREMIUM_SELECT';
            case 'BUSINESS':
                return 'BUSINESS';
            case 'FIRST':
                return 'FIRST';
            default:
                return 'COACH';
        }
    }

    /**
     * Generate booking reference ID for tracking
     */
    static generateBookingReference(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 6);
        return `TC-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Get airline name from IATA code
     */
    static getAirlineName(iataCode: string): string {
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
}

/**
 * Store booking attempt for tracking and analytics
 */
export async function logBookingAttempt(bookingData: PartnerBookingData): Promise<void> {
    try {
        // Here you could log to your database or analytics service
        console.log('🎫 Booking attempt logged:', {
            referenceId: bookingData.bookingReferenceId,
            airline: bookingData.flight.carrier,
            route: `${bookingData.flight.outbound.origin} → ${bookingData.flight.outbound.destination}`,
            price: bookingData.flight.price,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Failed to log booking attempt:', error);
    }
}

/**
 * Direct booking function that immediately routes to airline website
 * Bypasses the modal and passenger form collection
 */
export async function proceedToAirlineBooking(flight: UnifiedFlightResult): Promise<void> {
    try {
        const bookingReferenceId = PartnerBookingService.generateBookingReference();

        // Create minimal booking data without passenger details
        const bookingData: PartnerBookingData = {
            flight,
            passengers: [], // No passenger data needed for direct routing
            contactInfo: { email: '', phone: '' }, // No contact data needed
            partnerRedirectUrl: '',
            bookingReferenceId,
        };

        // Log the booking attempt for analytics
        await logBookingAttempt(bookingData);

        // Get airline booking URL and open directly
        const partnerUrl = await PartnerBookingService.routeToPartner(bookingData);

        console.log(`🛫 Routing directly to ${PartnerBookingService.getAirlineName(flight.carrier)}: ${partnerUrl}`);

        // Open in new tab to preserve user's search results
        window.open(partnerUrl, '_blank');

    } catch (error) {
        console.error('Direct booking error:', error);
        alert(`Unable to route to airline website. Please try booking directly at ${PartnerBookingService.getAirlineName(flight.carrier)}.`);
    }
}
