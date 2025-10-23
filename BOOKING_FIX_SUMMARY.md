# Booking.com Deeplink Fix Summary

## Issue Reported
User reported that the "View Stays" button was redirecting to Booking.com with an empty search string (`ss` parameter), resulting in an error page: `https://www.booking.com/index.en-us.html?....&errorc_searchstring_not_found=ss`

## Root Causes Identified

### 1. Fallback Results Missing Hotel Component
When the Amadeus flight API failed, the fallback results didn't include a `hotel` component even when the user requested hotels. This meant the "View Stays" button wouldn't even render.

### 2. Lack of Validation
No validation existed to ensure:
- The destination IATA code was properly captured
- The city name was successfully looked up
- The `ss` parameter was not empty before generating the URL

### 3. Insufficient Error Handling
No try-catch blocks or error handling around the Booking.com URL generation, making debugging difficult.

## Fixes Implemented

### 1. Enhanced `booking.ts` (`/app/src/lib/booking.ts`)
**Changes:**
- Added validation to ensure city name is not empty
- Added warning if city looks like an IATA code (3 uppercase letters)
- Added `.trim()` to clean the city parameter
- Added error logging for debugging

**Before:**
```typescript
const params = new URLSearchParams({
  aid,
  ss: city,
  ...
});
```

**After:**
```typescript
// Validate city name - must not be empty or just an IATA code
if (!city || city.trim().length === 0) {
  console.error('❌ Booking.com deeplink error: city is empty');
  throw new Error('City name is required for hotel search');
}

// Warn if city looks like an IATA code
if (city.length === 3 && city === city.toUpperCase()) {
  console.warn(`⚠️ Booking.com deeplink warning: city "${city}" looks like an IATA code`);
}

const params = new URLSearchParams({
  aid,
  ss: city.trim(), // Clean whitespace
  ...
});
```

### 2. Fixed Fallback Results (`/app/src/app/page.tsx`)
**Changes:**
- Added hotel component to fallback results when user requests hotels
- Updated pricing to reflect hotel costs

**Before:**
```typescript
setResults([{
  id: 'fallback_1',
  total: 500,
  components: {
    flight: { carrier: 'Various', stops: 0 },
  },
}]);
```

**After:**
```typescript
setResults([{
  id: 'fallback_1',
  total: 500 + (payload.includeHotel ? 1050 : 0), // Add hotel cost
  components: {
    flight: { carrier: 'Various', stops: 0 },
    hotel: payload.includeHotel ? { name: 'Hotels Available' } : undefined,
  },
}]);
```

### 3. Enhanced Form Validation (`/app/src/app/page.tsx`)
**Changes:**
- Added validation to ensure origin and destination are selected before search
- Added comprehensive logging of search parameters

**Added:**
```typescript
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
  includeHotel: payload.includeHotel,
});
```

### 4. Robust URL Generation with Error Handling (`/app/src/app/page.tsx`)
**Changes:**
- Wrapped Booking.com URL generation in try-catch block
- Added validation for destination IATA and city name
- Added comprehensive debug logging (limited to first result to avoid spam)
- Enhanced button text to show city name: "View Stays in Cancun"
- Added tooltip with city name

**Key validation:**
```typescript
try {
  const destinationIATA = searchParams.destination;
  
  // Validate destination IATA code
  if (!destinationIATA || destinationIATA.trim().length === 0) {
    console.error('❌ Booking.com error: destination IATA is empty');
    return null;
  }
  
  const cityName = getCityFromIATA(destinationIATA);
  
  // Additional validation - ensure city name is not empty
  if (!cityName || cityName.trim().length === 0) {
    console.error('❌ Booking.com error: city name is empty for IATA:', destinationIATA);
    return null;
  }
  
  const bookingUrl = bookingCityDeeplink(cityName, searchParams.startDate, searchParams.endDate);
  
  // Debug logging (first result only)
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
      title={`Search hotels in ${cityName}`}
      ...
    >
      <span>View Stays in {cityName}</span>
    </a>
  );
} catch (error) {
  console.error('❌ Error generating Booking.com URL:', error);
  return null;
}
```

## Test Results

### Successful Test Case: BOS → CUN
- **Origin:** Boston (BOS)
- **Destination:** Cancun (CUN)
- **Dates:** 2025-11-22 to 2025-11-29
- **Hotels:** ✅ Included

**Results:**
- ✅ 20 flight packages found with real Amadeus data
- ✅ All packages include hotel component
- ✅ "View Stays in Cancun" buttons generated
- ✅ Booking.com URL: `https://www.booking.com/searchresults.html?aid=1234567&ss=Cancun&checkin=2025-11-22&checkout=2025-11-29&group_adults=2&no_rooms=1&selected_currency=USD`
- ✅ `ss` parameter value: `Cancun`

### Console Output
```
🔍 Search initiated: {origin: BOS, destination: CUN, dates: 2025-11-22 to 2025-11-29, includeHotel: true}
🏨 Booking.com Generated: {
  destinationIATA: CUN, 
  cityName: Cancun, 
  checkin: 2025-11-22, 
  checkout: 2025-11-29, 
  url: https://www.booking.com/searchresults.html?aid=1234567&ss=Cancun&...,
  ssParam: Cancun
}
```

## User Experience Improvements

1. **Better button text**: "View Stays in Cancun" instead of generic "View Stays"
2. **Tooltip**: Shows city name on hover
3. **Error handling**: Buttons won't render if URL generation fails, preventing broken links
4. **Debug logging**: Clear console output for troubleshooting

## Known Limitations

1. **IATA Code Coverage**: The IATA_TO_CITY mapping covers ~100 major airports. If a user selects an unlisted airport, `getCityFromIATA()` returns the IATA code itself, which might not work with Booking.com
2. **Fallback Results**: When Amadeus API fails, only 1 fallback result is shown (could be expanded)
3. **Test Affiliate ID**: Still using test AID `1234567` - needs to be replaced with real affiliate ID

## Next Steps for Production

1. Replace test Booking.com Affiliate ID (`NEXT_PUBLIC_BOOKING_AID=1234567`) with a real one
2. Consider adding more airports to the IATA_TO_CITY mapping based on user analytics
3. Add end-to-end tests for the Booking.com deeplink functionality
4. Monitor Booking.com click-through rate and adjust URL parameters if needed

## Files Modified

1. `/app/src/lib/booking.ts` - Enhanced validation and error handling
2. `/app/src/app/page.tsx` - Fixed fallback results, added form validation, improved URL generation
