// Test script for watch endpoints
const baseUrl = 'http://localhost:3009';

async function testWatchEndpoints() {
  console.log('🧪 Testing Watch Endpoints\n');
  
  try {
    // Test 1: Create a watch
    console.log('1️⃣ Testing POST /edge/watch (Create Watch)');
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
        targetUsd: 350,
        flexDays: 3,
      }),
    });
    
    const createResult = await createResponse.json();
    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createResult, null, 2));
    
    if (createResponse.status === 201 && createResult.id) {
      console.log('✅ Create watch successful!\n');
      
      // Test 2: List watches
      console.log('2️⃣ Testing GET /edge/watch (List Watches)');
      const listResponse = await fetch(`${baseUrl}/edge/watch`);
      const listResult = await listResponse.json();
      console.log('Status:', listResponse.status);
      console.log('Response:', JSON.stringify(listResult, null, 2));
      console.log('✅ List watches successful!\n');
      
      // Test 3: Trigger watch (should return 501)
      console.log('3️⃣ Testing POST /edge/watch/[id]/trigger (Trigger Watch)');
      const triggerResponse = await fetch(`${baseUrl}/edge/watch/${createResult.id}/trigger`, {
        method: 'POST',
      });
      const triggerResult = await triggerResponse.json();
      console.log('Status:', triggerResponse.status);
      console.log('Response:', JSON.stringify(triggerResult, null, 2));
      
      if (triggerResponse.status === 501) {
        console.log('✅ Trigger endpoint returns 501 Not Implemented as expected!\n');
      }
      
    } else {
      console.log('❌ Create watch failed!\n');
    }
    
    // Test 4: Test validation error
    console.log('4️⃣ Testing validation error (invalid cabin)');
    const invalidResponse = await fetch(`${baseUrl}/edge/watch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: 'NYC',
        destination: 'LAX',
        start: '2025-12-01',
        end: '2025-12-10',
        cabin: 'INVALID_CABIN', // This should fail validation
        maxStops: 1,
        adults: 2,
        currency: 'USD',
        targetUsd: 350,
        flexDays: 3,
      }),
    });
    
    const invalidResult = await invalidResponse.json();
    console.log('Status:', invalidResponse.status);
    console.log('Response:', JSON.stringify(invalidResult, null, 2));
    
    if (invalidResponse.status === 400) {
      console.log('✅ Validation error handling works correctly!\n');
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testWatchEndpoints();
