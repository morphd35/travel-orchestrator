// Test script to verify Amadeus client caching behavior
async function testAmadeusClient() {
  const baseUrl = 'http://localhost:3010';
  
  console.log('🧪 Testing Amadeus Client Caching\n');
  
  // Test parameters
  const params = new URLSearchParams({
    origin: 'NYC',
    destination: 'LAX',
    departDate: '2025-12-01',
    adults: '2',
    max: '5'
  });
  
  try {
    console.log('1️⃣ First API call (should fetch from Amadeus)...');
    const start1 = Date.now();
    const response1 = await fetch(`${baseUrl}/api/test-amadeus?${params}`);
    const result1 = await response1.json();
    const duration1 = Date.now() - start1;
    
    console.log(`Status: ${response1.status}`);
    console.log(`Duration: ${duration1}ms`);
    console.log(`Results: ${result1.resultsCount} flights`);
    console.log(`Cache size: ${result1.cacheStats?.resultCacheSize || 0}`);
    console.log('✅ First call completed\n');
    
    if (response1.ok) {
      console.log('2️⃣ Second API call (should hit cache)...');
      const start2 = Date.now();
      const response2 = await fetch(`${baseUrl}/api/test-amadeus?${params}`);
      const result2 = await response2.json();
      const duration2 = Date.now() - start2;
      
      console.log(`Status: ${response2.status}`);
      console.log(`Duration: ${duration2}ms`);
      console.log(`Results: ${result2.resultsCount} flights`);
      console.log(`Cache size: ${result2.cacheStats?.resultCacheSize || 0}`);
      
      if (duration2 < duration1 / 2) {
        console.log('✅ Second call was significantly faster (likely cached)!');
      } else {
        console.log('⚠️ Second call took similar time (may not be cached)');
      }
      console.log('');
      
      // Test cache stats
      console.log('3️⃣ Checking cache stats...');
      const statsResponse = await fetch(`${baseUrl}/api/test-amadeus?action=stats`);
      const stats = await statsResponse.json();
      console.log('Cache stats:', JSON.stringify(stats, null, 2));
      console.log('✅ Cache stats retrieved\n');
      
      // Test validation error
      console.log('4️⃣ Testing validation error...');
      const badResponse = await fetch(`${baseUrl}/api/test-amadeus?origin=XX&destination=YY&departDate=invalid`);
      const badResult = await badResponse.json();
      console.log(`Status: ${badResponse.status}`);
      console.log('Error response:', JSON.stringify(badResult, null, 2));
      
      if (badResponse.status === 400) {
        console.log('✅ Validation error handling works correctly!\n');
      }
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testAmadeusClient();
