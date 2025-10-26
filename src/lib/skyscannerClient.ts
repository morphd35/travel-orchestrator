/**
 * Skyscanner Flight API Client
 * 
 * Provides comprehensive flight search with major airlines including:
 * - American Airlines, Delta, United, British Airways
 * - Budget carriers: Southwest, Spirit, Frontier, Allegiant
 * - International carriers: Lufthansa, Air France, KLM, etc.
 * 
 * Uses RapidAPI as the platform for easy integration
 */

interface SkyscannerSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  currency?: string;
  locale?: string;
  market?: string;
}

interface SkyscannerFlight {
  id: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  legs: Array<{
    origin: {
      id: string;
      name: string;
      displayCode: string;
      city: string;
      country: string;
    };
    destination: {
      id: string;
      name: string;
      displayCode: string;
      city: string;
      country: string;
    };
    departure: string;
    arrival: string;
    duration: number;
    stops: number;
    stopoverAirports: string[];
    carriers: Array<{
      id: string;
      name: string;
      displayCode: string;
      imageUrl: string;
    }>;
    segments: Array<{
      id: string;
      origin: string;
      destination: string;
      departure: string;
      arrival: string;
      flightNumber: string;
      carrier: {
        id: string;
        name: string;
        displayCode: string;
      };
      aircraft: string;
      duration: number;
    }>;
  }>;
  tags: string[];
  isSelfTransfer: boolean;
  isProtectedSelfTransfer: boolean;
  farePolicy: {
    isChangeAllowed: boolean;
    isPartiallyChangeable: boolean;
    isCancellationAllowed: boolean;
    isPartiallyRefundable: boolean;
  };
  eco: {
    ecoContenderDelta: number;
  };
  fareAttributes: {
    [key: string]: string;
  };
  isMashUp: boolean;
  hasFlexibleOptions: boolean;
  score: number;
}

interface SkyscannerSearchResponse {
  status: string;
  action: string;
  content: {
    results: {
      itineraries: SkyscannerFlight[];
      agents: Array<{
        id: string;
        name: string;
        imageUrl: string;
        status: string;
        updateStatus: string;
        optimisedForMobile: boolean;
        bookingNumber: string;
        isCarrier: boolean;
      }>;
      places: Array<{
        entityId: string;
        parentId: string;
        name: string;
        type: string;
        iata: string;
        coordinates: {
          latitude: number;
          longitude: number;
        };
      }>;
      carriers: Array<{
        id: string;
        name: string;
        imageUrl: string;
        displayCode: string;
        allianceName: string;
      }>;
    };
    sortingOptions: Array<{
      id: string;
      isSelected: boolean;
    }>;
    stats: {
      total: {
        count: number;
        formattedCount: string;
        minPrice: {
          amount: number;
          currency: string;
          formatted: string;
        };
      };
    };
  };
  sessionToken: string;
}

class SkyscannerClient {
  private apiKey: string;
  private baseUrl = 'https://sky-scanner3.p.rapidapi.com';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || process.env.SKYSCANNER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Skyscanner API key not found. Please set RAPIDAPI_KEY or SKYSCANNER_API_KEY environment variable.');
    }
  }

  /**
   * Search for flights using Skyscanner API
   */
  async searchFlights(params: SkyscannerSearchParams): Promise<SkyscannerSearchResponse> {
    // Check if API key is properly configured
    if (!this.apiKey || this.apiKey === 'your_rapidapi_key_here') {
      throw new Error('Skyscanner API key not configured. Please set RAPIDAPI_KEY in .env.local');
    }

    const cacheKey = JSON.stringify(params);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('📦 Using cached Skyscanner results');
      return cached.data;
    }

    try {
      console.log(`🛫 Searching Skyscanner: ${params.origin} → ${params.destination} on ${params.departDate}`);

      // Step 1: Create search session
      const searchPayload = {
        market: params.market || 'US',
        locale: params.locale || 'en-US',
        currency: params.currency || 'USD',
        adults: params.adults || 1,
        children: params.children || 0,
        infants: params.infants || 0,
        cabinClass: params.cabinClass?.toUpperCase() || 'ECONOMY',
        stops: 'STOPS_OPTION_ANY', // Allow any number of stops
        sort: 'SORT_OPTION_BEST', // Best overall value
        legs: [
          {
            origin: params.origin,
            destination: params.destination,
            date: params.departDate
          }
        ]
      };

      // Add return leg if round trip
      if (params.returnDate) {
        searchPayload.legs.push({
          origin: params.destination,
          destination: params.origin,
          date: params.returnDate
        });
      }

      const createSearchResponse = await fetch(`${this.baseUrl}/flights/search-everywhere`, {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'sky-scanner3.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchPayload)
      });

      if (!createSearchResponse.ok) {
        throw new Error(`Skyscanner API error: ${createSearchResponse.status} ${createSearchResponse.statusText}`);
      }

      const searchResult = await createSearchResponse.json() as SkyscannerSearchResponse;

      // Cache the results
      this.cache.set(cacheKey, { data: searchResult, timestamp: Date.now() });

      console.log(`✅ Found ${searchResult.content?.results?.itineraries?.length || 0} flights from Skyscanner`);
      
      return searchResult;

    } catch (error: any) {
      console.error('❌ Skyscanner API error:', error.message);
      
      // Don't return mock data - let unified client handle fallback to Amadeus
      throw new Error(`Skyscanner API unavailable: ${error.message}`);
    }
  }

  /**
   * Convert Skyscanner flight to our internal format
   */
  convertToInternalFormat(skyscannerFlight: SkyscannerFlight): any {
    const outboundLeg = skyscannerFlight.legs[0];
    const returnLeg = skyscannerFlight.legs[1];

    return {
      id: skyscannerFlight.id,
      price: skyscannerFlight.price.amount,
      currency: skyscannerFlight.price.currency,
      carrier: outboundLeg.carriers[0]?.displayCode || 'MULTI',
      carrierName: outboundLeg.carriers[0]?.name || 'Multiple Airlines',
      outbound: {
        origin: outboundLeg.origin.displayCode,
        destination: outboundLeg.destination.displayCode,
        departure: outboundLeg.departure,
        arrival: outboundLeg.arrival,
        duration: outboundLeg.duration,
        stops: outboundLeg.stops,
        segments: outboundLeg.segments.map(segment => ({
          origin: segment.origin,
          destination: segment.destination,
          departure: segment.departure,
          arrival: segment.arrival,
          flightNumber: segment.flightNumber,
          carrier: segment.carrier.displayCode,
          carrierName: segment.carrier.name,
          aircraft: segment.aircraft,
          duration: segment.duration
        }))
      },
      inbound: returnLeg ? {
        origin: returnLeg.origin.displayCode,
        destination: returnLeg.destination.displayCode,
        departure: returnLeg.departure,
        arrival: returnLeg.arrival,
        duration: returnLeg.duration,
        stops: returnLeg.stops,
        segments: returnLeg.segments.map(segment => ({
          origin: segment.origin,
          destination: segment.destination,
          departure: segment.departure,
          arrival: segment.arrival,
          flightNumber: segment.flightNumber,
          carrier: segment.carrier.displayCode,
          carrierName: segment.carrier.name,
          aircraft: segment.aircraft,
          duration: segment.duration
        }))
      } : undefined,
      bookingOptions: skyscannerFlight.tags,
      farePolicy: skyscannerFlight.farePolicy,
      score: skyscannerFlight.score
    };
  }

  /**
   * Get booking URL for a flight (affiliate link)
   */
  getBookingUrl(flight: SkyscannerFlight, affiliate_id?: string): string {
    // This would typically be a deep link to Skyscanner with affiliate tracking
    const baseUrl = 'https://www.skyscanner.com/transport/flights';
    const params = new URLSearchParams();
    
    if (affiliate_id) {
      params.set('associateid', affiliate_id);
    }
    
    params.set('ref', 'travel-conductor');
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Mock data for development/testing
   */
  private getMockFlightData(params: SkyscannerSearchParams): SkyscannerSearchResponse {
    return {
      status: 'RESULT_STATUS_COMPLETE',
      action: 'RESULT_ACTION_REPLACED',
      content: {
        results: {
          itineraries: [
            {
              id: 'mock-aa-flight',
              price: { amount: 299, currency: 'USD', formatted: '$299' },
              legs: [{
                origin: { id: params.origin, name: 'Origin Airport', displayCode: params.origin, city: 'Origin City', country: 'US' },
                destination: { id: params.destination, name: 'Destination Airport', displayCode: params.destination, city: 'Destination City', country: 'US' },
                departure: `${params.departDate}T08:00:00`,
                arrival: `${params.departDate}T11:30:00`,
                duration: 210,
                stops: 0,
                stopoverAirports: [],
                carriers: [{ id: 'AA', name: 'American Airlines', displayCode: 'AA', imageUrl: '' }],
                segments: [{
                  id: 'segment-1',
                  origin: params.origin,
                  destination: params.destination,
                  departure: `${params.departDate}T08:00:00`,
                  arrival: `${params.departDate}T11:30:00`,
                  flightNumber: 'AA1234',
                  carrier: { id: 'AA', name: 'American Airlines', displayCode: 'AA' },
                  aircraft: 'Boeing 737-800',
                  duration: 210
                }]
              }],
              tags: ['FASTEST', 'BEST'],
              isSelfTransfer: false,
              isProtectedSelfTransfer: false,
              farePolicy: { isChangeAllowed: true, isPartiallyChangeable: false, isCancellationAllowed: true, isPartiallyRefundable: false },
              eco: { ecoContenderDelta: 0 },
              fareAttributes: {},
              isMashUp: false,
              hasFlexibleOptions: true,
              score: 1000
            } as SkyscannerFlight,
            {
              id: 'mock-dl-flight',
              price: { amount: 325, currency: 'USD', formatted: '$325' },
              legs: [{
                origin: { id: params.origin, name: 'Origin Airport', displayCode: params.origin, city: 'Origin City', country: 'US' },
                destination: { id: params.destination, name: 'Destination Airport', displayCode: params.destination, city: 'Destination City', country: 'US' },
                departure: `${params.departDate}T10:15:00`,
                arrival: `${params.departDate}T13:45:00`,
                duration: 210,
                stops: 0,
                stopoverAirports: [],
                carriers: [{ id: 'DL', name: 'Delta Air Lines', displayCode: 'DL', imageUrl: '' }],
                segments: [{
                  id: 'segment-2',
                  origin: params.origin,
                  destination: params.destination,
                  departure: `${params.departDate}T10:15:00`,
                  arrival: `${params.departDate}T13:45:00`,
                  flightNumber: 'DL5678',
                  carrier: { id: 'DL', name: 'Delta Air Lines', displayCode: 'DL' },
                  aircraft: 'Airbus A320',
                  duration: 210
                }]
              }],
              tags: ['CHEAPEST'],
              isSelfTransfer: false,
              isProtectedSelfTransfer: false,
              farePolicy: { isChangeAllowed: true, isPartiallyChangeable: false, isCancellationAllowed: false, isPartiallyRefundable: false },
              eco: { ecoContenderDelta: 26 },
              fareAttributes: {},
              isMashUp: false,
              hasFlexibleOptions: false,
              score: 950
            } as SkyscannerFlight,
            {
              id: 'mock-nk-flight',
              price: { amount: 159, currency: 'USD', formatted: '$159' },
              legs: [{
                origin: { id: params.origin, name: 'Origin Airport', displayCode: params.origin, city: 'Origin City', country: 'US' },
                destination: { id: params.destination, name: 'Destination Airport', displayCode: params.destination, city: 'Destination City', country: 'US' },
                departure: `${params.departDate}T14:20:00`,
                arrival: `${params.departDate}T17:50:00`,
                duration: 210,
                stops: 0,
                stopoverAirports: [],
                carriers: [{ id: 'NK', name: 'Spirit Airlines', displayCode: 'NK', imageUrl: '' }],
                segments: [{
                  id: 'segment-3',
                  origin: params.origin,
                  destination: params.destination,
                  departure: `${params.departDate}T14:20:00`,
                  arrival: `${params.departDate}T17:50:00`,
                  flightNumber: 'NK9102',
                  carrier: { id: 'NK', name: 'Spirit Airlines', displayCode: 'NK' },
                  aircraft: 'Airbus A319',
                  duration: 210
                }]
              }],
              tags: ['BUDGET', 'CHEAPEST'],
              isSelfTransfer: false,
              isProtectedSelfTransfer: false,
              farePolicy: { isChangeAllowed: false, isPartiallyChangeable: false, isCancellationAllowed: false, isPartiallyRefundable: false },
              eco: { ecoContenderDelta: -140 },
              fareAttributes: { 'BARE_FARE': 'true' },
              isMashUp: false,
              hasFlexibleOptions: false,
              score: 800
            } as SkyscannerFlight
          ],
          agents: [],
          places: [],
          carriers: []
        },
        sortingOptions: [],
        stats: {
          total: {
            count: 3,
            formattedCount: '3',
            minPrice: { amount: 159, currency: 'USD', formatted: '$159' }
          }
        }
      },
      sessionToken: 'mock-session-token'
    };
  }
}

// Export singleton instance
export const skyscannerClient = new SkyscannerClient();
export type { SkyscannerSearchParams, SkyscannerFlight, SkyscannerSearchResponse };
