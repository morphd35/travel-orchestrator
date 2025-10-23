/**
 * Generate Booking.com affiliate deeplink for hotel searches
 * Uses NEXT_PUBLIC_ env var - safe for client-side
 */
export function bookingCityDeeplink(
  city: string,
  checkin: string,
  checkout: string
): string {
  // Validate city name - must not be empty or just an IATA code
  if (!city || city.trim().length === 0) {
    console.error('❌ Booking.com deeplink error: city is empty');
    throw new Error('City name is required for hotel search');
  }
  
  // Warn if city looks like an IATA code (all caps, 3 letters)
  if (city.length === 3 && city === city.toUpperCase()) {
    console.warn(`⚠️ Booking.com deeplink warning: city "${city}" looks like an IATA code, not a city name`);
  }
  
  // Build params - only include affiliate ID if it's a real one (not test ID)
  const aid = process.env.NEXT_PUBLIC_BOOKING_AID;
  const params: Record<string, string> = {
    ss: city.trim(),
    checkin,
    checkout,
    group_adults: '2',
    no_rooms: '1',
    selected_currency: 'USD',
  };
  
  // Only add affiliate ID if provided and not the test ID
  if (aid && aid !== '1234567') {
    params.aid = aid;
  }
  
  return `https://www.booking.com/searchresults.html?${new URLSearchParams(params).toString()}`;
}
