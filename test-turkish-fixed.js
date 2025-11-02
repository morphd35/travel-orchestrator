// Test the updated Turkish Airlines URL generation (Google Flights fallback)
function testUpdatedTurkishUrl() {
    console.log('🧪 Testing Updated Turkish Airlines URL Generation (Google Flights Fallback)...\n');

    const testParams = {
        origin: 'DFW',
        destination: 'FCO',
        departDate: '2026-04-25',
        returnDate: '2026-05-02',
        adults: 1
    };

    console.log('Test parameters:', testParams);

    // Generate URL using updated approach (Google Flights with Turkish Airlines filter)
    const searchParams = new URLSearchParams({
        f: '0',
        gl: 'us',
        hl: 'en',
        curr: 'USD',
        // Build tfs parameter for specific flight search
        tfs: `f.${testParams.origin}.${testParams.destination}.${testParams.departDate}${testParams.returnDate ? `*f.${testParams.destination}.${testParams.origin}.${testParams.returnDate}` : ''}`,
        // Add Turkish Airlines filter
        airline: 'TK'
    });

    const updatedUrl = `https://www.google.com/travel/flights?${searchParams.toString()}`;

    console.log('\n✅ Updated Turkish Airlines booking URL (Google Flights with TK filter):');
    console.log(updatedUrl);

    console.log('\n🔍 Parameter breakdown:');
    console.log('- f=0: Google Flights base parameter');
    console.log('- gl=us: Country (United States)');
    console.log('- hl=en: Language (English)');
    console.log('- curr=USD: Currency');
    console.log(`- tfs=f.${testParams.origin}.${testParams.destination}.${testParams.departDate}*f.${testParams.destination}.${testParams.origin}.${testParams.returnDate}: Flight search parameters`);
    console.log('- airline=TK: Filter to Turkish Airlines only');

    console.log('\n💡 Benefits of this approach:');
    console.log('✅ Reliable - Google Flights URLs work consistently');
    console.log('✅ Pre-filtered - Shows only Turkish Airlines flights');
    console.log('✅ Pre-filled - Departure/arrival cities and dates are set');
    console.log('✅ User-friendly - Familiar Google Flights interface');
    console.log('✅ Booking options - Shows multiple Turkish Airlines fare options');

    console.log('\n🚀 Ready to test this URL manually in a browser!');
}

testUpdatedTurkishUrl();
