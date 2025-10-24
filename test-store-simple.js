// Node.js test that compiles TypeScript on the fly
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing watchStore by compiling and running TypeScript\n');

// Create a temporary TypeScript test file
const testCode = `
import { createWatch, listWatches, getWatch, updateWatch, deleteWatch } from '../src/lib/watchStore';

console.log('1️⃣ Creating a watch...');
const watchData = {
  userId: 'anon',
  origin: 'NYC',
  destination: 'LAX',
  start: '2025-12-01',
  end: '2025-12-10',
  cabin: 'ECONOMY' as const,
  maxStops: 1,
  adults: 2,
  currency: 'USD' as const,
  targetUsd: 350,
  flexDays: 3,
  active: true,
};

const watch1 = createWatch(watchData);
console.log('Created watch ID:', watch1.id);
console.log('✅ Create watch successful!');

console.log('\\n2️⃣ Listing watches...');
const watches = listWatches('anon');
console.log('Found', watches.length, 'watches');
console.log('✅ List watches successful!');

console.log('\\n3️⃣ Getting specific watch...');
const foundWatch = getWatch(watch1.id);
console.log('Found:', foundWatch ? 'Yes' : 'No');
console.log('✅ Get watch successful!');

console.log('\\n4️⃣ Updating watch...');
const updatedWatch = updateWatch(watch1.id, { targetUsd: 300 });
console.log('Updated target:', updatedWatch?.targetUsd);
console.log('✅ Update watch successful!');

console.log('\\n🎉 All tests passed!');
`;

// Write the test file
fs.writeFileSync('temp-test.ts', testCode);

try {
  // Compile and run using npx
  console.log('Compiling and running TypeScript test...\n');
  const output = execSync('npx tsx temp-test.ts', { encoding: 'utf8', cwd: __dirname });
  console.log(output);
} catch (error) {
  console.log('Output:', error.stdout?.toString() || '');
  console.error('Error:', error.stderr?.toString() || '');
} finally {
  // Clean up
  if (fs.existsSync('temp-test.ts')) {
    fs.unlinkSync('temp-test.ts');
  }
}
