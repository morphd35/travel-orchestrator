// Quick test to verify cache behavior
const { searchFlights, getCacheStats, clearCaches } = require('./src/lib/amadeusClient.ts');

async function testCaching() {
    console.log('🧪 Testing Amadeus caching behavior...\n');

    // Clear caches first
    clearCaches();
    console.log('1. Cleared all caches');
    console.log('Cache stats:', getCacheStats());

    // Test parameters
    const params = {
        origin: 'DFW',
        destination: 'FCO',
        departDate: '2026-05-09',
        adults: 1,
        currency: 'USD',
        max: 5
    };

    try {
        console.log('\n2. First search (should hit API):');
        const start1 = Date.now();
        const flights1 = await searchFlights(params);
        const time1 = Date.now() - start1;
        console.log(`Found ${flights1.length} flights in ${time1}ms`);
        console.log('Cache stats after first search:', getCacheStats());

        console.log('\n3. Second identical search (should hit cache):');
        const start2 = Date.now();
        const flights2 = await searchFlights(params);
        const time2 = Date.now() - start2;
        console.log(`Found ${flights2.length} flights in ${time2}ms`);
        console.log('Cache stats after second search:', getCacheStats());

        console.log('\n4. Performance comparison:');
        console.log(`First search: ${time1}ms`);
        console.log(`Second search: ${time2}ms`);
        console.log(`Cache speedup: ${Math.round((time1 / time2) * 100) / 100}x faster`);

        // Verify data consistency
        const firstFlight1 = flights1[0];
        const firstFlight2 = flights2[0];
        const dataMatch = JSON.stringify(firstFlight1) === JSON.stringify(firstFlight2);
        console.log(`Data consistency: ${dataMatch ? '✅ Match' : '❌ Mismatch'}`);

    } catch (error) {
        if (error.message.includes('AMADEUS_API_KEY')) {
            console.log('⚠️  Test requires Amadeus API credentials to run');
        } else {
            console.error('❌ Test failed:', error.message);
        }
    }
}

testCaching().catch(console.error);
