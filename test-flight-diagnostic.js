// Diagnostic test for DFW → FCO flight search
async function testFlightSearch() {
    console.log('🔍 Diagnostic Test: DFW → FCO Flight Search\n');

    const testParams = {
        origin: 'DFW',
        destination: 'FCO',
        departDate: '2026-04-25',
        returnDate: '2026-05-02',
        adults: 1,
        currency: 'USD',
        max: 50 // Request more results
    };

    console.log('Test Parameters:', testParams);
    console.log('---\n');

    try {
        const response = await fetch('http://localhost:3001/api/flights/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testParams)
        });

        if (!response.ok) {
            console.error('❌ API Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return;
        }

        const data = await response.json();

        console.log('📊 RESULTS SUMMARY:');
        console.log(`Total flights found: ${data.results?.length || 0}`);
        console.log(`Provider sources: ${JSON.stringify(data.meta?.sources || {})}`);
        console.log(`Status: ${data.meta?.status || 'unknown'}`);
        console.log('---\n');

        if (data.results && data.results.length > 0) {
            // Analyze airlines
            const airlines = {};
            const prices = [];
            const sources = {};

            data.results.forEach((flight, index) => {
                airlines[flight.carrier] = (airlines[flight.carrier] || 0) + 1;
                prices.push(flight.price);
                sources[flight.source] = (sources[flight.source] || 0) + 1;

                if (index < 5) { // Show first 5 flights in detail
                    console.log(`Flight ${index + 1}:`);
                    console.log(`  ${flight.carrier} (${flight.carrierName}) - $${flight.price} ${flight.currency}`);
                    console.log(`  Route: ${flight.outbound.origin} → ${flight.outbound.destination}`);
                    console.log(`  Departure: ${flight.outbound.departure}`);
                    console.log(`  Stops: ${flight.outbound.stops} out, ${flight.inbound?.stops || 'N/A'} back`);
                    console.log(`  Source: ${flight.source}`);
                    console.log('---');
                }
            });

            console.log('\n📈 ANALYSIS:');
            console.log('Airlines found:', Object.keys(airlines).sort());
            console.log('Flight count by airline:', airlines);
            console.log('Flight count by source:', sources);
            console.log(`Price range: $${Math.min(...prices)}-$${Math.max(...prices)}`);

            // Check for expected airlines on DFW-FCO route
            const expectedAirlines = ['AA', 'DL', 'UA', 'LH', 'AF', 'KL', 'IB', 'BA', 'TK'];
            const missingAirlines = expectedAirlines.filter(code => !airlines[code]);

            if (missingAirlines.length > 0) {
                console.log('⚠️ Missing expected airlines:', missingAirlines);
                console.log('📝 DFW-FCO route typically includes:');
                console.log('   - AA (American): Direct and connecting');
                console.log('   - DL (Delta): Via CDG, AMS, etc.');
                console.log('   - UA (United): Via FRA, MUC, etc.');
                console.log('   - LH (Lufthansa): Via FRA, MUC');
                console.log('   - AF (Air France): Via CDG');
                console.log('   - KL (KLM): Via AMS');
                console.log('   - TK (Turkish): Via IST');
                console.log('   - BA (British Airways): Via LHR');
            }

        } else {
            console.log('❌ No flights found!');
            console.log('This suggests an API configuration issue.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Server not running. Start with: npm run dev');
        }
    }
}

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
    // Browser environment
    testFlightSearch().then(() => console.log('✅ Test completed'));
} else {
    // Node.js environment
    const { fetch } = require('undici');
    global.fetch = fetch;
    testFlightSearch().then(() => console.log('✅ Test completed'));
}
