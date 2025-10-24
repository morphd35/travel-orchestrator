import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'watches.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create watches table if it doesn't exist
const createWatchesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS watches (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    cabin TEXT NOT NULL,
    maxStops INTEGER NOT NULL,
    adults INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    targetUsd REAL NOT NULL,
    flexDays INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    email TEXT,
    lastBestUsd REAL,
    lastNotifiedUsd REAL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

createWatchesTable.run();

// Add email column if it doesn't exist (migration for existing databases)
try {
  const addEmailColumn = db.prepare(`ALTER TABLE watches ADD COLUMN email TEXT`);
  addEmailColumn.run();
  console.log('✅ Added email column to watches table');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    // Column already exists, ignore
  } else {
    console.log('⚠️  Error adding email column (may already exist):', error.message);
  }
}

export { db };
