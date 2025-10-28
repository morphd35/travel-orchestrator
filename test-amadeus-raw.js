/**
 * Test script to see raw Amadeus API response
 */

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY || 'YOUR_API_KEY_HERE';
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET || 'YOUR_API_SECRET_HERE';
const AMADEUS_HOST = 'https://test.api.amadeus.com';

async function getToken() {
    const response = await fetch(`${AMADEUS_HOST}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: AMADEUS_API_KEY,
            client_secret: AMADEUS_API_SECRET,
        }),
    });

    if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function testFlightSearch() {
    try {
        console.log('🔑 Getting Amadeus token...');
        const token = await getToken();
        console.log('✅ Token obtained');

        console.log('🛫 Searching flights DFW → BOS...');
        const params = new URLSearchParams({
            originLocationCode: 'DFW',
            destinationLocationCode: 'BOS',
            departureDate: '2025-10-28', // Different date to avoid cache
            adults: '1',
            currencyCode: 'USD',
            max: '5' // Just get 5 to analyze
        });

        const response = await fetch(`${AMADEUS_HOST}/v2/shopping/flight-offers?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Flight search failed: ${response.status}`);
        }

        const data = await response.json();

        console.log('\n📊 Raw API Response Summary:');
        console.log('Total offers:', data.data?.length || 0);

        if (data.data && data.data.length > 0) {
            console.log('\n🛫 Flight Details:');
            data.data.slice(0, 3).forEach((offer, index) => {
                const segments = offer.itineraries?.[0]?.segments || [];
                const carrier = segments[0]?.carrierCode;
                const price = offer.price?.total;
                const currency = offer.price?.currency;

                console.log(`\nFlight ${index + 1}:`);
                console.log(`  Carrier: ${carrier}`);
                console.log(`  Price: ${currency} ${price}`);
                console.log(`  Segments:`, segments.length);

                segments.forEach((seg, i) => {
                    console.log(`    ${i + 1}. ${seg.carrierCode}${seg.number}: ${seg.departure?.iataCode} → ${seg.arrival?.iataCode}`);
                    console.log(`       Depart: ${seg.departure?.at}`);
                    console.log(`       Arrive: ${seg.arrival?.at}`);
                });
            });
        }

        // Check if this looks like test data
        const carriers = [...new Set(data.data?.map(offer =>
            offer.itineraries?.[0]?.segments?.[0]?.carrierCode
        ).filter(Boolean))];

        console.log('\n📈 All Carriers Found:', carriers);

        const suspiciousCarriers = ['NK', 'F9', 'G4']; // Budget carriers unlikely in Amadeus
        const foundSuspicious = carriers.filter(c => suspiciousCarriers.includes(c));

        if (foundSuspicious.length > 0) {
            console.log('⚠️  SUSPICIOUS: Found budget carriers that typically aren\'t in Amadeus test data:', foundSuspicious);
            console.log('⚠️  This suggests test/mock data may still be in use');
        }

        // Check for realistic pricing
        const prices = data.data?.map(offer => parseFloat(offer.price?.total || 0)).filter(p => p > 0) || [];
        if (prices.length > 0) {
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            console.log('\n💰 Pricing Analysis:');
            console.log(`  Average: $${avgPrice.toFixed(2)}`);
            console.log(`  Range: $${minPrice} - $${maxPrice}`);

            if (minPrice < 100 || maxPrice > 2000) {
                console.log('⚠️  SUSPICIOUS: Unusual pricing suggests test data');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFlightSearch();
