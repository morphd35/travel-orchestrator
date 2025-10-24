import { db } from './database';

export type Watch = {
    id: string;
    userId: string; // for now, "anon" is fine
    origin: string;
    destination: string;
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    cabin: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
    maxStops: number;
    adults: number;
    currency: "USD";
    targetUsd: number;
    flexDays: number;
    active: boolean;
    email?: string; // User's email for notifications
    lastBestUsd?: number;
    lastNotifiedUsd?: number;
    createdAt: string;
    updatedAt: string;
};

// Database prepared statements
const insertWatch = db.prepare(`
  INSERT INTO watches (
    id, userId, origin, destination, start, end, cabin, maxStops, adults, 
    currency, targetUsd, flexDays, active, email, lastBestUsd, lastNotifiedUsd, 
    createdAt, updatedAt
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const selectWatchesByUserId = db.prepare(`
  SELECT * FROM watches WHERE userId = ? ORDER BY createdAt DESC
`);

const selectWatchById = db.prepare(`
  SELECT * FROM watches WHERE id = ?
`);

const updateWatchById = db.prepare(`
  UPDATE watches SET 
    userId = ?, origin = ?, destination = ?, start = ?, end = ?, cabin = ?, 
    maxStops = ?, adults = ?, currency = ?, targetUsd = ?, flexDays = ?, 
    active = ?, email = ?, lastBestUsd = ?, lastNotifiedUsd = ?, updatedAt = ?
  WHERE id = ?
`);

const deleteWatchById = db.prepare(`
  DELETE FROM watches WHERE id = ?
`);

const selectAllWatches = db.prepare(`
  SELECT * FROM watches ORDER BY createdAt DESC
`);

const clearAllWatchesStmt = db.prepare(`
  DELETE FROM watches
`);

/**
 * Generate a unique ID for a watch
 */
function generateId(): string {
    return `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new watch
 */
export function createWatch(watchData: Omit<Watch, 'id' | 'createdAt' | 'updatedAt'>): Watch {
    const now = new Date().toISOString();
    const watch: Watch = {
        ...watchData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
    };

    insertWatch.run(
        watch.id, watch.userId, watch.origin, watch.destination, watch.start, watch.end,
        watch.cabin, watch.maxStops, watch.adults, watch.currency, watch.targetUsd,
        watch.flexDays, watch.active ? 1 : 0, watch.email || null, watch.lastBestUsd || null, 
        watch.lastNotifiedUsd || null, watch.createdAt, watch.updatedAt
    );

    return watch;
}

/**
 * List all watches for a specific user
 */
export function listWatches(userId: string): Watch[] {
    const rows = selectWatchesByUserId.all(userId) as any[];
    return rows.map(row => ({
        ...row,
        active: Boolean(row.active),
        lastBestUsd: row.lastBestUsd || undefined,
        lastNotifiedUsd: row.lastNotifiedUsd || undefined
    }));
}

/**
 * Get a specific watch by ID
 */
export function getWatch(id: string): Watch | null {
    const row = selectWatchById.get(id) as any;
    if (!row) return null;
    
    return {
        ...row,
        active: Boolean(row.active),
        lastBestUsd: row.lastBestUsd || undefined,
        lastNotifiedUsd: row.lastNotifiedUsd || undefined
    };
}

/**
 * Update a watch with partial data
 */
export function updateWatch(id: string, patch: Partial<Omit<Watch, 'id' | 'createdAt'>>): Watch | null {
    const existingWatch = getWatch(id);
    if (!existingWatch) {
        return null;
    }

    const updatedWatch: Watch = {
        ...existingWatch,
        ...patch,
        updatedAt: new Date().toISOString(),
    };

    updateWatchById.run(
        updatedWatch.userId, updatedWatch.origin, updatedWatch.destination,
        updatedWatch.start, updatedWatch.end, updatedWatch.cabin, updatedWatch.maxStops,
        updatedWatch.adults, updatedWatch.currency, updatedWatch.targetUsd,
        updatedWatch.flexDays, updatedWatch.active ? 1 : 0, updatedWatch.email || null,
        updatedWatch.lastBestUsd || null, updatedWatch.lastNotifiedUsd || null,
        updatedWatch.updatedAt, updatedWatch.id
    );
    
    return updatedWatch;
}

/**
 * Delete a watch by ID
 */
export function deleteWatch(id: string): boolean {
    const result = deleteWatchById.run(id);
    return result.changes > 0;
}

/**
 * Get all watches (useful for admin/debugging)
 */
export function getAllWatches(): Watch[] {
    const rows = selectAllWatches.all() as any[];
    return rows.map(row => ({
        ...row,
        active: Boolean(row.active),
        lastBestUsd: row.lastBestUsd || undefined,
        lastNotifiedUsd: row.lastNotifiedUsd || undefined
    }));
}

/**
 * Clear all watches (useful for testing)
 */
export function clearAllWatches(): void {
    clearAllWatchesStmt.run();
}
