/**
 * Direct test of the generateDateCombinations function
 */

// Copy the function from the trigger route for testing
function generateDateCombinations(start, end, flexDays, tripType) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const combinations = [];

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Helper to add days to a date
    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    // Generate depart dates within the window
    const current = new Date(startDate);
    const departDates = [];

    while (current <= endDate) {
        departDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    // Add flexibility around start and end if flexDays > 0
    if (flexDays > 0) {
        for (let i = 1; i <= flexDays; i++) {
            const beforeStart = addDays(startDate, -i);
            const afterEnd = addDays(endDate, i);

            if (beforeStart >= new Date()) { // Don't go into the past
                departDates.unshift(beforeStart);
            }
            departDates.push(afterEnd);
        }
    }

    // Generate combinations based on user's trip type preference
    let count = 0;
    const maxCombinations = tripType === "oneway" ? 15 : 10; // Allow more one-way searches since they're simpler

    for (const departDate of departDates) {
        if (count >= maxCombinations) break;

        if (tripType === "oneway") {
            // Only generate one-way combinations
            combinations.push({
                depart: formatDate(departDate)
            });
            count++;
        } else {
            // Only generate round-trip combinations
            // Try round-trip with 7-day stay
            const returnDate = addDays(departDate, 7);
            if (returnDate <= addDays(endDate, flexDays)) {
                combinations.push({
                    depart: formatDate(departDate),
                    return: formatDate(returnDate)
                });
                count++;
            }

            if (count >= maxCombinations) break;

            // If flexDays > 0, try +/- 2 days for return
            if (flexDays > 0) {
                for (const returnOffset of [5, 9]) { // 7-2 and 7+2 days
                    if (count >= maxCombinations) break;

                    const flexReturnDate = addDays(departDate, returnOffset);
                    if (flexReturnDate <= addDays(endDate, flexDays)) {
                        combinations.push({
                            depart: formatDate(departDate),
                            return: formatDate(flexReturnDate)
                        });
                        count++;
                    }
                }
            }
        }
    }

    return combinations.slice(0, maxCombinations);
}

console.log('🧪 Testing generateDateCombinations function...\n');

// Test parameters
const testParams = {
    start: '2024-12-01',
    end: '2024-12-05',
    flexDays: 2
};

console.log('📋 Test Parameters:');
console.log(`   Date Range: ${testParams.start} to ${testParams.end}`);
console.log(`   Flex Days: ${testParams.flexDays}\n`);

// Test one-way trip type
console.log('✈️ Testing ONE-WAY trip type:');
const onewayResults = generateDateCombinations(testParams.start, testParams.end, testParams.flexDays, 'oneway');
console.log(`   Generated ${onewayResults.length} combinations:`);
onewayResults.forEach((combo, index) => {
    console.log(`   ${index + 1}. ${combo.depart}${combo.return ? ` → ${combo.return}` : ' (one-way)'}`);
});

console.log('\n🔄 Testing ROUND-TRIP trip type:');
const roundtripResults = generateDateCombinations(testParams.start, testParams.end, testParams.flexDays, 'roundtrip');
console.log(`   Generated ${roundtripResults.length} combinations:`);
roundtripResults.forEach((combo, index) => {
    console.log(`   ${index + 1}. ${combo.depart}${combo.return ? ` → ${combo.return}` : ' (one-way)'}`);
});

console.log('\n🎯 Validation Results:');
const onewayHasReturns = onewayResults.some(combo => combo.return);
const roundtripMissingReturns = roundtripResults.some(combo => !combo.return);

console.log(`   ✅ One-way results (should have NO return dates): ${onewayHasReturns ? '❌ FAILED' : '✅ PASSED'}`);
console.log(`   ✅ Round-trip results (should ALL have return dates): ${roundtripMissingReturns ? '❌ FAILED' : '✅ PASSED'}`);

if (!onewayHasReturns && !roundtripMissingReturns) {
    console.log('\n🎉 All tests PASSED! Trip type preferences are working correctly.');
} else {
    console.log('\n❌ Some tests FAILED. Check the logic above.');
}
