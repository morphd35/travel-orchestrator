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
  lastBestUsd?: number;
  lastNotifiedUsd?: number;
  createdAt: string;
  updatedAt: string;
};

// In-memory storage - can be swapped to Postgres later
const watchStore = new Map<string, Watch>();

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
  
  watchStore.set(watch.id, watch);
  return watch;
}

/**
 * List all watches for a specific user
 */
export function listWatches(userId: string): Watch[] {
  const watches: Watch[] = [];
  for (const watch of watchStore.values()) {
    if (watch.userId === userId) {
      watches.push(watch);
    }
  }
  // Sort by creation date, newest first
  return watches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get a specific watch by ID
 */
export function getWatch(id: string): Watch | null {
  return watchStore.get(id) || null;
}

/**
 * Update a watch with partial data
 */
export function updateWatch(id: string, patch: Partial<Omit<Watch, 'id' | 'createdAt'>>): Watch | null {
  const existingWatch = watchStore.get(id);
  if (!existingWatch) {
    return null;
  }
  
  const updatedWatch: Watch = {
    ...existingWatch,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  
  watchStore.set(id, updatedWatch);
  return updatedWatch;
}

/**
 * Delete a watch by ID
 */
export function deleteWatch(id: string): boolean {
  return watchStore.delete(id);
}

/**
 * Get all watches (useful for admin/debugging)
 */
export function getAllWatches(): Watch[] {
  return Array.from(watchStore.values());
}

/**
 * Clear all watches (useful for testing)
 */
export function clearAllWatches(): void {
  watchStore.clear();
}
