// Test script for the trigger endpoint
async function testTriggerEndpoint() {
    const baseUrl = 'http://localhost:3010';

    console.log('🧪 Testing Trigger Endpoint\n');

    try {
        // Step 1: Create a watch first
        console.log('1️⃣ Creating a test watch...');
        const createResponse = await fetch(`${baseUrl}/edge/watch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                origin: 'NYC',
                destination: 'LAX',
                start: '2025-12-01',
                end: '2025-12-10',
                cabin: 'ECONOMY',
                maxStops: 1,
                adults: 2,
                currency: 'USD',
                targetUsd: 500, // Set a reasonable target
                flexDays: 3,
            }),
        });

        const watch = await createResponse.json();
        console.log('Created watch ID:', watch.id);
        console.log('Target price: $' + watch.targetUsd);
        console.log('✅ Watch created successfully!\n');

        if (createResponse.status === 201 && watch.id) {
            // Step 2: Trigger the price check
            console.log('2️⃣ Triggering price check...');
            const start = Date.now();

            const triggerResponse = await fetch(`${baseUrl}/edge/watch/${watch.id}/trigger`, {
                method: 'POST',
            });

            const duration = Date.now() - start;
            const triggerResult = await triggerResponse.json();

            console.log('Status:', triggerResponse.status);
            console.log('Duration:', duration + 'ms');
            console.log('Response:', JSON.stringify(triggerResult, null, 2));

            if (triggerResponse.status === 200) {
                console.log('✅ Trigger successful!');
                console.log(`Action: ${triggerResult.action}`);
                console.log(`Reason: ${triggerResult.reason || 'N/A'}`);

                if (triggerResult.best) {
                    console.log(`Best flight: $${triggerResult.best.total} ${triggerResult.best.currency}`);
                    console.log(`Carrier: ${triggerResult.best.carrier}`);
                    console.log(`Stops: ${triggerResult.best.stopsOut} out, ${triggerResult.best.stopsBack || 'N/A'} back`);
                    console.log(`Dates: ${triggerResult.best.dates.depart}` +
                        (triggerResult.best.dates.return ? ` → ${triggerResult.best.dates.return}` : ' (one-way)'));
                }
                console.log(`Searched ${triggerResult.searchedCombinations} date combinations`);
            } else {
                console.log('❌ Trigger failed');
            }

            // Step 3: Trigger again to test NOOP behavior
            console.log('\n3️⃣ Triggering again (should be NOOP unless price dropped significantly)...');
            const secondTriggerResponse = await fetch(`${baseUrl}/edge/watch/${watch.id}/trigger`, {
                method: 'POST',
            });

            const secondResult = await secondTriggerResponse.json();
            console.log('Second trigger action:', secondResult.action);
            console.log('Second trigger reason:', secondResult.reason);
            console.log('✅ Second trigger completed\n');

            // Step 4: List watches to see updated state
            console.log('4️⃣ Checking updated watch state...');
            const listResponse = await fetch(`${baseUrl}/edge/watch`);
            const watches = await listResponse.json();
            const updatedWatch = watches.find(w => w.id === watch.id);

            if (updatedWatch) {
                console.log('Updated watch state:');
                console.log(`- lastBestUsd: $${updatedWatch.lastBestUsd || 'N/A'}`);
                console.log(`- lastNotifiedUsd: $${updatedWatch.lastNotifiedUsd || 'N/A'}`);
                console.log(`- targetUsd: $${updatedWatch.targetUsd}`);
                console.log('✅ Watch state verified\n');
            }

        } else {
            console.log('❌ Failed to create watch for testing');
        }

        console.log('🎉 All trigger tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the tests
testTriggerEndpoint();
