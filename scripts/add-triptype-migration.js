/**
 * Database migration to add tripType column to watches table
 * This adds support for one-way vs round-trip preferences in price watches
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'travel_orchestrator.db');

console.log('🔄 Running migration: Add tripType column to watches table');
console.log('Database path:', dbPath);

try {
    // Open database
    const db = new Database(dbPath);

    // Check if column already exists
    const pragma = db.prepare("PRAGMA table_info(watches)").all();
    const hasTriptyeColumn = pragma.some(col => col.name === 'tripType');

    if (hasTriptyeColumn) {
        console.log('✅ tripType column already exists, skipping migration');
        db.close();
        process.exit(0);
    }

    // Add tripType column with default value 'roundtrip'
    console.log('➕ Adding tripType column...');
    db.exec(`
        ALTER TABLE watches 
        ADD COLUMN tripType TEXT DEFAULT 'roundtrip'
    `);

    // Update existing watches to have explicit tripType based on whether they have end date
    console.log('🔄 Setting tripType for existing watches...');
    const updateStmt = db.prepare(`
        UPDATE watches 
        SET tripType = CASE 
            WHEN end IS NOT NULL AND end != '' THEN 'roundtrip'
            ELSE 'oneway'
        END
    `);

    const result = updateStmt.run();
    console.log(`📊 Updated ${result.changes} existing watches`);

    // Verify the changes
    const countStmt = db.prepare(`
        SELECT tripType, COUNT(*) as count 
        FROM watches 
        GROUP BY tripType
    `);

    const counts = countStmt.all();
    console.log('📈 Watch distribution by trip type:');
    counts.forEach(row => {
        console.log(`   ${row.tripType}: ${row.count} watches`);
    });

    console.log('✅ Migration completed successfully!');

    db.close();

} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
}
