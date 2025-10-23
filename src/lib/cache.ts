/**
 * Simple in-memory cache for flight search results
 * TTL: 300 seconds (5 minutes)
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly defaultTTL = 300; // 5 minutes in seconds

    /**
     * Generate cache key from search parameters
     */
    generateKey(params: {
        origin: string;
        destination: string;
        departureDate: string;
        returnDate?: string;
        adults: number;
        children?: number;
        infants?: number;
    }): string {
        // Create consistent key by sorting and stringifying
        const normalizedParams = {
            origin: params.origin.toUpperCase(),
            destination: params.destination.toUpperCase(),
            departureDate: params.departureDate,
            returnDate: params.returnDate || null,
            adults: params.adults,
            children: params.children || 0,
            infants: params.infants || 0,
        };

        return JSON.stringify(normalizedParams);
    }

    /**
     * Get cached data if exists and not expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Math.floor(Date.now() / 1000);
        const isExpired = (now - entry.timestamp) > entry.ttl;

        if (isExpired) {
            console.log(`🕐 Cache entry expired for key: ${key.substring(0, 50)}...`);
            this.cache.delete(key);
            return null;
        }

        console.log(`✅ Cache HIT for flight search: ${key.substring(0, 50)}...`);
        return entry.data;
    }

    /**
     * Set cache data with TTL
     */
    set<T>(key: string, data: T, ttlSeconds?: number): void {
        const ttl = ttlSeconds || this.defaultTTL;
        const timestamp = Math.floor(Date.now() / 1000);

        this.cache.set(key, {
            data,
            timestamp,
            ttl,
        });

        console.log(`💾 Cache SET for flight search: ${key.substring(0, 50)}... (TTL: ${ttl}s)`);
    }

    /**
     * Clear expired entries (cleanup)
     */
    cleanup(): void {
        const now = Math.floor(Date.now() / 1000);
        let cleanedCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            if ((now - entry.timestamp) > entry.ttl) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired entries`);
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        totalEntries: number;
        validEntries: number;
        expiredEntries: number;
    } {
        const now = Math.floor(Date.now() / 1000);
        let validEntries = 0;
        let expiredEntries = 0;

        for (const entry of this.cache.values()) {
            if ((now - entry.timestamp) > entry.ttl) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
        };
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        const count = this.cache.size;
        this.cache.clear();
        console.log(`🗑️ Cache cleared: removed ${count} entries`);
    }
}

// Export singleton instance
export const flightCache = new MemoryCache();

// Periodic cleanup every 10 minutes
if (typeof window === 'undefined') { // Only run on server
    setInterval(() => {
        flightCache.cleanup();
    }, 10 * 60 * 1000); // 10 minutes
}
