// Quick test for airport code resolution
const fs = require('fs');
const path = require('path');

// Read the TypeScript file and extract the mapping
const airlineUtilsPath = path.join(__dirname, 'src', 'lib', 'airlineUtils.ts');
const content = fs.readFileSync(airlineUtilsPath, 'utf8');

// Extract AIRPORT_NAMES mapping (it's an object with city/country structure)
const airportNamesMatch = content.match(/export const AIRPORT_NAMES[^{]*\{([\s\S]*?)\n\};/);
if (airportNamesMatch) {
    // Parse the mapping manually for object structure
    const mappingText = airportNamesMatch[1];
    const lines = mappingText.split('\n').filter(line => line.trim().includes(':') && line.includes('city'));

    const airportNames = {};
    lines.forEach(line => {
        const codeMatch = line.match(/['"](\w+)['"]:\s*\{/);
        const cityMatch = line.match(/city:\s*['"]([^'"]*)['"]/);
        const countryMatch = line.match(/country:\s*['"]([^'"]*)['"]/);
        if (codeMatch && cityMatch && countryMatch) {
            airportNames[codeMatch[1]] = `${cityMatch[1]}, ${countryMatch[1]}`;
        }
    });

    console.log('Testing airport code resolution:');
    console.log('IAH ->', airportNames['IAH'] || 'NOT FOUND');
    console.log('HOU ->', airportNames['HOU'] || 'NOT FOUND');
    console.log('DCA ->', airportNames['DCA'] || 'NOT FOUND');
    console.log('CLT ->', airportNames['CLT'] || 'NOT FOUND');
    console.log('STL ->', airportNames['STL'] || 'NOT FOUND');
    console.log('AUS ->', airportNames['AUS'] || 'NOT FOUND');
    console.log('MEM ->', airportNames['MEM'] || 'NOT FOUND');
    console.log('BNA ->', airportNames['BNA'] || 'NOT FOUND');

    console.log('\nTotal airport codes mapped:', Object.keys(airportNames).length);
} else {
    console.log('Could not find AIRPORT_NAMES mapping');
}
