// Test Amadeus API connectivity
const { getToken, getCacheStats } = require('./src/lib/amadeusClient.ts');

async function testAmadeusConnection() {
    console.log('🧪 Testing Amadeus API connection...\n');

    try {
        console.log('1. Environment check:');
        console.log('  - AMADEUS_HOST:', process.env.AMADEUS_HOST || 'https://test.api.amadeus.com');
        console.log('  - AMADEUS_API_KEY:', process.env.AMADEUS_API_KEY ? '✅ Set' : '❌ Missing');
        console.log('  - AMADEUS_API_SECRET:', process.env.AMADEUS_API_SECRET ? '✅ Set' : '❌ Missing');

        console.log('\n2. Cache stats before:', getCacheStats());

        console.log('\n3. Testing token fetch...');
        const start = Date.now();
        const token = await getToken();
        const time = Date.now() - start;

        console.log(`✅ Token obtained in ${time}ms`);
        console.log('   Token preview:', token.slice(0, 20) + '...');

        console.log('\n4. Cache stats after:', getCacheStats());

    } catch (error) {
        console.log('❌ Connection test failed:', error.message);
        console.log('   Error type:', error.constructor.name);
        console.log('   Error code:', error.code);

        if (error.cause) {
            console.log('   Cause:', error.cause);
        }
    }
}

testAmadeusConnection().catch(console.error);
