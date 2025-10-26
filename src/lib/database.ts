import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'travel_orchestrator.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create users table
const createUsersTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_airlines TEXT DEFAULT '[]',
    preferred_airports TEXT DEFAULT '[]',
    seat_preference TEXT DEFAULT 'aisle',
    meal_preference TEXT DEFAULT 'standard',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

createUsersTable.run();

// Create user sessions table for JWT management
const createSessionsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

createSessionsTable.run();

// Create user bookings table
const createBookingsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    booking_reference TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    depart_date TEXT NOT NULL,
    return_date TEXT,
    passengers INTEGER NOT NULL,
    passenger_details TEXT NOT NULL, -- JSON string
    total_amount REAL NOT NULL,
    currency TEXT NOT NULL,
    airline TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    contact_email TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

createBookingsTable.run();

// Create user searches table
const createSearchesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS searches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    depart_date TEXT NOT NULL,
    return_date TEXT,
    adults INTEGER NOT NULL,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    cabin_class TEXT DEFAULT 'economy',
    currency TEXT DEFAULT 'USD',
    result_count INTEGER NOT NULL,
    airlines TEXT NOT NULL, -- JSON string
    price_range TEXT, -- JSON string
    searched_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

createSearchesTable.run();

// Create passenger profiles table
const createPassengerProfilesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS passenger_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL, -- JSON string
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

createPassengerProfilesTable.run();

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
    provider TEXT DEFAULT 'amadeus',
    lastProvider TEXT,
    lastSourceLink TEXT,
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

// Add provider columns if they don't exist (migration for multi-provider support)
const providerMigrations = [
    { column: 'provider', type: 'TEXT DEFAULT "amadeus"' },
    { column: 'lastProvider', type: 'TEXT' },
    { column: 'lastSourceLink', type: 'TEXT' }
];

providerMigrations.forEach(({ column, type }) => {
    try {
        const addColumn = db.prepare(`ALTER TABLE watches ADD COLUMN ${column} ${type}`);
        addColumn.run();
        console.log(`✅ Added ${column} column to watches table`);
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            // Column already exists, ignore
        } else {
            console.log(`⚠️  Error adding ${column} column (may already exist):`, error.message);
        }
    }
});

// Add phone column to users table if it doesn't exist (migration for phone support)
try {
    const addPhoneColumn = db.prepare(`ALTER TABLE users ADD COLUMN phone TEXT`);
    addPhoneColumn.run();
    console.log('✅ Added phone column to users table');
} catch (error: any) {
    if (error.message.includes('duplicate column name')) {
        // Column already exists, ignore
    } else {
        console.log('⚠️  Error adding phone column (may already exist):', error.message);
    }
}

// Database utility functions
export const dbQueries = {
    // User management
    createUser: db.prepare(`
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

    getUserByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

    getUserById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),

    updateUser: db.prepare(`
    UPDATE users SET 
      first_name = ?, last_name = ?, phone = ?, preferred_airlines = ?, 
      preferred_airports = ?, seat_preference = ?, meal_preference = ?, 
      updated_at = ?
    WHERE id = ?
  `),

    // Session management
    createSession: db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `),

    getSession: db.prepare(`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `),

    deleteSession: db.prepare(`
    DELETE FROM sessions WHERE token_hash = ?
  `),

    deleteExpiredSessions: db.prepare(`
    DELETE FROM sessions WHERE expires_at <= ?
  `),

    // Booking management
    createBooking: db.prepare(`
    INSERT INTO bookings (
      id, user_id, booking_reference, origin, destination, depart_date, 
      return_date, passengers, passenger_details, total_amount, currency, 
      airline, booking_date, status, contact_email, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

    getUserBookings: db.prepare(`
    SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC
  `),

    // Search history management
    createSearch: db.prepare(`
    INSERT INTO searches (
      id, user_id, origin, destination, depart_date, return_date,
      adults, children, infants, cabin_class, currency, result_count,
      airlines, price_range, searched_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

    getUserSearches: db.prepare(`
    SELECT * FROM searches WHERE user_id = ? ORDER BY searched_at DESC LIMIT 10
  `),

    // Passenger profiles management
    createPassengerProfile: db.prepare(`
    INSERT INTO passenger_profiles (
      id, user_id, first_name, last_name, date_of_birth, gender,
      email, phone, address, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

    getUserPassengerProfiles: db.prepare(`
    SELECT * FROM passenger_profiles WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5
  `),

    updatePassengerProfile: db.prepare(`
    UPDATE passenger_profiles SET 
      first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
      email = ?, phone = ?, address = ?, updated_at = ?
    WHERE id = ?
  `),

    // Watch management (updated to include user_id)
    getUserWatches: db.prepare(`
    SELECT * FROM watches WHERE userId = ? ORDER BY createdAt DESC
  `)
};

export { db };
