/**
 * Test provider migration by making API calls
 */

async function testProviderAPI() {
    const baseUrl = 'http://localhost:3000';

    console.log('🧪 Testing provider migration via API...');

    try {
        // Test 1: Create a watch with default provider
        console.log('\n1️⃣ Testing default provider watch creation...');

        const defaultWatch = {
            origin: 'NYC',
            destination: 'LAX',
            start: '2025-12-01',
            end: '2025-12-05',
            cabin: 'ECONOMY',
            maxStops: 1,
            adults: 1,
            currency: 'USD',
            targetUsd: 400,
            flexDays: 2,
            active: true,
            email: 'test@example.com'
        };

        const response1 = await fetch(`${baseUrl}/edge/watch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultWatch)
        });

        if (response1.ok) {
            const watch1 = await response1.json();
            console.log('✅ Created watch with provider:', watch1.provider);
            console.log('   - ID:', watch1.id);
            console.log('   - Route:', `${watch1.origin} → ${watch1.destination}`);
        } else {
            console.log('❌ Failed to create default watch:', response1.status);
        }

        // Test 2: Create a watch with explicit Skyscanner provider
        console.log('\n2️⃣ Testing explicit Skyscanner provider...');

        const skyscannerWatch = {
            origin: 'SFO',
            destination: 'JFK',
            start: '2025-12-10',
            end: '2025-12-15',
            cabin: 'ECONOMY',
            maxStops: 0,
            adults: 2,
            currency: 'USD',
            targetUsd: 600,
            flexDays: 1,
            active: true,
            provider: 'skyscanner'
        };

        const response2 = await fetch(`${baseUrl}/edge/watch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(skyscannerWatch)
        });

        if (response2.ok) {
            const watch2 = await response2.json();
            console.log('✅ Created watch with provider:', watch2.provider);
            console.log('   - ID:', watch2.id);
            console.log('   - Route:', `${watch2.origin} → ${watch2.destination}`);
        } else {
            console.log('❌ Failed to create Skyscanner watch:', response2.status);
        }

        // Test 3: List all watches to see provider data
        console.log('\n3️⃣ Testing watch listing with provider info...');

        const response3 = await fetch(`${baseUrl}/edge/watch?userId=anon`);
        if (response3.ok) {
            const watches = await response3.json();
            console.log(`✅ Retrieved ${watches.length} watches`);

            watches.forEach(watch => {
                console.log(`   - ${watch.origin} → ${watch.destination}:`);
                console.log(`     * Provider: ${watch.provider || 'NULL'}`);
                console.log(`     * Last Provider: ${watch.lastProvider || 'NULL'}`);
                console.log(`     * Source Link: ${watch.lastSourceLink || 'NULL'}`);
            });
        } else {
            console.log('❌ Failed to list watches:', response3.status);
        }

        console.log('\n🎉 Provider API test completed!');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run the test if server is running
testProviderAPI().catch(console.error);
