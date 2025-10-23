/**
 * Map IATA airport codes to city names for Booking.com searches
 */
export const IATA_TO_CITY: Record<string, string> = {
  // United States - Major Cities
  'LAX': 'Los Angeles',
  'JFK': 'New York',
  'LGA': 'New York',
  'EWR': 'Newark',
  'SFO': 'San Francisco',
  'ORD': 'Chicago',
  'MIA': 'Miami',
  'DFW': 'Dallas',
  'SEA': 'Seattle',
  'BOS': 'Boston',
  'ATL': 'Atlanta',
  'DEN': 'Denver',
  'LAS': 'Las Vegas',
  'PHX': 'Phoenix',
  'IAH': 'Houston',
  'MCO': 'Orlando',
  'SAN': 'San Diego',
  'PDX': 'Portland',
  'MSP': 'Minneapolis',
  'DTW': 'Detroit',
  'PHL': 'Philadelphia',
  'CLT': 'Charlotte',
  'BWI': 'Baltimore',
  'DCA': 'Washington DC',
  'IAD': 'Washington DC',
  'BNA': 'Nashville',
  'AUS': 'Austin',
  'RDU': 'Raleigh',
  'SLC': 'Salt Lake City',
  'SMF': 'Sacramento',
  'SJC': 'San Jose',
  'OAK': 'Oakland',
  'BUR': 'Burbank',
  'ONT': 'Ontario',
  'SNA': 'Santa Ana',
  'HNL': 'Honolulu',
  'OGG': 'Maui',
  'LIH': 'Kauai',
  'KOA': 'Kona',
  'ANC': 'Anchorage',
  'FAI': 'Fairbanks',
  'JNU': 'Juneau',
  
  // Mexico
  'CUN': 'Cancun',
  'SJD': 'Cabo San Lucas',
  'PVR': 'Puerto Vallarta',
  'MEX': 'Mexico City',
  'GDL': 'Guadalajara',
  'MTY': 'Monterrey',
  'TIJ': 'Tijuana',
  'ZIH': 'Zihuatanejo',
  'MZT': 'Mazatlan',
  
  // Europe - Major Cities
  'LHR': 'London',
  'LGW': 'London',
  'CDG': 'Paris',
  'ORY': 'Paris',
  'FCO': 'Rome',
  'MAD': 'Madrid',
  'BCN': 'Barcelona',
  'AMS': 'Amsterdam',
  'FRA': 'Frankfurt',
  'MUC': 'Munich',
  'VIE': 'Vienna',
  'ZRH': 'Zurich',
  'CPH': 'Copenhagen',
  'ARN': 'Stockholm',
  'OSL': 'Oslo',
  'DUB': 'Dublin',
  'BRU': 'Brussels',
  'LIS': 'Lisbon',
  'ATH': 'Athens',
  'IST': 'Istanbul',
  'PRG': 'Prague',
  'BUD': 'Budapest',
  'WAW': 'Warsaw',
  
  // Asia
  'NRT': 'Tokyo',
  'HND': 'Tokyo',
  'ICN': 'Seoul',
  'PEK': 'Beijing',
  'PVG': 'Shanghai',
  'HKG': 'Hong Kong',
  'SIN': 'Singapore',
  'BKK': 'Bangkok',
  'KUL': 'Kuala Lumpur',
  'MNL': 'Manila',
  'TPE': 'Taipei',
  'DEL': 'Delhi',
  'BOM': 'Mumbai',
  'DXB': 'Dubai',
  
  // Australia & Pacific
  'SYD': 'Sydney',
  'MEL': 'Melbourne',
  'BNE': 'Brisbane',
  'PER': 'Perth',
  'AKL': 'Auckland',
  'CHC': 'Christchurch',
  
  // South America
  'GRU': 'Sao Paulo',
  'GIG': 'Rio de Janeiro',
  'EZE': 'Buenos Aires',
  'BOG': 'Bogota',
  'LIM': 'Lima',
  'SCL': 'Santiago',
  
  // Canada
  'YYZ': 'Toronto',
  'YVR': 'Vancouver',
  'YUL': 'Montreal',
  'YYC': 'Calgary',
  
  // Caribbean
  'SJU': 'San Juan',
  'NAS': 'Nassau',
  'MBJ': 'Montego Bay',
  'PUJ': 'Punta Cana',
  'AUA': 'Aruba',
  'CUR': 'Curacao',
};

/**
 * Get city name from IATA code
 * Returns empty string if not found (to trigger proper error handling)
 */
export function getCityFromIATA(iataCode: string): string {
  const upperCode = iataCode.toUpperCase();
  return IATA_TO_CITY[upperCode] || '';
}

/**
 * Common city name to IATA code mappings
 * For users who might enter city names instead of airport codes
 */
const CITY_TO_IATA: Record<string, string> = {
  'NYC': 'JFK',
  'NEW YORK': 'JFK',
  'NEWYORK': 'JFK',
  'LA': 'LAX',
  'SF': 'SFO',
  'CHI': 'ORD',
  'CHICAGO': 'ORD',
  'LON': 'LHR',
  'LONDON': 'LHR',
  'PAR': 'CDG',
  'PARIS': 'CDG',
  'TYO': 'NRT',
  'TOKYO': 'NRT',
  'ROM': 'FCO',
  'ROME': 'FCO',
};

/**
 * Normalize airport/city code to valid IATA code
 * Converts common city abbreviations to proper 3-letter IATA codes
 */
export function normalizeToIATA(code: string): string {
  const upperCode = code.toUpperCase().trim();
  
  // If it's already a known IATA code, return it
  if (IATA_TO_CITY[upperCode]) {
    return upperCode;
  }
  
  // Try to convert from city name
  if (CITY_TO_IATA[upperCode]) {
    return CITY_TO_IATA[upperCode];
  }
  
  // Return as-is (will be validated by API)
  return upperCode;
}
