/**
 * Database Migration: Add tripType column to watches table
 * This migration adds the tripType field to store user's flight type preference
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'watches.db');
const db = new Database(dbPath);

console.log('🗄️ Starting tripType migration...');

try {
    // Check if the tripType column already exists
    const tableInfo = db.prepare("PRAGMA table_info(watches)").all();
    const hasTripType = tableInfo.some(column => column.name === 'tripType');

    if (hasTripType) {
        console.log('✅ tripType column already exists, no migration needed');
        process.exit(0);
    }

    // Begin transaction
    db.exec('BEGIN TRANSACTION');

    // Add the tripType column with default value 'roundtrip' 
    // (assuming existing watches were created for round-trip flights)
    db.exec(`ALTER TABLE watches ADD COLUMN tripType TEXT DEFAULT 'roundtrip'`);

    // Update all existing records to have tripType = 'roundtrip'
    // This is a safe default since most existing watches were likely round-trip
    const updateResult = db.prepare(`UPDATE watches SET tripType = 'roundtrip' WHERE tripType IS NULL`).run();

    console.log(`📊 Updated ${updateResult.changes} existing watches with tripType = 'roundtrip'`);

    // Commit transaction
    db.exec('COMMIT');

    console.log('✅ Migration completed successfully!');
    console.log('📄 All existing watches now have tripType = "roundtrip"');
    console.log('🔄 New watches will use the tripType specified by users');

} catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
