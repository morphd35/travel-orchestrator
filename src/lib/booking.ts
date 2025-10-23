/**
 * Generate Booking.com affiliate deeplink for hotel searches
 * This runs client-side only to avoid hydration issues
 */
export function bookingCityDeeplink(
  city: string,
  checkin: string,
  checkout: string
): string {
  // Only access env vars on client side
  const aid = typeof window !== 'undefined' 
    ? (window as any).__NEXT_PUBLIC_BOOKING_AID || '1234567'
    : '1234567';
  
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

// Set the booking AID on window for client-side access
if (typeof window !== 'undefined') {
  (window as any).__NEXT_PUBLIC_BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID || '1234567';
}
