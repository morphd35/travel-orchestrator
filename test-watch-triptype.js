/**
 * Test script to verify watch trigger system respects tripType preferences
 */

const { createWatch, getWatches } = require('./src/lib/watchStore.ts');

console.log('🧪 Testing watch system with trip type preferences...\n');

// Create test watches with different trip types
const testWatches = [
    {
        id: 'test-oneway-' + Date.now(),
        userId: 'test-user',
        origin: 'LAX',
        destination: 'JFK',
        start: '2024-12-01',
        end: '2024-12-15',
        cabin: 'ECONOMY',
        tripType: 'oneway',
        maxStops: 1,
        adults: 1,
        currency: 'USD',
        targetUsd: 300,
        flexDays: 2,
        active: true,
        email: 'test@example.com',
        provider: 'amadeus'
    },
    {
        id: 'test-roundtrip-' + Date.now() + 1,
        userId: 'test-user',
        origin: 'LAX',
        destination: 'JFK',
        start: '2024-12-01',
        end: '2024-12-15',
        cabin: 'BUSINESS',
        tripType: 'roundtrip',
        maxStops: 0,
        adults: 2,
        currency: 'USD',
        targetUsd: 800,
        flexDays: 3,
        active: true,
        email: 'test@example.com',
        provider: 'amadeus'
    }
];

// Create the test watches
for (const watchData of testWatches) {
    try {
        const watch = createWatch(watchData);
        console.log(`✅ Created ${watch.tripType} watch: ${watch.id}`);
        console.log(`   Route: ${watch.origin} → ${watch.destination}`);
        console.log(`   Cabin: ${watch.cabin}`);
        console.log(`   Adults: ${watch.adults}`);
        console.log(`   Target: $${watch.targetUsd}\n`);
    } catch (error) {
        console.error(`❌ Failed to create watch:`, error.message);
    }
}

// List all watches to verify they were created with correct tripType
console.log('📋 All test user watches:');
const allWatches = getWatches('test-user');
allWatches.forEach((watch, index) => {
    console.log(`${index + 1}. ${watch.id} - ${watch.tripType} - ${watch.cabin} - $${watch.targetUsd}`);
});

console.log('\n🎯 Test watches created successfully!');
console.log('💡 You can now test the trigger system with these watches:');
console.log(`   curl -X POST http://localhost:3001/edge/watch/${testWatches[0].id}/trigger`);
console.log(`   curl -X POST http://localhost:3001/edge/watch/${testWatches[1].id}/trigger`);
console.log('\n📊 Check the console logs to verify:');
console.log('   - One-way watch only generates one-way combinations');
console.log('   - Round-trip watch only generates round-trip combinations');
console.log('   - Cabin class is included in search parameters');
