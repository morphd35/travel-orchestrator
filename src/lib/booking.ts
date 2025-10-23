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
  
  const params = new URLSearchParams({
    aid,
    ss: city,
    checkin,
    checkout,
    group_adults: '2',
    no_rooms: '1',
    selected_currency: 'USD',
  });
  
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
