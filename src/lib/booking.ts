/**
 * Generate Booking.com affiliate deeplink for hotel searches
 * Uses NEXT_PUBLIC_ env var - safe for client-side
 */
export function bookingCityDeeplink(
  city: string,
  checkin: string,
  checkout: string
): string {
  // Safe to access NEXT_PUBLIC_ vars on client
  const aid = process.env.NEXT_PUBLIC_BOOKING_AID || '1234567';
  
  // Validate city name - must not be empty or just an IATA code
  if (!city || city.trim().length === 0) {
    console.error('❌ Booking.com deeplink error: city is empty');
    throw new Error('City name is required for hotel search');
  }
  
  // Warn if city looks like an IATA code (all caps, 3 letters)
  if (city.length === 3 && city === city.toUpperCase()) {
    console.warn(`⚠️ Booking.com deeplink warning: city "${city}" looks like an IATA code, not a city name`);
  }
  
  const params = new URLSearchParams({
    aid,
    ss: city.trim(),
    checkin,
    checkout,
    group_adults: '2',
    no_rooms: '1',
    selected_currency: 'USD',
  });
  
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
