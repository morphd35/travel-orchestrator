// Test the temporary password generation logic
const crypto = require('crypto');

const email = 'morphd335@yahoo.com';
const jwtSecret = 'your-super-secret-jwt-key-change-in-production-123456789';

// Current timestamp (15-minute windows)
const currentTimestamp = Math.floor(Date.now() / (15 * 60 * 1000));
const previousTimestamp = currentTimestamp - 1;

console.log('Current timestamp:', currentTimestamp);
console.log('Previous timestamp:', previousTimestamp);

for (const timestamp of [currentTimestamp, previousTimestamp]) {
    const tempPasswordSeed = `${email}-${timestamp}-${jwtSecret}`;
    const tempPassword = crypto.createHash('md5').update(tempPasswordSeed).digest('hex').slice(0, 8).toUpperCase();

    console.log(`Timestamp ${timestamp}: ${tempPassword}`);
}

console.log('---');
console.log('Time now:', new Date().toISOString());
console.log('Current 15-min window started:', new Date(currentTimestamp * 15 * 60 * 1000).toISOString());
