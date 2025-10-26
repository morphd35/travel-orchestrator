// Test script for enhanced deeplink URL generation
// This simulates what the trigger route would generate

const baseUrl = 'http://localhost:3000';

// Sample flight data (simulating bestFlight object)
const sampleFlight = {
    total: 456.78,
    currency: 'USD',
    carrier: 'AA',
    stopsOut: 1,
    stopsBack: 0,
    raw: {
        itineraries: [{
            segments: [
                {
                    departure: { iataCode: 'LAX' },
                    arrival: { iataCode: 'DFW' },
                    carrierCode: 'AA',
                    number: '1234'
                },
                {
                    departure: { iataCode: 'DFW' },
                    arrival: { iataCode: 'JFK' },
                    carrierCode: 'AA',
                    number: '5678'
                }
            ]
        }]
    }
};

// Sample watch data
const sampleWatch = {
    origin: 'LAX',
    destination: 'JFK',
    targetUsd: 500
};

// Sample dates
const bestDates = {
    depart: '2024-02-15',
    return: '2024-02-22'
};

// Build enhanced deeplink (simulating the trigger route logic)
const flightSegments = sampleFlight.raw?.itineraries?.[0]?.segments || [];
const segmentDetails = flightSegments.map((seg) => {
    const departure = seg.departure;
    const arrival = seg.arrival;
    return `${departure.iataCode} → ${arrival.iataCode} (${seg.carrierCode}${seg.number})`;
}).join('\n');

const deeplinkParams = new URLSearchParams({
    o: sampleWatch.origin,
    d: sampleWatch.destination,
    ds: bestDates.depart,
    p: sampleFlight.total.toString(),
    c: sampleFlight.currency,
    car: sampleFlight.carrier,
    so: sampleFlight.stopsOut.toString(),
});

if (bestDates.return) {
    deeplinkParams.set('rs', bestDates.return);
}
if (sampleFlight.stopsBack !== undefined) {
    deeplinkParams.set('sb', sampleFlight.stopsBack.toString());
}
if (sampleWatch.targetUsd) {
    deeplinkParams.set('tp', sampleWatch.targetUsd.toString());
}
if (segmentDetails) {
    deeplinkParams.set('seg', encodeURIComponent(segmentDetails));
}

const searchDeeplink = `${baseUrl}/?${deeplinkParams.toString()}`;
const bookingDeeplink = `${baseUrl}/book?${deeplinkParams.toString()}`;

console.log('🔍 Enhanced Deeplink URLs Generated:');
console.log('');
console.log('Search Page:', searchDeeplink);
console.log('');
console.log('Booking Page:', bookingDeeplink);
console.log('');
console.log('📊 URL Parameters:');
deeplinkParams.forEach((value, key) => {
    console.log(`  ${key}: ${key === 'seg' ? decodeURIComponent(value) : value}`);
});
console.log('');
console.log('✅ Test complete - URLs ready for email template');
