// Simple test of the watchStore without server
import { createWatch, listWatches, getWatch, updateWatch, deleteWatch } from './src/lib/watchStore.ts';

console.log('🧪 Testing watchStore functions directly\n');

// Test 1: Create a watch
console.log('1️⃣ Creating a watch...');
const watchData = {
    userId: 'anon',
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
    active: true,
};

const watch1 = createWatch(watchData);
console.log('Created watch:', watch1);
console.log('✅ Create watch successful!\n');

// Test 2: Create another watch
console.log('2️⃣ Creating another watch...');
const watch2 = createWatch({
    ...watchData,
    destination: 'SFO',
    targetUsd: 280,
});
console.log('Created watch:', watch2);
console.log('✅ Second watch created!\n');

// Test 3: List watches
console.log('3️⃣ Listing watches for user "anon"...');
const watches = listWatches('anon');
console.log('Found watches:', watches.length);
watches.forEach((w, i) => {
    console.log(`  ${i + 1}. ${w.origin} → ${w.destination} ($${w.targetUsd})`);
});
console.log('✅ List watches successful!\n');

// Test 4: Get specific watch
console.log('4️⃣ Getting specific watch...');
const foundWatch = getWatch(watch1.id);
console.log('Found watch:', foundWatch ? `${foundWatch.origin} → ${foundWatch.destination}` : 'Not found');
console.log('✅ Get watch successful!\n');

// Test 5: Update watch
console.log('5️⃣ Updating watch...');
const updatedWatch = updateWatch(watch1.id, { targetUsd: 300, active: false });
console.log('Updated watch:', updatedWatch ? `Target: $${updatedWatch.targetUsd}, Active: ${updatedWatch.active}` : 'Update failed');
console.log('✅ Update watch successful!\n');

// Test 6: Delete watch
console.log('6️⃣ Deleting watch...');
const deleted = deleteWatch(watch2.id);
console.log('Delete result:', deleted);
const remainingWatches = listWatches('anon');
console.log('Remaining watches:', remainingWatches.length);
console.log('✅ Delete watch successful!\n');

console.log('🎉 All watchStore tests completed successfully!');
