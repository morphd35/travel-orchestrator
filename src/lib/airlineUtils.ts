// Airline and airport code utilities for user-friendly display

/**
 * Mapping of airline codes to full airline names
 */
export const AIRLINE_NAMES: Record<string, string> = {
    // Major US Carriers
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'WN': 'Southwest Airlines',
    'NK': 'Spirit Airlines',
    'F9': 'Frontier Airlines',
    'B6': 'JetBlue Airways',
    'AS': 'Alaska Airlines',
    'HA': 'Hawaiian Airlines',
    'G4': 'Allegiant Air',
    'SY': 'Sun Country Airlines',

    // International Carriers
    'AC': 'Air Canada',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM Royal Dutch Airlines',
    'LX': 'Swiss International Air Lines',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'AY': 'Finnair',
    'SK': 'SAS Scandinavian Airlines',
    'IB': 'Iberia',
    'TP': 'TAP Air Portugal',
    'AZ': 'ITA Airways',
    'EI': 'Aer Lingus',
    'VS': 'Virgin Atlantic',
    'TK': 'Turkish Airlines',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'EY': 'Etihad Airways',
    'SV': 'Saudia',
    'MS': 'EgyptAir',
    'ET': 'Ethiopian Airlines',
    'KQ': 'Kenya Airways',
    'SA': 'South African Airways',
    'SQ': 'Singapore Airlines',
    'TG': 'Thai Airways',
    'CX': 'Cathay Pacific',
    'JL': 'Japan Airlines',
    'NH': 'ANA All Nippon Airways',
    'KE': 'Korean Air',
    'OZ': 'Asiana Airlines',
    'AI': 'Air India',
    '6E': 'IndiGo',
    'QF': 'Qantas',
    'JQ': 'Jetstar Airways',
    'VA': 'Virgin Australia',
    'NZ': 'Air New Zealand',
    'LA': 'LATAM Airlines',
    'AM': 'Aeroméxico',
    'AR': 'Aerolíneas Argentinas',
    'AV': 'Avianca',
    'CM': 'Copa Airlines',

    // Low-cost carriers
    'FR': 'Ryanair',
    'U2': 'easyJet',
    'VY': 'Vueling',
    'W6': 'Wizz Air',
    'PC': 'Pegasus Airlines',
    'XQ': 'SunExpress',
    '3O': 'Air Arabia Maroc',
    'AT': 'Royal Air Maroc',
    'WF': 'Widerøe',

    // Cargo/Charter (less common for passenger)
    'FX': 'FedEx Express',
    'UPS': 'UPS Airlines',
    '5X': 'UPS Airlines',
};

/**
 * Mapping of airport codes to city names and countries
 */
export const AIRPORT_NAMES: Record<string, { city: string; country: string; name?: string }> = {
    // Major US Airports
    'JFK': { city: 'New York', country: 'USA', name: 'John F. Kennedy International Airport' },
    'LGA': { city: 'New York', country: 'USA', name: 'LaGuardia Airport' },
    'EWR': { city: 'New York/Newark', country: 'USA', name: 'Newark Liberty International Airport' },
    'LAX': { city: 'Los Angeles', country: 'USA', name: 'Los Angeles International Airport' },
    'ORD': { city: 'Chicago', country: 'USA', name: "O'Hare International Airport" },
    'MDW': { city: 'Chicago', country: 'USA', name: 'Midway International Airport' },
    'DFW': { city: 'Dallas', country: 'USA', name: 'Dallas/Fort Worth International Airport' },
    'DAL': { city: 'Dallas', country: 'USA', name: 'Dallas Love Field' },
    'IAH': { city: 'Houston', country: 'USA', name: 'George Bush Intercontinental Airport' },
    'HOU': { city: 'Houston', country: 'USA', name: 'William P. Hobby Airport' },
    'MIA': { city: 'Miami', country: 'USA', name: 'Miami International Airport' },
    'FLL': { city: 'Fort Lauderdale', country: 'USA', name: 'Fort Lauderdale-Hollywood International Airport' },
    'MCO': { city: 'Orlando', country: 'USA', name: 'Orlando International Airport' },
    'LAS': { city: 'Las Vegas', country: 'USA', name: 'Harry Reid International Airport' },
    'PHX': { city: 'Phoenix', country: 'USA', name: 'Phoenix Sky Harbor International Airport' },
    'DEN': { city: 'Denver', country: 'USA', name: 'Denver International Airport' },
    'SEA': { city: 'Seattle', country: 'USA', name: 'Seattle-Tacoma International Airport' },
    'SFO': { city: 'San Francisco', country: 'USA', name: 'San Francisco International Airport' },
    'SJC': { city: 'San Jose', country: 'USA', name: 'Norman Y. Mineta San José International Airport' },
    'OAK': { city: 'Oakland', country: 'USA', name: 'Oakland International Airport' },
    'BOS': { city: 'Boston', country: 'USA', name: 'Logan International Airport' },
    'BWI': { city: 'Baltimore', country: 'USA', name: 'Baltimore/Washington International Airport' },
    'DCA': { city: 'Washington, D.C.', country: 'USA', name: 'Ronald Reagan Washington National Airport' },
    'IAD': { city: 'Washington, D.C.', country: 'USA', name: 'Washington Dulles International Airport' },
    'ATL': { city: 'Atlanta', country: 'USA', name: 'Hartsfield-Jackson Atlanta International Airport' },
    'MSP': { city: 'Minneapolis', country: 'USA', name: 'Minneapolis-Saint Paul International Airport' },
    'DTW': { city: 'Detroit', country: 'USA', name: 'Detroit Metropolitan Wayne County Airport' },
    'PHL': { city: 'Philadelphia', country: 'USA', name: 'Philadelphia International Airport' },
    'CLT': { city: 'Charlotte', country: 'USA', name: 'Charlotte Douglas International Airport' },
    'TPA': { city: 'Tampa', country: 'USA', name: 'Tampa International Airport' },
    'SAN': { city: 'San Diego', country: 'USA', name: 'San Diego International Airport' },
    'STL': { city: 'St. Louis', country: 'USA', name: 'Lambert-St. Louis International Airport' },
    'MEM': { city: 'Memphis', country: 'USA', name: 'Memphis International Airport' },
    'BNA': { city: 'Nashville', country: 'USA', name: 'Nashville International Airport' },
    'AUS': { city: 'Austin', country: 'USA', name: 'Austin-Bergstrom International Airport' },
    'SAT': { city: 'San Antonio', country: 'USA', name: 'San Antonio International Airport' },
    'MSY': { city: 'New Orleans', country: 'USA', name: 'Louis Armstrong New Orleans International Airport' },
    'RDU': { city: 'Raleigh-Durham', country: 'USA', name: 'Raleigh-Durham International Airport' },
    'CVG': { city: 'Cincinnati', country: 'USA', name: 'Cincinnati/Northern Kentucky International Airport' },
    'CMH': { city: 'Columbus', country: 'USA', name: 'John Glenn Columbus International Airport' },
    'IND': { city: 'Indianapolis', country: 'USA', name: 'Indianapolis International Airport' },
    'MKE': { city: 'Milwaukee', country: 'USA', name: 'Milwaukee Mitchell International Airport' },
    'CLE': { city: 'Cleveland', country: 'USA', name: 'Cleveland Hopkins International Airport' },
    'PIT': { city: 'Pittsburgh', country: 'USA', name: 'Pittsburgh International Airport' },
    'JAX': { city: 'Jacksonville', country: 'USA', name: 'Jacksonville International Airport' },
    'RSW': { city: 'Fort Myers', country: 'USA', name: 'Southwest Florida International Airport' },
    'PBI': { city: 'West Palm Beach', country: 'USA', name: 'Palm Beach International Airport' },
    'HNL': { city: 'Honolulu', country: 'USA', name: 'Honolulu International Airport' },
    'ANC': { city: 'Anchorage', country: 'USA', name: 'Ted Stevens Anchorage International Airport' },

    // Canadian Airports  
    'YYZ': { city: 'Toronto', country: 'Canada', name: 'Pearson International Airport' },
    'YVR': { city: 'Vancouver', country: 'Canada', name: 'Vancouver International Airport' },
    'YUL': { city: 'Montreal', country: 'Canada', name: 'Montréal-Trudeau International Airport' },
    'YYC': { city: 'Calgary', country: 'Canada', name: 'Calgary International Airport' },
    'YEG': { city: 'Edmonton', country: 'Canada', name: 'Edmonton International Airport' },
    'YOW': { city: 'Ottawa', country: 'Canada', name: 'Macdonald-Cartier International Airport' },
    'YHZ': { city: 'Halifax', country: 'Canada', name: 'Halifax Stanfield International Airport' },
    'YWG': { city: 'Winnipeg', country: 'Canada', name: 'Winnipeg Richardson International Airport' },

    // European Airports
    'LHR': { city: 'London', country: 'UK', name: 'Heathrow Airport' },
    'LGW': { city: 'London', country: 'UK', name: 'Gatwick Airport' },
    'STN': { city: 'London', country: 'UK', name: 'Stansted Airport' },
    'LTN': { city: 'London', country: 'UK', name: 'Luton Airport' },
    'CDG': { city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
    'ORY': { city: 'Paris', country: 'France', name: 'Orly Airport' },
    'FRA': { city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
    'MUC': { city: 'Munich', country: 'Germany', name: 'Munich Airport' },
    'AMS': { city: 'Amsterdam', country: 'Netherlands', name: 'Schiphol Airport' },
    'ZUR': { city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
    'VIE': { city: 'Vienna', country: 'Austria', name: 'Vienna International Airport' },
    'BRU': { city: 'Brussels', country: 'Belgium', name: 'Brussels Airport' },
    'HEL': { city: 'Helsinki', country: 'Finland', name: 'Helsinki-Vantaa Airport' },
    'ARN': { city: 'Stockholm', country: 'Sweden', name: 'Arlanda Airport' },
    'CPH': { city: 'Copenhagen', country: 'Denmark', name: 'Copenhagen Airport' },
    'OSL': { city: 'Oslo', country: 'Norway', name: 'Oslo Airport' },
    'MAD': { city: 'Madrid', country: 'Spain', name: 'Adolfo Suárez Madrid-Barajas Airport' },
    'BCN': { city: 'Barcelona', country: 'Spain', name: 'Barcelona-El Prat Airport' },
    'LIS': { city: 'Lisbon', country: 'Portugal', name: 'Humberto Delgado Airport' },
    'FCO': { city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci-Fiumicino Airport' },
    'MXP': { city: 'Milan', country: 'Italy', name: 'Malpensa Airport' },
    'DUB': { city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' },
    'IST': { city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
    'SAW': { city: 'Istanbul', country: 'Turkey', name: 'Sabiha Gökçen Airport' },

    // Middle East & Africa
    'DXB': { city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
    'DOH': { city: 'Doha', country: 'Qatar', name: 'Hamad International Airport' },
    'AUH': { city: 'Abu Dhabi', country: 'UAE', name: 'Abu Dhabi International Airport' },
    'RUH': { city: 'Riyadh', country: 'Saudi Arabia', name: 'King Khalid International Airport' },
    'JED': { city: 'Jeddah', country: 'Saudi Arabia', name: 'King Abdulaziz International Airport' },
    'CAI': { city: 'Cairo', country: 'Egypt', name: 'Cairo International Airport' },
    'ADD': { city: 'Addis Ababa', country: 'Ethiopia', name: 'Bole International Airport' },
    'NBO': { city: 'Nairobi', country: 'Kenya', name: 'Jomo Kenyatta International Airport' },
    'JNB': { city: 'Johannesburg', country: 'South Africa', name: 'O.R. Tambo International Airport' },
    'CPT': { city: 'Cape Town', country: 'South Africa', name: 'Cape Town International Airport' },

    // Asia Pacific
    'SIN': { city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
    'BKK': { city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
    'HKG': { city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International Airport' },
    'NRT': { city: 'Tokyo', country: 'Japan', name: 'Narita International Airport' },
    'HND': { city: 'Tokyo', country: 'Japan', name: 'Haneda Airport' },
    'ICN': { city: 'Seoul', country: 'South Korea', name: 'Incheon International Airport' },
    'GMP': { city: 'Seoul', country: 'South Korea', name: 'Gimpo Airport' },
    'DEL': { city: 'New Delhi', country: 'India', name: 'Indira Gandhi International Airport' },
    'BOM': { city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj International Airport' },
    'SYD': { city: 'Sydney', country: 'Australia', name: 'Kingsford Smith Airport' },
    'MEL': { city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport' },
    'AKL': { city: 'Auckland', country: 'New Zealand', name: 'Auckland Airport' },

    // Latin America
    'GRU': { city: 'São Paulo', country: 'Brazil', name: 'Guarulhos International Airport' },
    'GIG': { city: 'Rio de Janeiro', country: 'Brazil', name: 'Galeão International Airport' },
    'EZE': { city: 'Buenos Aires', country: 'Argentina', name: 'Ezeiza International Airport' },
    'SCL': { city: 'Santiago', country: 'Chile', name: 'Arturo Merino Benítez International Airport' },
    'BOG': { city: 'Bogotá', country: 'Colombia', name: 'El Dorado International Airport' },
    'LIM': { city: 'Lima', country: 'Peru', name: 'Jorge Chávez International Airport' },
    'MEX': { city: 'Mexico City', country: 'Mexico', name: 'Mexico City International Airport' },
    'CUN': { city: 'Cancún', country: 'Mexico', name: 'Cancún International Airport' },
    'PTY': { city: 'Panama City', country: 'Panama', name: 'Tocumen International Airport' },
};

/**
 * Get user-friendly airline name from code
 */
export function getAirlineName(code: string): string {
    if (!code) return 'Unknown Airline';
    const name = AIRLINE_NAMES[code.toUpperCase()];
    return name || `${code} Airlines`;
}

/**
 * Get user-friendly airport/city name from code
 */
export function getAirportName(code: string): string {
    if (!code) return 'Unknown Airport';
    const airport = AIRPORT_NAMES[code.toUpperCase()];
    if (airport) {
        return `${airport.city}, ${airport.country}`;
    }
    return code; // Fall back to showing the code if not found
}

/**
 * Get detailed airport information
 */
export function getAirportDetails(code: string): {
    code: string;
    city: string;
    country: string;
    name: string;
    display: string
} {
    if (!code) {
        return {
            code: '',
            city: 'Unknown',
            country: '',
            name: 'Unknown Airport',
            display: 'Unknown'
        };
    }

    const upperCode = code.toUpperCase();
    const airport = AIRPORT_NAMES[upperCode];

    if (airport) {
        return {
            code: upperCode,
            city: airport.city,
            country: airport.country,
            name: airport.name || `${airport.city} Airport`,
            display: `${airport.city}, ${airport.country}`
        };
    }

    return {
        code: upperCode,
        city: upperCode,
        country: '',
        name: `${upperCode} Airport`,
        display: upperCode
    };
}

/**
 * Format stops information for user display
 */
export function formatStopsInfo(stops: number, segments?: any[]): string {
    if (stops === 0) {
        return 'Direct flight';
    } else if (stops === 1) {
        if (segments && segments.length > 1) {
            const stopAirport = segments[0]?.arrival?.iataCode || segments[1]?.departure?.iataCode;
            if (stopAirport) {
                const stopCity = getAirportName(stopAirport);
                return `1 stop in ${stopCity}`;
            }
        }
        return '1 stop';
    } else {
        if (segments && segments.length > 2) {
            const stopCities = segments.slice(0, -1).map((segment: any) => {
                const stopAirport = segment.arrival?.iataCode;
                return stopAirport ? getAirportName(stopAirport) : null;
            }).filter(Boolean);

            if (stopCities.length > 0) {
                if (stopCities.length === 2) {
                    return `2 stops in ${stopCities.join(' and ')}`;
                } else {
                    return `${stops} stops via ${stopCities.slice(0, 2).join(', ')}${stopCities.length > 2 ? ` and ${stopCities.length - 2} more` : ''}`;
                }
            }
        }
        return `${stops} stops`;
    }
}

/**
 * Get detailed flight routing information for email display
 */
export function getFlightRouting(segments?: any[]): string {
    if (!segments || segments.length <= 1) {
        return '';
    }

    const stops = segments.slice(0, -1).map((segment: any) => {
        const stopCode = segment.arrival?.iataCode;
        const stopCity = stopCode ? getAirportName(stopCode) : 'Unknown';
        const layoverDuration = getLayoverDuration(segment, segments[segments.indexOf(segment) + 1]);

        return `${stopCity} (${stopCode})${layoverDuration ? ` - ${layoverDuration} layover` : ''}`;
    });

    return stops.join('\n   → ');
}

/**
 * Calculate layover duration between segments
 */
function getLayoverDuration(currentSegment: any, nextSegment: any): string {
    if (!currentSegment?.arrival?.at || !nextSegment?.departure?.at) {
        return '';
    }

    try {
        const arrivalTime = new Date(currentSegment.arrival.at);
        const departureTime = new Date(nextSegment.departure.at);
        const layoverMs = departureTime.getTime() - arrivalTime.getTime();
        const layoverHours = Math.floor(layoverMs / (1000 * 60 * 60));
        const layoverMinutes = Math.floor((layoverMs % (1000 * 60 * 60)) / (1000 * 60));

        if (layoverHours > 0) {
            return layoverMinutes > 0 ? `${layoverHours}h ${layoverMinutes}m` : `${layoverHours}h`;
        } else if (layoverMinutes > 0) {
            return `${layoverMinutes}m`;
        }
    } catch (error) {
        // Ignore date parsing errors
    }

    return '';
}

/**
 * Format flight duration
 */
export function formatDuration(duration: string): string {
    if (!duration) return '';

    // Parse ISO 8601 duration (PT2H30M)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');

        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        }
    }

    return duration;
}

/**
 * Format time for display (HH:MM format)
 */
export function formatTime(isoString: string): string {
    if (!isoString) return '';

    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return isoString;
    }
}

/**
 * Format date for display  
 */
export function formatDate(isoString: string): string {
    if (!isoString) return '';

    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return isoString;
    }
}
