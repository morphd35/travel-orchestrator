'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiPath } from '@/lib/apiBase';
import { getCityFromIATA, normalizeToIATA } from '@/lib/iataCity';
import { bookingCityDeeplink } from '@/lib/booking';
import AirportAutocomplete from '@/components/AirportAutocomplete';
import PriceWatchModal from '@/components/PriceWatchModal';
import { getAirlineName, getAirportName, AIRLINE_NAMES, formatStopsInfo } from '@/lib/airlineUtils';
import { useAuth } from '@/lib/auth';

// Price monitoring is handled by the /edge/watch/run endpoint
// and can be triggered manually or via cron jobs

// Helper function to convert airport codes to destination slugs
function getDestinationSlug(airportCode: string): string {
  const destinationMap: Record<string, string> = {
    'FCO': 'rome',
    'CIA': 'rome',
    'CUN': 'cancun',
    'LHR': 'london',
    'LGW': 'london',
    'STN': 'london',
    'LTN': 'london',
    'NRT': 'tokyo',
    'HND': 'tokyo',
    'CDG': 'paris',
    'ORY': 'paris',
    'BCN': 'barcelona',
    'MAD': 'madrid',
    'DUB': 'dublin',
    'AMS': 'amsterdam',
    'FRA': 'frankfurt',
    'MUC': 'munich',
    'ZUR': 'zurich',
    'VIE': 'vienna',
    'PRG': 'prague',
    'WAW': 'warsaw',
    'CPH': 'copenhagen',
    'ARN': 'stockholm',
    'OSL': 'oslo',
    'HEL': 'helsinki',
    'IST': 'istanbul',
    'ATH': 'athens',
    'VCE': 'venice',
    'MIL': 'milan',
    'NAP': 'naples',
    'FLR': 'florence',
    'LIS': 'lisbon',
    'SVQ': 'seville'
  };

  return destinationMap[airportCode] || airportCode.toLowerCase();
}

type SearchReq = {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  flexibilityDays: number;
  includeHotel: boolean;
  includeCar: boolean;
  includeActivities: boolean;
  budgetUsd?: number;
  travelers: {
    adults: number;
    children: number;
    seniors: number; // Adults over 60
  };
};

type PackageResult = {
  id: string;
  summary: string;
  total: number;
  components: {
    flight?: {
      carrier: string;
      carrierName: string;
      flightNumber: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
      stops: number;
      aircraft: string;
      segments?: Array<{
        departure: { iataCode?: string; at?: string };
        arrival: { iataCode?: string; at?: string };
        carrierCode?: string;
        number?: string;
      }>;
    };
    hotel?: { name: string };
    car?: { vendor: string };
  };
};

// Helper function to extract real flight data from Amadeus API response
function extractRealFlightData(flight: any) {
  // Use the raw flight data from the centralized client
  const fullOffer = flight.raw;
  if (!fullOffer || !fullOffer.itineraries || !fullOffer.itineraries[0]) {
    // Fallback to basic data if raw offer is not available
    return {
      carrierCode: flight.carrier || 'XX',
      flightNumber: `${flight.carrier || 'XX'}${Math.floor(Math.random() * 9000) + 1000}`,
      departureTime: '10:00 AM',
      arrivalTime: '2:00 PM',
      duration: '4h 00m',
      stops: flight.stopsOut || 0,
      aircraft: 'Aircraft TBD',
      segments: []
    };
  }

  const itinerary = fullOffer.itineraries[0];
  const segments = itinerary.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (!firstSegment || !lastSegment) {
    return {
      carrierCode: flight.carrier || 'XX',
      flightNumber: `${flight.carrier || 'XX'}${Math.floor(Math.random() * 9000) + 1000}`,
      departureTime: '10:00 AM',
      arrivalTime: '2:00 PM',
      duration: '4h 00m',
      stops: flight.stopsOut || 0,
      aircraft: 'Aircraft TBD',
      segments: []
    };
  }

  // Extract real flight details
  const carrierCode = firstSegment.carrierCode || flight.carrier || 'XX';
  const flightNumber = firstSegment.number ? `${carrierCode}${firstSegment.number}` : `${carrierCode}${Math.floor(Math.random() * 9000) + 1000}`;

  // Format departure and arrival times
  const departureTime = formatFlightTime(firstSegment.departure?.at);
  const arrivalTime = formatFlightTime(lastSegment.arrival?.at);

  // Calculate duration
  const duration = parseDuration(itinerary.duration);

  // Get aircraft type if available
  const aircraft = firstSegment.aircraft?.code || 'Aircraft TBD';

  // Calculate actual stops
  const stops = Math.max(0, segments.length - 1);

  return {
    carrierCode,
    flightNumber,
    departureTime,
    arrivalTime,
    duration,
    stops,
    aircraft,
    segments: segments.map((seg: any) => ({
      departure: {
        iataCode: seg.departure?.iataCode,
        at: seg.departure?.at
      },
      arrival: {
        iataCode: seg.arrival?.iataCode,
        at: seg.arrival?.at
      },
      carrierCode: seg.carrierCode,
      number: seg.number
    }))
  };
}

// Helper function to format flight times
function formatFlightTime(isoString: string | undefined): string {
  if (!isoString) return '00:00';

  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '00:00';
  }
}

// Helper function to parse ISO 8601 duration (PT2H21M) to readable format
function parseDuration(isoDuration: string | undefined): string {
  if (!isoDuration) return '4h 00m';

  try {
    // Parse PT2H21M format
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return '4h 00m';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
  } catch {
    return '4h 00m';
  }
}

function Home() {
  const urlParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PackageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchParams, setSearchParams] = useState<SearchReq | null>(null);
  const [originIATA, setOriginIATA] = useState('');
  const [destinationIATA, setDestinationIATA] = useState('');

  // Traveler counts
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);

  // Include options
  const [includeHotel, setIncludeHotel] = useState(true);
  const [includeCar, setIncludeCar] = useState(false);
  const [includeActivities, setIncludeActivities] = useState(true);

  // Filter options
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');

  // Price watch modal
  const [priceWatchModalOpen, setPriceWatchModalOpen] = useState(false);
  const [selectedFlightForWatch, setSelectedFlightForWatch] = useState<PackageResult | null>(null);

  // Route watch modal
  const [routeWatchModalOpen, setRouteWatchModalOpen] = useState(false);
  const [watchTargetUsd, setWatchTargetUsd] = useState('');
  const [watchEmail, setWatchEmail] = useState('');
  const [watchCabin, setWatchCabin] = useState('ECONOMY');
  const [watchMaxStops, setWatchMaxStops] = useState(1);
  const [watchFlexDays, setWatchFlexDays] = useState(2);
  const [watchCreating, setWatchCreating] = useState(false);

  // Ref for auto-scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);

  // Function to filter and sort results
  const getFilteredResults = () => {
    let filtered = results;

    // Filter by airlines
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(r =>
        r.components.flight && selectedAirlines.includes(r.components.flight.carrier)
      );
    }

    // Filter by time
    if (timeFilter !== 'all') {
      filtered = filtered.filter(r => {
        if (!r.components.flight?.departureTime) return true;
        const time = r.components.flight.departureTime;
        const hour = parseInt(time.split(':')[0]);
        const isPM = time.includes('PM');
        const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

        if (timeFilter === 'morning') return hour24 >= 6 && hour24 < 12;
        if (timeFilter === 'afternoon') return hour24 >= 12 && hour24 < 18;
        if (timeFilter === 'evening') return hour24 >= 18 || hour24 < 6;
        return true;
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      if (sortBy === 'price') return a.total - b.total;
      if (sortBy === 'duration') {
        const getDurationMinutes = (duration: string) => {
          const matches = duration.match(/(\d+)h\s*(\d+)?m?/);
          if (!matches) return 0;
          const hours = parseInt(matches[1]) || 0;
          const minutes = parseInt(matches[2]) || 0;
          return hours * 60 + minutes;
        };
        const durationA = a.components.flight?.duration ? getDurationMinutes(a.components.flight.duration) : 0;
        const durationB = b.components.flight?.duration ? getDurationMinutes(b.components.flight.duration) : 0;
        return durationA - durationB;
      }
      if (sortBy === 'departure') {
        const getTimeMinutes = (time: string) => {
          const [hourMin, period] = time.split(' ');
          const [hour, minute] = hourMin.split(':').map(Number);
          const hour24 = period === 'PM' && hour !== 12 ? hour + 12 : (period === 'AM' && hour === 12 ? 0 : hour);
          return hour24 * 60 + minute;
        };
        const timeA = a.components.flight?.departureTime ? getTimeMinutes(a.components.flight.departureTime) : 0;
        const timeB = b.components.flight?.departureTime ? getTimeMinutes(b.components.flight.departureTime) : 0;
        return timeA - timeB;
      }
      return 0;
    });

    return filtered;
  };

  // Get unique airlines from results
  const getAvailableAirlines = () => {
    const airlines = new Set<string>();
    results.forEach(r => {
      if (r.components.flight?.carrier) {
        airlines.add(r.components.flight.carrier);
      }
    });
    return Array.from(airlines);
  };

  // Auto-scroll to results when they're loaded
  useEffect(() => {
    if (!loading && (results.length > 0 || error) && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100); // Small delay to ensure DOM is updated
    }
  }, [loading, results.length, error]);

  // Airline mapping - codes to full names and info
  // Generate airline map with quality ratings using our comprehensive airline database
  const getAirlineQuality = (code: string): 'premium' | 'standard' | 'budget' => {
    const premiumCarriers = ['LH', 'BA', 'AF', 'KL', 'VS', 'EK', 'QR', 'EY', 'SQ', 'CX', 'JL', 'NH'];
    const budgetCarriers = ['F9', 'NK', 'G4', 'FR', 'U2', 'VY', 'W6'];

    if (premiumCarriers.includes(code)) return 'premium';
    if (budgetCarriers.includes(code)) return 'budget';
    return 'standard';
  };

  const airlineMap: Record<string, { name: string; quality: 'premium' | 'standard' | 'budget' }> =
    Object.fromEntries(
      Object.entries(AIRLINE_NAMES).map(([code, name]) => [
        code,
        { name, quality: getAirlineQuality(code) }
      ])
    );

  // Aircraft types
  const aircraftTypes = [
    'Boeing 737-800', 'Airbus A320', 'Boeing 777-300ER', 'Airbus A350-900',
    'Boeing 787-9', 'Airbus A321', 'Boeing 757-200', 'Embraer E175'
  ];

  // Generate realistic flight times based on origin/destination
  const generateFlightTimes = (departureDate: string) => {
    const baseDate = new Date(departureDate);
    const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const departureHour = hours[Math.floor(Math.random() * hours.length)];
    const departureMinutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

    const departure = new Date(baseDate);
    departure.setHours(departureHour, departureMinutes);

    // Random flight duration between 1.5 and 8 hours
    const durationHours = 1.5 + Math.random() * 6.5;
    const arrival = new Date(departure.getTime() + durationHours * 60 * 60 * 1000);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    const formatDuration = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    };

    return {
      departureTime: formatTime(departure),
      arrivalTime: formatTime(arrival),
      duration: formatDuration(durationHours)
    };
  };
  const [activities, setActivities] = useState<Array<{
    id: string;
    title: string;
    price: { amount: number; currency: string };
    url: string;
    reviewCount: number;
    rating: number;
    imageUrl?: string;
    fromPrice: number;
    images?: Array<{ url: string }>;
  }>>([]);

  // Handle URL parameters from email deeplinks
  useEffect(() => {
    if (urlParams) {
      const origin = urlParams.get('o');
      const destination = urlParams.get('d');
      const departDate = urlParams.get('ds');
      const returnDate = urlParams.get('rs');

      if (origin) {
        setOriginIATA(origin);
      }
      if (destination) {
        setDestinationIATA(destination);
      }
      if (departDate) {
        setStartDate(departDate);
      }
      if (returnDate) {
        setEndDate(returnDate);
      }

      // If we have all required params, automatically trigger search
      if (origin && destination && departDate) {
        console.log(`🔗 Pre-filling form from email link: ${origin} → ${destination} on ${departDate}`);

        // Small delay to ensure state is set before triggering search
        setTimeout(() => {
          const searchButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (searchButton && !searchButton.disabled) {
            console.log('🔍 Auto-triggering search from email deeplink');
            searchButton.click();
          }
        }, 1000);
      }
    }
  }, [urlParams]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate minimum end date (day after start date)
  const minEndDate = startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : today;

  // Create a route watch
  async function createRouteWatch() {
    if (!originIATA || !destinationIATA || !startDate || !endDate || !watchTargetUsd || !watchEmail) {
      alert('Please fill in all required fields including destination, dates, target price, and email.');
      return;
    }

    // Basic email validation
    if (!watchEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    const targetPrice = parseFloat(watchTargetUsd);
    if (isNaN(targetPrice) || targetPrice <= 0) {
      alert('Please enter a valid target price.');
      return;
    }

    setWatchCreating(true);

    try {
      const watchData = {
        origin: originIATA.toUpperCase(),
        destination: destinationIATA.toUpperCase(),
        start: startDate,
        end: endDate,
        targetUsd: targetPrice,
        cabin: watchCabin,
        maxStops: watchMaxStops,
        flexDays: watchFlexDays,
        adults: adults + seniors, // Combine adults and seniors
        currency: 'USD',
        active: true,
        email: watchEmail
      };

      const response = await fetch('/edge/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(watchData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create watch');
      }

      const result = await response.json();

      // Show success message
      alert(`✅ Watching! We'll email you on drops.\n\nWatch ID: ${result.id}\nRoute: ${getAirportName(result.origin)} → ${getAirportName(result.destination)}\nTarget: $${result.targetUsd}`);

      // Close modal and reset form
      setRouteWatchModalOpen(false);
      setWatchTargetUsd('');
      setWatchEmail('');
      setWatchCabin('ECONOMY');
      setWatchMaxStops(1);
      setWatchFlexDays(2);

    } catch (error: any) {
      console.error('Failed to create watch:', error);
      alert('❌ Failed to create watch: ' + error.message);
    } finally {
      setWatchCreating(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResults([]);
    setActivities([]); // Clear previous activities

    console.log('🚀 LOADING STATE SET TO TRUE - Modal should show now!');

    const payload: SearchReq = {
      origin: originIATA.toUpperCase(),
      destination: destinationIATA.toUpperCase(),
      startDate: startDate,
      endDate: endDate,
      flexibilityDays: 0, // Can be made dynamic later
      includeHotel: includeHotel,
      includeCar: includeCar,
      includeActivities: includeActivities,
      budgetUsd: undefined, // Can be made dynamic later
      travelers: {
        adults: adults,
        children: children,
        seniors: seniors,
      },
    };

    // Validate that we have origin and destination
    if (!payload.origin || !payload.destination) {
      setError('Please select both origin and destination airports');
      setLoading(false);
      return;
    }

    // Log search parameters for debugging
    console.log('🔍 Search initiated:', {
      origin: payload.origin,
      destination: payload.destination,
      dates: `${payload.startDate} to ${payload.endDate}`,
      travelers: `${payload.travelers.adults} adults, ${payload.travelers.seniors} seniors, ${payload.travelers.children} children`,
      amadeusTravelers: `${payload.travelers.adults + payload.travelers.seniors} adults, ${payload.travelers.children} children`,
      includeHotel: payload.includeHotel,
    });

    // Store search params for use in results
    setSearchParams(payload);

    // Validate dates
    if (new Date(payload.startDate) >= new Date(payload.endDate)) {
      setError('Return date must be after departure date');
      setLoading(false);
      return;
    }

    try {
      // Normalize airport codes (convert NYC→JFK, etc.)
      const normalizedOrigin = normalizeToIATA(payload.origin);
      const normalizedDestination = normalizeToIATA(payload.destination);

      // Use new centralized flight search API with proper error handling and caching
      const flightRes = await fetch(apiPath('/api/flights/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: normalizedOrigin,
          destination: normalizedDestination,
          departDate: payload.startDate,
          returnDate: payload.endDate,
          adults: payload.travelers.adults + payload.travelers.seniors, // Amadeus combines adults and seniors
          currency: 'USD',
          max: 50,
          userId: user?.id, // Include user ID for search history recording
        }),
      });

      if (!flightRes.ok) {
        const errorData = await flightRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Flight search API error:', errorData);
        setError(errorData.error || 'Unable to fetch flight data. Please try again later.');
        setResults([]);
        setLoading(false);
        return;
      }

      const flightData = await flightRes.json();
      const flights = flightData.results || [];

      if (flights.length === 0) {
        setError('No flights found from Amadeus for this route. Note: American Airlines, Delta, and some low-cost carriers are currently unavailable in the Amadeus test API. Try different dates, destinations, or check back later.');
        setLoading(false);
        return;
      }

      // Build travel packages from real flight data
      const packages = flights.map((flight: any, index: number) => {
        // Use the flight price as returned by the API (already accounts for travelers)
        const flightPrice = flight.total || 0;

        // Calculate total travelers for display purposes
        const totalTravelers = payload.travelers.adults + payload.travelers.seniors + payload.travelers.children;

        // Calculate nights
        const start = new Date(payload.startDate);
        const end = new Date(payload.endDate);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        // Estimated additional costs (these would be replaced by real API calls later)
        // For now, just rough estimates for display - real pricing will come from booking APIs
        const hotelPrice = payload.includeHotel ? 150 * nights : 0;
        const carPrice = payload.includeCar ? 50 * nights : 0;

        const totalPrice = flightPrice + hotelPrice + carPrice;

        // Hotel names
        const hotelNames = [
          'Marriott Downtown', 'Hilton City Center', 'Hyatt Regency',
          'Sheraton Plaza', 'InterContinental', 'Westin Grand',
          'DoubleTree Suites', 'Courtyard by Marriott'
        ];

        // Car vendors
        const carVendors = ['Hertz', 'Enterprise', 'Avis', 'Budget', 'National', 'Alamo'];

        // Extract real flight information from centralized Amadeus client
        const realFlightData = extractRealFlightData(flight);
        const carrierCode = flight.carrier;
        const airlineInfo = airlineMap[carrierCode] || { name: `${carrierCode} Airways`, quality: 'standard' };

        return {
          id: `pkg_${flight.raw?.id || index}`,
          summary: `${getAirportName(payload.origin)} → ${getAirportName(payload.destination)}, ${payload.startDate}–${payload.endDate} • ${totalTravelers} traveler${totalTravelers !== 1 ? 's' : ''}${payload.includeHotel ? ', Hotel' : ''}${payload.includeCar ? ', Car' : ''}`,
          total: Math.round(totalPrice * 100) / 100,
          components: {
            flight: {
              carrier: carrierCode,
              carrierName: airlineInfo.name,
              flightNumber: realFlightData.flightNumber,
              departureTime: realFlightData.departureTime,
              arrivalTime: realFlightData.arrivalTime,
              duration: realFlightData.duration,
              stops: realFlightData.stops,
              aircraft: realFlightData.aircraft,
              segments: realFlightData.segments,
            },
            hotel: payload.includeHotel ? {
              name: hotelNames[index % hotelNames.length],
            } : undefined,
            car: payload.includeCar ? {
              vendor: carVendors[index % carVendors.length],
            } : undefined,
          },
        };
      });

      setResults(packages);

      // Fetch activities if requested (don't block main results)
      if (payload.includeActivities && flights.length > 0) {
        console.log('🎯 Fetching activities for:', getCityFromIATA(normalizedDestination));
        try {
          const activitiesRes = await fetch(apiPath('/api/providers/viator/search'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destination: getCityFromIATA(normalizedDestination),
              startDate: payload.startDate,
              endDate: payload.endDate,
              limit: 3,
            }),
          });

          if (activitiesRes.ok) {
            const activitiesData = await activitiesRes.json();
            console.log('✅ Activities received:', activitiesData.activities?.length || 0);
            setActivities(activitiesData.activities || []);

            if (activitiesData.message) {
              console.log('ℹ️ Viator message:', activitiesData.message);
            }
          } else {
            console.error('❌ Activities API error:', activitiesRes.status);
            setActivities([]);
          }
        } catch (activityError) {
          console.error('❌ Failed to fetch activities:', activityError);
          setActivities([]);
        }
      } else {
        console.log('ℹ️ Activities not requested or no flights found');
        setActivities([]);
      }
    } catch (e: unknown) {
      // Provide user-friendly error messages for network and other errors
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Connect Timeout')) {
        setError('Connection timeout to flight search service. Please check your internet connection and try again.');
      } else if (errorMessage.includes('502') || errorMessage.includes('503')) {
        setError('Flight search service temporarily unavailable. Please refresh and try again.');
      } else if (errorMessage.includes('AMADEUS_API_KEY') || errorMessage.includes('Authentication failed')) {
        setError('Flight search service configuration issue. Please contact support.');
      } else {
        setError('Unable to search flights. Please try again.');
      }
      console.error('Search error:', e);

      // No fallback results - only show real Amadeus data
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen travel-background">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 lg:py-10">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-black/20 backdrop-blur-md rounded-full shadow-2xl border border-emerald-400/30 mb-4">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-200 tracking-wide uppercase">Live Search • Best Prices</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-light bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent mb-3 leading-tight tracking-wide">
            Find Your Perfect Trip
          </h2>
          <p className="text-base text-emerald-300/90 max-w-xl mx-auto font-light leading-relaxed">
            Search flights, compare prices, and track deals all in one place.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-6xl mx-auto mb-8">
          <form onSubmit={onSubmit} className="travel-card overflow-hidden">
            <div className="p-6 lg:p-8 space-y-5">
              {/* Location Inputs with Autocomplete */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="travel-label">
                    Departure
                  </label>
                  <AirportAutocomplete
                    name="origin_display"
                    placeholder="Dallas, Los Angeles, New York..."
                    required
                    value={originIATA}
                    onChange={(iata, display) => {
                      console.log('Origin selected:', iata, display);
                      setOriginIATA(iata);
                    }}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />
                  {/* Hidden input for actual IATA code */}
                  <input type="hidden" name="origin" value={originIATA} />
                </div>

                <div className="space-y-1.5">
                  <label className="travel-label">
                    Destination
                  </label>
                  <AirportAutocomplete
                    name="destination_display"
                    placeholder="Rome, Paris, Tokyo..."
                    required
                    value={destinationIATA}
                    onChange={(iata, display) => {
                      console.log('Destination selected:', iata, display);
                      setDestinationIATA(iata);
                    }}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />
                  {/* Hidden input for actual IATA code */}
                  <input type="hidden" name="destination" value={destinationIATA} />

                  {/* Destination Research Link */}
                  {destinationIATA && (
                    <div className="mt-2">
                      <Link
                        href={`/destinations/${getDestinationSlug(destinationIATA)}?from=${originIATA}&airportCode=${destinationIATA}`}
                        className="inline-flex items-center text-sm text-cyan-600 hover:text-teal-700 font-medium transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Research this destination
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-emerald-300 uppercase tracking-wider">
                    Departure Date
                  </label>
                  <div
                    className="relative cursor-text"
                    onClick={(e) => {
                      const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
                      if (input) {
                        if (input.showPicker) {
                          input.showPicker();
                        } else {
                          input.focus();
                        }
                      }
                    }}
                  >
                    <input
                      type="date"
                      name="startDate"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        // If end date is before or equal to new start date, clear it
                        if (endDate && new Date(endDate) <= new Date(e.target.value)) {
                          setEndDate('');
                        }
                      }}
                      min={today}
                      className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200 rounded-xl text-teal-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-emerald-300 uppercase tracking-wider">
                    Return Date
                  </label>
                  <div
                    className={`relative ${!startDate ? 'cursor-not-allowed' : 'cursor-text'}`}
                    onClick={(e) => {
                      if (!startDate) return;
                      const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
                      if (input && !input.disabled) {
                        if (input.showPicker) {
                          input.showPicker();
                        } else {
                          input.focus();
                        }
                      }
                    }}
                  >
                    <input
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={minEndDate}
                      disabled={!startDate}
                      className={`w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200 rounded-xl text-teal-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${!startDate ? 'disabled:opacity-50 disabled:cursor-not-allowed' : 'cursor-pointer'}`}
                      required
                    />
                  </div>
                  {!startDate && (
                    <p className="text-xs text-slate-500 mt-1">Select departure date first</p>
                  )}
                </div>
              </div>

              {/* Options Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-emerald-300 uppercase tracking-wider">
                    Date Flexibility
                  </label>
                  <select
                    name="flexibilityDays"
                    defaultValue={0}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={0}>Exact dates</option>
                    <option value={1}>± 1 day</option>
                    <option value={2}>± 2 days</option>
                    <option value={3}>± 3 days</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-emerald-300 uppercase tracking-wider">
                    Budget Range
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-medium">
                      $
                    </div>
                    <input
                      type="number"
                      name="budgetUsd"
                      placeholder="2000"
                      className="w-full pl-8 pr-4 py-2.5 bg-black/20 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-300/60 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-all backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Travelers */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-emerald-300 uppercase tracking-wider">
                  Travelers
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Adults (18-59)
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center py-3 font-semibold text-slate-900">
                        {adults}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.min(9, adults + 1))}
                        className="px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Seniors (60+)
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSeniors(Math.max(0, seniors - 1))}
                        className="px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center py-3 font-semibold text-slate-900">
                        {seniors}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSeniors(Math.min(9, seniors + 1))}
                        className="px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Children (0-17)
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center py-3 font-semibold text-slate-900">
                        {children}
                      </div>
                      <button
                        type="button"
                        onClick={() => setChildren(Math.min(9, children + 1))}
                        className="px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Total travelers: {adults + seniors + children} • Age information helps find the best rates
                </p>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Include in search
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="relative flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group">
                    <input
                      type="checkbox"
                      name="includeHotel"
                      checked={includeHotel}
                      onChange={(e) => setIncludeHotel(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏨</span>
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">Hotels</span>
                    </div>
                  </label>

                  <label className="relative flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group">
                    <input
                      type="checkbox"
                      name="includeCar"
                      checked={includeCar}
                      onChange={(e) => setIncludeCar(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚗</span>
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">Car Rental</span>
                    </div>
                  </label>

                  <label className="relative flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group">
                    <input
                      type="checkbox"
                      name="includeActivities"
                      checked={includeActivities}
                      onChange={(e) => setIncludeActivities(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">Activities</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-medium py-3 px-6 rounded-lg shadow-2xl hover:shadow-emerald-500/25 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border border-emerald-400/20 backdrop-blur-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                    <span className="font-medium tracking-wide">Searching flights...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-medium tracking-wide">Search Flights</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRouteWatchModalOpen(true)}
                disabled={!originIATA || !destinationIATA || !startDate || !endDate}
                className="w-full bg-black/30 border border-amber-400/40 text-amber-200 font-medium py-2.5 px-6 rounded-lg shadow-xl hover:shadow-amber-500/20 hover:bg-black/40 hover:border-amber-400/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-medium tracking-wide">Watch Prices</span>
              </button>

              {(!originIATA || !destinationIATA || !startDate || !endDate) && (
                <p className="text-xs text-slate-500 text-center">
                  Fill in destinations and dates to enable route watching
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div ref={resultsRef} className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900">Search Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Section */}
        {loading && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-2xl p-8 mx-4 max-w-md w-full text-center border border-emerald-500/20">
              {/* Large Spinning Animation */}
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-400 border-t-transparent mx-auto"></div>
              </div>

              {/* Main Message */}
              <h3 className="text-lg font-light text-white mb-2 tracking-wide">Searching flights...</h3>
              <p className="text-emerald-200/80 mb-6 font-light text-sm">Comparing prices across multiple airlines and booking sites</p>

              {/* Simple Progress Indicators */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-cyan-800">Checking flights</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-800">Finding hotels</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-violet-800">Getting activities</span>
                  </div>
                </div>
              </div>

              {/* Time Expectation */}
              <p className="text-xs text-slate-400 mt-4">This usually takes 10-30 seconds</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div ref={resultsRef} className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {getFilteredResults().length} of {results.length} Package{results.length !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-sm text-slate-500 mt-1">Sorted by {sortBy === 'price' ? 'best value' : sortBy === 'duration' ? 'shortest flight' : 'earliest departure'}</p>
              </div>
            </div>

            {/* Filter Controls */}
            {results.length > 1 && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Airlines Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Airlines ({getAvailableAirlines().length} available)
                    </label>
                    {getAvailableAirlines().length < 3 && (
                      <p className="text-xs text-slate-500 mb-2">
                        Limited airlines available for this route and date. Try different dates for more options.
                      </p>
                    )}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getAvailableAirlines().map(airline => {
                        const airlineInfo = airlineMap[airline] || { name: `${airline} Airways` };
                        return (
                          <label key={airline} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedAirlines.includes(airline)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAirlines([...selectedAirlines, airline]);
                                } else {
                                  setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600"
                            />
                            <span className="text-slate-700">{airlineInfo.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ml-2 ${airlineInfo.quality === 'premium' ? 'bg-green-100 text-green-700' :
                              airlineInfo.quality === 'budget' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                              {airlineInfo.quality}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Departure Time</label>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="all">All Times</option>
                      <option value="morning">Morning (6 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                      <option value="evening">Evening (6 PM - 6 AM)</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="price">Best Price</option>
                      <option value="duration">Shortest Flight</option>
                      <option value="departure">Earliest Departure</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedAirlines.length > 0 || timeFilter !== 'all') && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setSelectedAirlines([]);
                        setTimeFilter('all');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {getFilteredResults().map((r, index) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1">{r.summary}</h4>
                          <p className="text-sm text-slate-500">Complete travel package</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          ${r.total.toFixed(0)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Total price</p>
                      </div>
                    </div>

                    {/* Components Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      {r.components.flight && (
                        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-lg p-4 col-span-full sm:col-span-3">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl mt-1">✈️</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-bold text-teal-800 text-base">{r.components.flight.carrierName}</p>
                                  <p className="text-xs text-cyan-600">Flight {r.components.flight.flightNumber} • {r.components.flight.aircraft}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-teal-800">{r.components.flight.duration}</p>
                                  <p className="text-xs text-cyan-600">
                                    {formatStopsInfo(r.components.flight.stops, r.components.flight.segments)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-teal-700">{r.components.flight.departureTime}</span>
                                  <span className="text-cyan-600">→</span>
                                  <span className="font-medium text-teal-700">{r.components.flight.arrivalTime}</span>
                                </div>
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                  onClick={() => {
                                    // Future: Show detailed flight information modal
                                    if (r.components.flight) {
                                      const flight = r.components.flight;
                                      let stopDetails = '';
                                      if (flight.stops > 0 && flight.segments && flight.segments.length > 1) {
                                        const stopCities = flight.segments.slice(0, -1).map(seg => seg.arrival?.iataCode).filter(Boolean);
                                        stopDetails = stopCities.length > 0 ? `\nStops in: ${stopCities.join(', ')}` : '';
                                      }
                                      alert(`Flight Details:\n\nAirline: ${flight.carrierName}\nFlight: ${flight.flightNumber}\nAircraft: ${flight.aircraft}\nDeparture: ${flight.departureTime}\nArrival: ${flight.arrivalTime}\nDuration: ${flight.duration}\nStops: ${flight.stops}${stopDetails}`);
                                    }
                                  }}
                                >
                                  Flight details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {r.components.hotel && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                          <span className="text-2xl">🏨</span>
                          <div>
                            <p className="font-semibold text-purple-900 text-sm">{r.components.hotel.name}</p>
                            <p className="text-xs text-purple-600">Accommodation</p>
                          </div>
                        </div>
                      )}
                      {r.components.car && (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                          <span className="text-2xl">🚗</span>
                          <div>
                            <p className="font-semibold text-orange-900 text-sm">{r.components.car.vendor}</p>
                            <p className="text-xs text-orange-600">Rental car</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {r.components.hotel && searchParams && (() => {
                        try {
                          const destinationIATA = searchParams.destination;

                          // Validate destination IATA code
                          if (!destinationIATA || destinationIATA.trim().length === 0) {
                            console.error('❌ Booking.com error: destination IATA is empty');
                            return null;
                          }

                          const cityName = getCityFromIATA(destinationIATA);

                          // Additional validation - ensure city name is not empty and not an IATA code
                          if (!cityName || cityName.trim().length === 0) {
                            console.error(`❌ Booking.com error: No city mapping found for IATA code "${destinationIATA}". Please add this airport to IATA_TO_CITY mapping in /app/src/lib/iataCity.ts`);
                            console.error(`ℹ️ You can still view flights, but hotel search is unavailable for this destination.`);
                            return (
                              <div className="flex-1 bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed opacity-60 flex items-center justify-center gap-2" title={`Hotel search unavailable: "${destinationIATA}" not mapped to a city name`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Hotels Unavailable</span>
                              </div>
                            );
                          }

                          const bookingUrl = bookingCityDeeplink(cityName, searchParams.startDate, searchParams.endDate);

                          // Debug logging - only log for first result to avoid spam
                          if (index === 0) {
                            console.log('🏨 Booking.com Generated:', {
                              destinationIATA,
                              cityName,
                              checkin: searchParams.startDate,
                              checkout: searchParams.endDate,
                              url: bookingUrl,
                              ssParam: new URLSearchParams(bookingUrl.split('?')[1]).get('ss')
                            });
                          }

                          return (
                            <a
                              href={bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                              title={`Search hotels in ${cityName}`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <span>View Stays in {cityName}</span>
                            </a>
                          );
                        } catch (error) {
                          console.error('❌ Error generating Booking.com URL:', error);
                          return null;
                        }
                      })()}
                      <button
                        onClick={() => {
                          if (!searchParams) return;

                          // Generate booking URL with flight details
                          const bookingParams = new URLSearchParams({
                            o: searchParams.origin,
                            d: searchParams.destination,
                            ds: searchParams.startDate,
                            p: r.total.toString(),
                            c: 'USD', // Default currency
                            car: r.components.flight?.carrier || 'XX',
                            so: r.components.flight?.stops?.toString() || '0',
                            adults: (adults + seniors).toString() // Total adult passengers
                          });

                          if (searchParams.endDate) {
                            bookingParams.set('rs', searchParams.endDate);
                          }

                          // Add flight segments if available
                          if (r.components.flight?.segments) {
                            const segmentDetails = r.components.flight.segments.map((seg: any) =>
                              `${seg.departure?.iataCode || ''} → ${seg.arrival?.iataCode || ''} (${r.components.flight?.carrier})`
                            ).join('\n');
                            bookingParams.set('seg', encodeURIComponent(segmentDetails));
                          }

                          // Navigate to booking page
                          window.location.href = `/book?${bookingParams.toString()}`;
                        }}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-teal-700 hover:cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Book Flight</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFlightForWatch(r);
                          setPriceWatchModalOpen(true);
                        }}
                        className="flex-1 bg-white border-2 border-cyan-200 text-teal-700 font-semibold py-3 px-6 rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span>Watch Price</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Activities Section */}
        {searchParams?.includeActivities && results.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Things to Do in {getCityFromIATA(searchParams.destination)}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Top-rated activities and tours</p>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-slate-600">Loading activities...</p>
              </div>
            ) : null}
          </div>
        )}

        {activities.length > 0 && results.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Things to Do in {searchParams?.destination}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Top-rated activities and tours</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  {activity.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {activity.rating > 0 && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-sm font-semibold text-slate-900">{activity.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2">
                      {activity.title}
                    </h4>

                    {activity.reviewCount > 0 && (
                      <p className="text-xs text-slate-500 mb-3">
                        {activity.reviewCount.toLocaleString()} reviews
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-slate-500">From</p>
                        <p className="text-lg font-bold text-green-600">
                          ${activity.fromPrice.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <a
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>Book on Viator</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-emerald-400/30">
              <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-white mb-2 tracking-wide">Ready to Discover</h3>
            <p className="text-emerald-200/80 font-light">Enter your travel details above to find the best flights and deals.</p>
          </div>
        )}
      </main>

      {/* Route Watch Modal */}
      {routeWatchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 mx-4 max-w-md w-full border border-emerald-500/30">
            <h3 className="text-lg font-light text-white mb-4 tracking-wide">Watch This Route</h3>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{getAirportName(originIATA)} → {getAirportName(destinationIATA)}</strong>
              </p>
              <p className="text-xs text-blue-600">
                {originIATA} → {destinationIATA} • {startDate} to {endDate} • {adults + seniors} adults
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Price (USD) *
                </label>
                <input
                  type="number"
                  value={watchTargetUsd}
                  onChange={(e) => setWatchTargetUsd(e.target.value)}
                  placeholder="e.g., 300"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="50"
                  max="10000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email for Notifications *
                </label>
                <input
                  type="email"
                  value={watchEmail}
                  onChange={(e) => setWatchEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  We'll send price alerts to this email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cabin Class
                </label>
                <select
                  value={watchCabin}
                  onChange={(e) => setWatchCabin(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Max Stops
                  </label>
                  <select
                    value={watchMaxStops}
                    onChange={(e) => setWatchMaxStops(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Nonstop only</option>
                    <option value={1}>Up to 1 stop</option>
                    <option value={2}>Up to 2 stops</option>
                    <option value={3}>Up to 3 stops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Flexibility
                  </label>
                  <select
                    value={watchFlexDays}
                    onChange={(e) => setWatchFlexDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Exact dates</option>
                    <option value={1}>±1 day</option>
                    <option value={2}>±2 days</option>
                    <option value={3}>±3 days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRouteWatchModalOpen(false)}
                disabled={watchCreating}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createRouteWatch}
                disabled={watchCreating || !watchTargetUsd}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {watchCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Watch</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Watch Modal */}
      {selectedFlightForWatch && (
        <PriceWatchModal
          isOpen={priceWatchModalOpen}
          onClose={() => {
            setPriceWatchModalOpen(false);
            setSelectedFlightForWatch(null);
          }}
          flightInfo={{
            origin: originIATA,
            destination: destinationIATA,
            departureDate: startDate,
            returnDate: endDate,
            adults: adults,
            children: children,
            seniors: seniors,
            currentPrice: selectedFlightForWatch.total,
            airline: selectedFlightForWatch.components.flight?.carrierName || 'Unknown',
            route: `${getCityFromIATA(originIATA)} → ${getCityFromIATA(destinationIATA)}`,
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-cyan-200 mt-16 bg-gradient-to-r from-cyan-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-teal-600">
            © 2025 Travel Conductor ✈️ Find your perfect adventure.
          </p>
        </div>
      </footer>
    </div>
  );
}

function HomeWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>}>
      <Home />
    </Suspense>
  );
}

export default HomeWrapper;
