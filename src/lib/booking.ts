/**
 * Generate Booking.com affiliate deeplink for hotel searches
 */
export function bookingCityDeeplink(
  city: string,
  checkin: string,
  checkout: string
): string {
  const aid = process.env.NEXT_PUBLIC_BOOKING_AID!;
  
  if (!aid) {
    console.warn('NEXT_PUBLIC_BOOKING_AID not configured');
  }
  
  const params = new URLSearchParams({
    aid: aid || '1234567', // Fallback to demo ID
    ss: city,
    checkin,
    checkout,
    group_adults: '2',
    no_rooms: '1',
    selected_currency: 'USD',
  });
  
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
