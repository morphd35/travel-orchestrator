/**
 * Unified Flight Search Client
 * 
 * Primary: Skyscanner API (comprehensive airline coverage)
 * Fallback: Amadeus API (for backup when Skyscanner fails)
 * 
 * This provides the best of both worlds:
 * - Major airlines: American, Delta, United, British Airways
 * - Budget carriers: Southwest, Spirit, Frontier, Allegiant
 * - International carriers: Lufthansa, Air France, KLM, etc.
 */

import { skyscannerClient, SkyscannerSearchParams } from './skyscannerClient';
import { searchFlights as amadeusSearch } from './amadeusClient';

export interface UnifiedSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  currency?: string;
  max?: number;
}

export interface UnifiedFlightResult {
  id: string;
  price: number;
  currency: string;
  carrier: string;
  carrierName: string;
  source: 'skyscanner' | 'amadeus';
  outbound: {
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    duration: number;
    stops: number;
    segments: Array<{
      origin: string;
      destination: string;
      departure: string;
      arrival: string;
      flightNumber: string;
      carrier: string;
      carrierName: string;
      aircraft?: string;
      duration: number;
    }>;
  };
  inbound?: {
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    duration: number;
    stops: number;
    segments: Array<{
      origin: string;
      destination: string;
      departure: string;
      arrival: string;
      flightNumber: string;
      carrier: string;
      carrierName: string;
      aircraft?: string;
      duration: number;
    }>;
  };
  bookingUrl?: string;
  tags?: string[];
  farePolicy?: {
    isChangeAllowed: boolean;
    isCancellationAllowed: boolean;
  };
  score?: number;
}

class UnifiedFlightClient {
  private readonly USE_SKYSCANNER_PRIMARY = true;

  /**
   * Search flights using primary (Skyscanner) and fallback (Amadeus) providers
   */
  async searchFlights(params: UnifiedSearchParams): Promise<UnifiedFlightResult[]> {
    console.log(`🔍 Unified flight search: ${params.origin} → ${params.destination}`);
    
    let results: UnifiedFlightResult[] = [];

    // Primary: Try Skyscanner first
    if (this.USE_SKYSCANNER_PRIMARY) {
      try {
        console.log('🛫 Searching with Skyscanner (Primary)...');
        const skyscannerResults = await this.searchWithSkyscanner(params);
        results = results.concat(skyscannerResults);
        console.log(`✅ Skyscanner found ${skyscannerResults.length} flights`);
      } catch (error: any) {
        console.warn('⚠️ Skyscanner search failed:', error.message);
      }
    }

    // Fallback: Try Amadeus if Skyscanner didn't return enough results
    if (results.length < 5) {
      try {
        console.log(`🛫 Searching with Amadeus (Fallback)... Current results: ${results.length}`);
        const amadeusResults = await this.searchWithAmadeus(params);
        results = results.concat(amadeusResults);
        console.log(`✅ Amadeus added ${amadeusResults.length} flights`);
      } catch (error: any) {
        console.warn('⚠️ Amadeus search failed:', error.message);
      }
    }

    // Sort by price (disable deduplication temporarily to see all results)
    // const uniqueResults = this.deduplicateFlights(results);
    const sortedResults = results.sort((a, b) => a.price - b.price);

    // Limit results
    const maxResults = params.max || 50;
    const finalResults = sortedResults.slice(0, maxResults);

    console.log(`🎯 Final results: ${finalResults.length} unique flights`);
    this.logAirlineCoverage(finalResults);

    return finalResults;
  }

  /**
   * Search flights using Skyscanner API
   */
  private async searchWithSkyscanner(params: UnifiedSearchParams): Promise<UnifiedFlightResult[]> {
    const skyscannerParams: SkyscannerSearchParams = {
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      returnDate: params.returnDate,
      adults: params.adults || 1,
      children: params.children || 0,
      infants: params.infants || 0,
      cabinClass: params.cabinClass || 'economy',
      currency: params.currency || 'USD',
      locale: 'en-US',
      market: 'US'
    };

    const response = await skyscannerClient.searchFlights(skyscannerParams);
    
    if (!response.content?.results?.itineraries) {
      throw new Error('No flights found in Skyscanner response');
    }

    return response.content.results.itineraries.map(flight => {
      const converted = skyscannerClient.convertToInternalFormat(flight);
      return {
        id: `sky_${flight.id}`,
        price: flight.price.amount,
        currency: flight.price.currency,
        carrier: converted.carrier,
        carrierName: converted.carrierName,
        source: 'skyscanner' as const,
        outbound: converted.outbound,
        inbound: converted.inbound,
        bookingUrl: skyscannerClient.getBookingUrl(flight, 'travel-conductor'),
        tags: flight.tags,
        farePolicy: flight.farePolicy,
        score: flight.score
      };
    });
  }

  /**
   * Search flights using Amadeus API (fallback)
   */
  private async searchWithAmadeus(params: UnifiedSearchParams): Promise<UnifiedFlightResult[]> {
    try {
      const amadeusResults = await amadeusSearch({
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
        returnDate: params.returnDate,
        adults: params.adults || 1,
        currency: params.currency || 'USD',
        max: 20 // Limit Amadeus results since it's fallback
      });

      return amadeusResults.map((flight: any, index: number) => {
        // Extract real flight data from Amadeus raw response
        const rawOffer = flight.raw;
        const outboundItinerary = rawOffer?.itineraries?.[0];
        const returnItinerary = rawOffer?.itineraries?.[1];
        const outboundSegments = outboundItinerary?.segments || [];
        const returnSegments = returnItinerary?.segments || [];
        
        // Get carrier name mapping
        const getCarrierName = (code: string): string => {
          const carriers: Record<string, string> = {
            'AA': 'American Airlines',
            'DL': 'Delta Air Lines', 
            'UA': 'United Airlines',
            'AS': 'Alaska Airlines',
            'B6': 'JetBlue Airways',
            'WN': 'Southwest Airlines',
            'NK': 'Spirit Airlines',
            'F9': 'Frontier Airlines',
            'G4': 'Allegiant Air'
          };
          return carriers[code] || `${code} Airlines`;
        };

        return {
          id: `ama_${index}`,
          price: flight.total || 0,
          currency: flight.currency || 'USD',
          carrier: flight.carrier || 'UNKNOWN',
          carrierName: getCarrierName(flight.carrier || 'UNKNOWN'),
          source: 'amadeus' as const,
          outbound: {
            origin: outboundSegments[0]?.departure?.iataCode || params.origin,
            destination: outboundSegments[outboundSegments.length - 1]?.arrival?.iataCode || params.destination,
            departure: outboundSegments[0]?.departure?.at || '',
            arrival: outboundSegments[outboundSegments.length - 1]?.arrival?.at || '',
            duration: this.parseDuration(outboundItinerary?.duration || 'PT0M'),
            stops: flight.stopsOut || 0,
            segments: outboundSegments.map((segment: any) => ({
              origin: segment.departure?.iataCode || '',
              destination: segment.arrival?.iataCode || '',
              departure: segment.departure?.at || '',
              arrival: segment.arrival?.at || '',
              flightNumber: `${segment.carrierCode}${segment.number}`,
              carrier: segment.carrierCode || '',
              carrierName: getCarrierName(segment.carrierCode || ''),
              aircraft: segment.aircraft?.code || '',
              duration: this.parseDuration(segment.duration || 'PT0M')
            }))
          },
          // Add inbound for round trips if available
          inbound: returnItinerary ? {
            origin: returnSegments[0]?.departure?.iataCode || params.destination,
            destination: returnSegments[returnSegments.length - 1]?.arrival?.iataCode || params.origin,
            departure: returnSegments[0]?.departure?.at || '',
            arrival: returnSegments[returnSegments.length - 1]?.arrival?.at || '',
            duration: this.parseDuration(returnItinerary.duration || 'PT0M'),
            stops: flight.stopsBack || 0,
            segments: returnSegments.map((segment: any) => ({
              origin: segment.departure?.iataCode || '',
              destination: segment.arrival?.iataCode || '',
              departure: segment.departure?.at || '',
              arrival: segment.arrival?.at || '',
              flightNumber: `${segment.carrierCode}${segment.number}`,
              carrier: segment.carrierCode || '',
              carrierName: getCarrierName(segment.carrierCode || ''),
              aircraft: segment.aircraft?.code || '',
              duration: this.parseDuration(segment.duration || 'PT0M')
            }))
          } : undefined
        };
      });
    } catch (error) {
      console.warn('Amadeus fallback failed:', error);
      return [];
    }
  }

  /**
   * Remove duplicate flights based on similar routes and times
   */
  private deduplicateFlights(flights: UnifiedFlightResult[]): UnifiedFlightResult[] {
    const seen = new Set<string>();
    const unique: UnifiedFlightResult[] = [];

    for (const flight of flights) {
      // Create a deduplication key based on route, hour, and carrier (less strict)
      const departureHour = flight.outbound.departure.substring(0, 13); // YYYY-MM-DDTHH format
      const key = `${flight.outbound.origin}-${flight.outbound.destination}-${departureHour}-${flight.carrier}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(flight);
      } else {
        // Keep the cheaper flight if duplicate found
        const existingIndex = unique.findIndex(f => 
          f.outbound.origin === flight.outbound.origin &&
          f.outbound.destination === flight.outbound.destination &&
          f.outbound.departure.substring(0, 13) === departureHour &&
          f.carrier === flight.carrier
        );
        if (existingIndex >= 0 && flight.price < unique[existingIndex].price) {
          unique[existingIndex] = flight;
        }
      }
    }

    return unique;
  }

  /**
   * Parse ISO 8601 duration to minutes
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
  }

  /**
   * Log airline coverage for debugging
   */
  private logAirlineCoverage(flights: UnifiedFlightResult[]): void {
    const airlines = new Set(flights.map(f => f.carrier));
    const sources = flights.reduce((acc, f) => {
      acc[f.source] = (acc[f.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📊 Airline coverage: ${airlines.size} unique carriers`);
    console.log(`📈 Source breakdown:`, sources);
    console.log(`🛫 Airlines found: ${Array.from(airlines).sort().join(', ')}`);
  }
}

// Export singleton instance
export const unifiedFlightClient = new UnifiedFlightClient();
