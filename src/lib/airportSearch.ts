/**
 * Airport data with city names, countries, and IATA codes
 * For user-friendly autocomplete search
 */
export interface Airport {
  iata: string;
  city: string;
  country: string;
  name: string;
}

export const AIRPORTS: Airport[] = [
  // United States - Major Cities
  { iata: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International' },
  { iata: 'JFK', city: 'New York', country: 'United States', name: 'John F. Kennedy International' },
  { iata: 'LGA', city: 'New York', country: 'United States', name: 'LaGuardia' },
  { iata: 'EWR', city: 'Newark', country: 'United States', name: 'Newark Liberty International' },
  { iata: 'SFO', city: 'San Francisco', country: 'United States', name: 'San Francisco International' },
  { iata: 'ORD', city: 'Chicago', country: 'United States', name: "O'Hare International" },
  { iata: 'MIA', city: 'Miami', country: 'United States', name: 'Miami International' },
  { iata: 'DFW', city: 'Dallas', country: 'United States', name: 'Dallas/Fort Worth International' },
  { iata: 'SEA', city: 'Seattle', country: 'United States', name: 'Seattle-Tacoma International' },
  { iata: 'BOS', city: 'Boston', country: 'United States', name: 'Logan International' },
  { iata: 'ATL', city: 'Atlanta', country: 'United States', name: 'Hartsfield-Jackson Atlanta International' },
  { iata: 'DEN', city: 'Denver', country: 'United States', name: 'Denver International' },
  { iata: 'LAS', city: 'Las Vegas', country: 'United States', name: 'Harry Reid International' },
  { iata: 'PHX', city: 'Phoenix', country: 'United States', name: 'Sky Harbor International' },
  { iata: 'IAH', city: 'Houston', country: 'United States', name: 'George Bush Intercontinental' },
  { iata: 'MCO', city: 'Orlando', country: 'United States', name: 'Orlando International' },
  { iata: 'SAN', city: 'San Diego', country: 'United States', name: 'San Diego International' },
  { iata: 'PDX', city: 'Portland', country: 'United States', name: 'Portland International' },
  { iata: 'MSP', city: 'Minneapolis', country: 'United States', name: 'Minneapolis-St Paul International' },
  { iata: 'DTW', city: 'Detroit', country: 'United States', name: 'Detroit Metropolitan Wayne County' },
  { iata: 'PHL', city: 'Philadelphia', country: 'United States', name: 'Philadelphia International' },
  { iata: 'CLT', city: 'Charlotte', country: 'United States', name: 'Charlotte Douglas International' },
  { iata: 'BWI', city: 'Baltimore', country: 'United States', name: 'Baltimore/Washington International' },
  { iata: 'DCA', city: 'Washington', country: 'United States', name: 'Ronald Reagan Washington National' },
  { iata: 'IAD', city: 'Washington', country: 'United States', name: 'Washington Dulles International' },
  
  // Mexico
  { iata: 'CUN', city: 'Cancun', country: 'Mexico', name: 'Cancún International' },
  { iata: 'SJD', city: 'Cabo San Lucas', country: 'Mexico', name: 'Los Cabos International' },
  { iata: 'PVR', city: 'Puerto Vallarta', country: 'Mexico', name: 'Licenciado Gustavo Díaz Ordaz International' },
  { iata: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Mexico City International' },
  { iata: 'GDL', city: 'Guadalajara', country: 'Mexico', name: 'Miguel Hidalgo y Costilla International' },
  
  // Europe - Major Cities
  { iata: 'LHR', city: 'London', country: 'United Kingdom', name: 'Heathrow' },
  { iata: 'LGW', city: 'London', country: 'United Kingdom', name: 'Gatwick' },
  { iata: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle' },
  { iata: 'ORY', city: 'Paris', country: 'France', name: 'Orly' },
  { iata: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci-Fiumicino' },
  { iata: 'CIA', city: 'Rome', country: 'Italy', name: 'Ciampino' },
  { iata: 'MAD', city: 'Madrid', country: 'Spain', name: 'Adolfo Suárez Madrid-Barajas' },
  { iata: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona-El Prat' },
  { iata: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Schiphol' },
  { iata: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { iata: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich Airport' },
  { iata: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna International' },
  { iata: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
  { iata: 'CPH', city: 'Copenhagen', country: 'Denmark', name: 'Copenhagen Airport' },
  { iata: 'ARN', city: 'Stockholm', country: 'Sweden', name: 'Stockholm Arlanda' },
  { iata: 'OSL', city: 'Oslo', country: 'Norway', name: 'Oslo Airport' },
  { iata: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' },
  { iata: 'BRU', city: 'Brussels', country: 'Belgium', name: 'Brussels Airport' },
  { iata: 'LIS', city: 'Lisbon', country: 'Portugal', name: 'Lisbon Portela Airport' },
  { iata: 'ATH', city: 'Athens', country: 'Greece', name: 'Athens International' },
  { iata: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { iata: 'PRG', city: 'Prague', country: 'Czech Republic', name: 'Václav Havel Airport' },
  { iata: 'BUD', city: 'Budapest', country: 'Hungary', name: 'Budapest Ferenc Liszt International' },
  { iata: 'WAW', city: 'Warsaw', country: 'Poland', name: 'Warsaw Chopin Airport' },
  
  // Asia
  { iata: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Narita International' },
  { iata: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda Airport' },
  { iata: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International' },
  { iata: 'PEK', city: 'Beijing', country: 'China', name: 'Beijing Capital International' },
  { iata: 'PVG', city: 'Shanghai', country: 'China', name: 'Pudong International' },
  { iata: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International' },
  { iata: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
  { iata: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
  { iata: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International' },
  { iata: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International' },
  
  // Australia & Pacific
  { iata: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith' },
  { iata: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport' },
  { iata: 'BNE', city: 'Brisbane', country: 'Australia', name: 'Brisbane Airport' },
  { iata: 'AKL', city: 'Auckland', country: 'New Zealand', name: 'Auckland Airport' },
  
  // South America
  { iata: 'GRU', city: 'Sao Paulo', country: 'Brazil', name: 'São Paulo-Guarulhos International' },
  { iata: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', name: 'Rio de Janeiro-Galeão International' },
  { iata: 'EZE', city: 'Buenos Aires', country: 'Argentina', name: 'Ministro Pistarini International' },
  { iata: 'BOG', city: 'Bogota', country: 'Colombia', name: 'El Dorado International' },
  { iata: 'LIM', city: 'Lima', country: 'Peru', name: 'Jorge Chávez International' },
  
  // Canada
  { iata: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International' },
  { iata: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver International' },
  { iata: 'YUL', city: 'Montreal', country: 'Canada', name: 'Montréal-Pierre Elliott Trudeau International' },
  
  // Caribbean
  { iata: 'SJU', city: 'San Juan', country: 'Puerto Rico', name: 'Luis Muñoz Marín International' },
  { iata: 'NAS', city: 'Nassau', country: 'Bahamas', name: 'Lynden Pindling International' },
  { iata: 'MBJ', city: 'Montego Bay', country: 'Jamaica', name: 'Sangster International' },
];

/**
 * Search airports by city name, country, or IATA code
 * Returns fuzzy matches sorted by relevance
 */
export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  // Score each airport based on match quality
  const scored = AIRPORTS.map(airport => {
    let score = 0;
    const city = airport.city.toLowerCase();
    const country = airport.country.toLowerCase();
    const iata = airport.iata.toLowerCase();
    
    // Exact IATA match (highest priority)
    if (iata === searchTerm) {
      score = 1000;
    }
    // IATA starts with search term
    else if (iata.startsWith(searchTerm)) {
      score = 900;
    }
    // Exact city match
    else if (city === searchTerm) {
      score = 800;
    }
    // City starts with search term
    else if (city.startsWith(searchTerm)) {
      score = 700;
    }
    // City contains search term
    else if (city.includes(searchTerm)) {
      score = 500;
    }
    // Country starts with search term
    else if (country.startsWith(searchTerm)) {
      score = 300;
    }
    // Country contains search term
    else if (country.includes(searchTerm)) {
      score = 200;
    }
    // Fuzzy match (handle typos like "Rhome" → "Rome")
    else if (isFuzzyMatch(city, searchTerm)) {
      score = 400;
    }
    
    return { airport, score };
  });
  
  // Filter out non-matches and sort by score
  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Return top 10 matches
    .map(({ airport }) => airport);
}

/**
 * Simple fuzzy matching for typos
 * Returns true if the strings are similar (allowing 1-2 character differences)
 */
function isFuzzyMatch(target: string, query: string): boolean {
  if (Math.abs(target.length - query.length) > 2) {
    return false;
  }
  
  let differences = 0;
  const maxLength = Math.max(target.length, query.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (target[i] !== query[i]) {
      differences++;
      if (differences > 2) {
        return false;
      }
    }
  }
  
  return differences <= 2;
}

/**
 * Format airport for display in dropdown
 */
export function formatAirportOption(airport: Airport): string {
  return `${airport.city}, ${airport.country} (${airport.iata})`;
}
