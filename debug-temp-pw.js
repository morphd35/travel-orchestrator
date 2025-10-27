// Test what the temp password should be at 3:31 PM
const crypto = require('crypto');

const email = 'morphd335@yahoo.com';
const jwtSecret = 'your-super-secret-jwt-key-change-in-production-123456789';

// 3:31 PM would be around timestamp for that time
const now = new Date();
console.log('Current time:', now.toLocaleString());

const currentTimestamp = Math.floor(Date.now() / (15 * 60 * 1000));
const previousTimestamp = currentTimestamp - 1;
const nextTimestamp = currentTimestamp + 1;

console.log('Current timestamp:', currentTimestamp);
console.log('Previous timestamp:', previousTimestamp);
console.log('Next timestamp:', nextTimestamp);

for (const timestamp of [previousTimestamp, currentTimestamp, nextTimestamp]) {
    const tempPasswordSeed = `${email}-${timestamp}-${jwtSecret}`;
    const tempPassword = crypto.createHash('md5').update(tempPasswordSeed).digest('hex').slice(0, 8).toUpperCase();

    const timeWindow = new Date(timestamp * 15 * 60 * 1000);
    console.log(`Timestamp ${timestamp} (${timeWindow.toLocaleString()}): ${tempPassword}`);
}
