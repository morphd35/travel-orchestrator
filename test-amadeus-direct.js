// Direct test of Amadeus API with expanded parameters
const https = require('https');

async function testAmadeusDirect() {
    console.log('🔍 Direct Amadeus API Test: DFW → FCO\n');

    // Test different max values and see what we get
    const testCases = [
        { max: 20, desc: 'Standard (20 results)' },
        { max: 50, desc: 'Expanded (50 results)' },
        { max: 100, desc: 'Maximum (100 results)' },
    ];

    for (const testCase of testCases) {
        console.log(`\n📊 Testing: ${testCase.desc}`);
        console.log('---');

        try {
            const response = await fetch('http://localhost:3001/api/flights/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    origin: 'DFW',
                    destination: 'FCO',
                    departDate: '2026-04-25',
                    returnDate: '2026-05-02',
                    adults: 1,
                    currency: 'USD',
                    max: testCase.max
                })
            });

            if (!response.ok) {
                console.error(`❌ API Error: ${response.status} ${response.statusText}`);
                continue;
            }

            const data = await response.json();

            console.log(`Results: ${data.results?.length || 0}`);

            if (data.results && data.results.length > 0) {
                const airlines = {};
                data.results.forEach(flight => {
                    airlines[flight.carrier] = (airlines[flight.carrier] || 0) + 1;
                });

                console.log('Airlines:', Object.keys(airlines).sort().join(', '));
                console.log('Breakdown:', airlines);

                const prices = data.results.map(f => f.price);
                console.log(`Price range: $${Math.min(...prices)}-$${Math.max(...prices)}`);
                console.log(`Sources: ${JSON.stringify(data.meta?.sources || {})}`);
            } else {
                console.log('❌ No results found');
            }

        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }

    console.log('\n🔍 Expected airlines for DFW-FCO route:');
    console.log('Direct flights: AA (American Airlines)');
    console.log('1-stop via Europe: LH (Lufthansa), AF (Air France), KL (KLM), BA (British Airways)');
    console.log('1-stop via Turkey: TK (Turkish Airlines)');
    console.log('1-stop via Middle East: QR (Qatar), EK (Emirates), EY (Etihad)');
    console.log('US carriers connecting: DL (Delta), UA (United)');

    console.log('\n💡 If only seeing United (UA) flights:');
    console.log('1. Check Amadeus API sandbox vs production settings');
    console.log('2. Verify route is available in selected date range');
    console.log('3. Consider airline partnerships affecting results');
    console.log('4. Check if Skyscanner API key is properly configured');
}

// Run the test
if (typeof fetch === 'undefined') {
    const { fetch } = require('undici');
    global.fetch = fetch;
}

testAmadeusDirect().catch(console.error);
