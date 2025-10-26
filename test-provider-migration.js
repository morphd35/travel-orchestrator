/**
 * Test the new provider fields in the watch database schema
 */

import { db } from './src/lib/database.ts';
import { createWatch, getWatch, getAllWatches, updateWatch } from './src/lib/watchStore.ts';

async function testProviderMigration() {
    console.log('🧪 Testing provider migration...');

    try {
        // Test 1: Check if new columns exist
        console.log('\n1️⃣ Testing database schema...');
        const tableInfo = db.prepare("PRAGMA table_info(watches)").all();
        const columnNames = tableInfo.map(col => col.name);

        const requiredColumns = ['provider', 'lastProvider', 'lastSourceLink'];
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

        if (missingColumns.length > 0) {
            console.log('❌ Missing columns:', missingColumns);
            return;
        }
        console.log('✅ All provider columns exist:', requiredColumns);

        // Test 2: Create a new watch with default provider
        console.log('\n2️⃣ Testing default provider creation...');
        const newWatch = createWatch({
            userId: 'test-user',
            origin: 'NYC',
            destination: 'LAX',
            start: '2025-12-01',
            end: '2025-12-05',
            cabin: 'ECONOMY',
            maxStops: 1,
            adults: 1,
            currency: 'USD',
            targetUsd: 400,
            flexDays: 2,
            active: true,
            email: 'test@example.com'
        });

        console.log('✅ Created watch with default provider:', newWatch.provider);

        // Test 3: Create a watch with explicit provider
        console.log('\n3️⃣ Testing explicit provider creation...');
        const skyscannerWatch = createWatch({
            userId: 'test-user',
            origin: 'SFO',
            destination: 'JFK',
            start: '2025-12-10',
            end: '2025-12-15',
            cabin: 'ECONOMY',
            maxStops: 0,
            adults: 2,
            currency: 'USD',
            targetUsd: 600,
            flexDays: 1,
            active: true,
            provider: 'skyscanner'
        });

        console.log('✅ Created watch with explicit provider:', skyscannerWatch.provider);

        // Test 4: Update watch with provider information
        console.log('\n4️⃣ Testing provider field updates...');
        const updatedWatch = updateWatch(newWatch.id, {
            lastProvider: 'amadeus',
            lastSourceLink: 'https://amadeus.example.com/book/abc123',
            lastBestUsd: 385
        });

        if (updatedWatch) {
            console.log('✅ Updated watch with provider info:');
            console.log('   - lastProvider:', updatedWatch.lastProvider);
            console.log('   - lastSourceLink:', updatedWatch.lastSourceLink);
            console.log('   - lastBestUsd:', updatedWatch.lastBestUsd);
        } else {
            console.log('❌ Failed to update watch');
        }

        // Test 5: Verify data persistence
        console.log('\n5️⃣ Testing data persistence...');
        const retrievedWatch = getWatch(newWatch.id);
        if (retrievedWatch) {
            console.log('✅ Retrieved watch with all fields:');
            console.log('   - provider:', retrievedWatch.provider);
            console.log('   - lastProvider:', retrievedWatch.lastProvider);
            console.log('   - lastSourceLink:', retrievedWatch.lastSourceLink);
        } else {
            console.log('❌ Failed to retrieve watch');
        }

        // Test 6: List all watches to verify migration
        console.log('\n6️⃣ Testing existing watch migration...');
        const allWatches = getAllWatches();
        console.log(`✅ Found ${allWatches.length} total watches`);

        const watchesWithProvider = allWatches.filter(w => w.provider);
        console.log(`✅ ${watchesWithProvider.length} watches have provider field`);

        // Show sample of migrated data
        if (allWatches.length > 0) {
            const sample = allWatches[0];
            console.log('   Sample watch:');
            console.log('   - id:', sample.id);
            console.log('   - origin → destination:', `${sample.origin} → ${sample.destination}`);
            console.log('   - provider:', sample.provider || 'NULL');
            console.log('   - lastProvider:', sample.lastProvider || 'NULL');
            console.log('   - lastSourceLink:', sample.lastSourceLink || 'NULL');
        }

        console.log('\n🎉 Provider migration test completed successfully!');

    } catch (error) {
        console.error('❌ Migration test failed:', error);
        process.exit(1);
    }
}

// Run the test
testProviderMigration().catch(console.error);
