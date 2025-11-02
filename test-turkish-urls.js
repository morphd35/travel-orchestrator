// Test Turkish Airlines URL generation
const { createRequire } = require('module');

// Test the URL generation functions
function testTurkishAirlinesUrl() {
    console.log('🧪 Testing Turkish Airlines URL generation...\n');

    // Test data matching the user's 404 URL
    const testParams = {
        origin: 'DFW',
        destination: 'FCO',
        departDate: '2026-04-25',
        returnDate: '2026-05-02',
        adults: 1
    };

    console.log('Test parameters:', testParams);

    // Generate URL like partnerBooking.ts does
    const params1 = new URLSearchParams({
        'origin-airport': testParams.origin,
        'destination-airport': testParams.destination,
        'departure-date': testParams.departDate,
        'return-date': testParams.returnDate,
        'adult-count': testParams.adults.toString(),
    });

    const url1 = `https://www.turkishairlines.com/en-int/flights/book-flight/?${params1.toString()}`;
    console.log('\n📋 Generated URL (partnerBooking.ts style):');
    console.log(url1);

    // Generate URL like watch trigger does
    const params2 = new URLSearchParams({
        'origin-airport': testParams.origin,
        'destination-airport': testParams.destination,
        'departure-date': testParams.departDate,
        'adult-count': testParams.adults.toString(),
    });

    if (testParams.returnDate) {
        params2.set('return-date', testParams.returnDate);
    }

    const url2 = `https://www.turkishairlines.com/en-int/flights/book-flight/?${params2.toString()}`;
    console.log('\n📋 Generated URL (watch trigger style):');
    console.log(url2);

    // Compare with user's 404 URL
    const userUrl = 'https://www.turkishairlines.com/en-int/flights/book-flight/?origin-airport=DFW&destination-airport=FCO&departure-date=2026-04-25&return-date=2026-05-02&adult-count=1';
    console.log('\n❌ User\'s 404 URL:');
    console.log(userUrl);

    console.log('\n🔍 URL Analysis:');
    console.log('Generated URL matches user URL:', url1 === userUrl ? '✅ YES' : '❌ NO');
    console.log('Generated URL 2 matches user URL:', url2 === userUrl ? '✅ YES' : '❌ NO');

    // Let's check what the actual Turkish Airlines booking page expects
    console.log('\n🌐 Let\'s test different URL formats Turkish Airlines might accept...');

    // Format 1: Standard query parameters
    const format1 = new URLSearchParams({
        from: testParams.origin,
        to: testParams.destination,
        departure: testParams.departDate,
        return: testParams.returnDate,
        passengers: testParams.adults.toString(),
    });
    console.log('\nFormat 1 (standard): https://www.turkishairlines.com/en-int/flights/book-flight/?' + format1.toString());

    // Format 2: Different parameter names
    const format2 = new URLSearchParams({
        originCode: testParams.origin,
        destinationCode: testParams.destination,
        departureDate: testParams.departDate,
        returnDate: testParams.returnDate,
        adultCount: testParams.adults.toString(),
    });
    console.log('\nFormat 2 (alt names): https://www.turkishairlines.com/en-int/flights/book-flight/?' + format2.toString());

    // Format 3: Minimal parameters
    const format3 = new URLSearchParams({
        orig: testParams.origin,
        dest: testParams.destination,
        dept: testParams.departDate,
        ret: testParams.returnDate,
        pax: testParams.adults.toString(),
    });
    console.log('\nFormat 3 (minimal): https://www.turkishairlines.com/en-int/flights/book-flight/?' + format3.toString());

    // Check if we should be using different base URL
    console.log('\n🔗 Alternative base URLs to try:');
    console.log('- https://www.turkishairlines.com/en-int/flights/');
    console.log('- https://www.turkishairlines.com/en-us/flights/book-flight/');
    console.log('- https://www.turkishairlines.com/flights/book-flight/');
    console.log('- https://book.turkishairlines.com/');

    console.log('\n🚀 Test complete. Check URLs manually to see which format works.');
}

testTurkishAirlinesUrl();
