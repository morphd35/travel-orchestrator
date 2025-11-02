// Test different Turkish Airlines URL formats to find the working one
const https = require('https');
const { URL } = require('url');

// Test function to check if a URL returns 200 OK
function testUrl(url) {
    return new Promise((resolve) => {
        try {
            const parsedUrl = new URL(url);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'HEAD', // Use HEAD to avoid downloading full response
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            const req = https.request(options, (res) => {
                resolve({
                    url,
                    status: res.statusCode,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });

            req.on('error', (error) => {
                resolve({
                    url,
                    status: 'ERROR',
                    success: false,
                    error: error.message
                });
            });

            req.setTimeout(10000, () => {
                req.destroy();
                resolve({
                    url,
                    status: 'TIMEOUT',
                    success: false,
                    error: 'Request timeout'
                });
            });

            req.end();
        } catch (error) {
            resolve({
                url,
                status: 'INVALID',
                success: false,
                error: error.message
            });
        }
    });
}

async function testTurkishAirlinesUrls() {
    console.log('🧪 Testing Turkish Airlines URL formats...\n');

    const testParams = {
        origin: 'DFW',
        destination: 'FCO',
        departDate: '2026-04-25',
        returnDate: '2026-05-02',
        adults: 1
    };

    // Define different URL formats to test
    const urlFormats = [
        // Current format (known to 404)
        {
            name: 'Current Format (known 404)',
            base: 'https://www.turkishairlines.com/en-int/flights/book-flight/',
            params: new URLSearchParams({
                'origin-airport': testParams.origin,
                'destination-airport': testParams.destination,
                'departure-date': testParams.departDate,
                'return-date': testParams.returnDate,
                'adult-count': testParams.adults.toString()
            })
        },

        // Alternative base URLs
        {
            name: 'Base flights page',
            base: 'https://www.turkishairlines.com/en-int/flights/',
            params: new URLSearchParams({
                'origin-airport': testParams.origin,
                'destination-airport': testParams.destination,
                'departure-date': testParams.departDate,
                'return-date': testParams.returnDate,
                'adult-count': testParams.adults.toString()
            })
        },

        {
            name: 'EN-US Locale',
            base: 'https://www.turkishairlines.com/en-us/flights/book-flight/',
            params: new URLSearchParams({
                'origin-airport': testParams.origin,
                'destination-airport': testParams.destination,
                'departure-date': testParams.departDate,
                'return-date': testParams.returnDate,
                'adult-count': testParams.adults.toString()
            })
        },

        {
            name: 'Root flights path',
            base: 'https://www.turkishairlines.com/flights/book-flight/',
            params: new URLSearchParams({
                'origin-airport': testParams.origin,
                'destination-airport': testParams.destination,
                'departure-date': testParams.departDate,
                'return-date': testParams.returnDate,
                'adult-count': testParams.adults.toString()
            })
        },

        // Standard parameter names
        {
            name: 'Standard params (from/to)',
            base: 'https://www.turkishairlines.com/en-int/flights/book-flight/',
            params: new URLSearchParams({
                from: testParams.origin,
                to: testParams.destination,
                departure: testParams.departDate,
                return: testParams.returnDate,
                passengers: testParams.adults.toString()
            })
        },

        {
            name: 'Origin/Destination params',
            base: 'https://www.turkishairlines.com/en-int/flights/book-flight/',
            params: new URLSearchParams({
                origin: testParams.origin,
                destination: testParams.destination,
                departureDate: testParams.departDate,
                returnDate: testParams.returnDate,
                adults: testParams.adults.toString()
            })
        },

        // Try book subdomain
        {
            name: 'Book subdomain',
            base: 'https://book.turkishairlines.com/',
            params: new URLSearchParams({
                from: testParams.origin,
                to: testParams.destination,
                departure: testParams.departDate,
                return: testParams.returnDate,
                passengers: testParams.adults.toString()
            })
        },

        // Try different path structure
        {
            name: 'Search path',
            base: 'https://www.turkishairlines.com/en-int/search/',
            params: new URLSearchParams({
                from: testParams.origin,
                to: testParams.destination,
                departure: testParams.departDate,
                return: testParams.returnDate,
                passengers: testParams.adults.toString()
            })
        }
    ];

    console.log(`Testing ${urlFormats.length} different URL formats...\n`);

    for (const format of urlFormats) {
        const fullUrl = `${format.base}?${format.params.toString()}`;
        console.log(`Testing: ${format.name}`);
        console.log(`URL: ${fullUrl}`);

        const result = await testUrl(fullUrl);
        console.log(`Status: ${result.status} ${result.success ? '✅' : '❌'}`);
        if (result.error) {
            console.log(`Error: ${result.error}`);
        }
        console.log('---');
    }

    console.log('\n🔍 Manual Testing Recommendations:');
    console.log('1. Visit https://www.turkishairlines.com/en-int/ manually');
    console.log('2. Try to book a flight DFW → FCO for 2026-04-25');
    console.log('3. Inspect the actual URL structure used by their booking form');
    console.log('4. Check browser developer tools Network tab for the actual API calls');

    console.log('\n💡 Alternative Solutions:');
    console.log('- Use Google Flights fallback for Turkish Airlines booking');
    console.log('- Direct users to Turkish Airlines homepage with note to search manually');
    console.log('- Try to find Turkish Airlines API documentation for partner booking');
}

testTurkishAirlinesUrls().catch(console.error);
