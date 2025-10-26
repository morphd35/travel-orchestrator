/**
 * Enhanced Caching System with Rate Limiting
 * 
 * This system will dramatically reduce API calls by:
 * 1. Caching results for 24+ hours (flights don't change that often)
 * 2. Implementing intelligent deduplication
 * 3. Rate limiting per user/session
 * 4. Background refresh for popular routes
 */

import NodeCache from 'node-cache';
import crypto from 'crypto';

// Enhanced cache with longer TTL for flight searches
const flightCache = new NodeCache({
  stdTTL: 24 * 60 * 60, // 24 hours cache (was 10 minutes)
  checkperiod: 60 * 60,  // Check every hour
  useClones: false,
  maxKeys: 10000 // Store up to 10k searches
});

// Usage tracking cache
const usageCache = new NodeCache({
  stdTTL: 24 * 60 * 60, // Reset daily
  checkperiod: 60 * 60
});

// Rate limiting cache  
const rateLimitCache = new NodeCache({
  stdTTL: 60 * 60, // 1 hour windows
  checkperiod: 5 * 60
});

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  lastReset: string;
}

interface RateLimitInfo {
  count: number;
  windowStart: number;
  blocked: boolean;
}

class EnhancedFlightCache {
  private stats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    apiCalls: 0,
    lastReset: new Date().toISOString()
  };

  // Rate limits per hour
  private readonly RATE_LIMITS = {
    perIP: 10,      // 10 searches per IP per hour
    perSession: 15, // 15 searches per session per hour  
    global: 50      // 50 total API calls per hour
  };

  /**
   * Generate cache key for flight search
   */
  private generateCacheKey(params: any): string {
    // Normalize parameters for better cache hits
    const normalized = {
      origin: params.origin?.toUpperCase(),
      destination: params.destination?.toUpperCase(),
      departDate: params.departDate,
      returnDate: params.returnDate,
      adults: params.adults || 1,
      cabin: params.cabin || 'ECONOMY'
    };
    
    return crypto
      .createHash('md5')
      .update(JSON.stringify(normalized))
      .digest('hex');
  }

  /**
   * Generate rate limit key
   */
  private getRateLimitKey(identifier: string, type: string): string {
    const hour = Math.floor(Date.now() / (1000 * 60 * 60));
    return `${type}:${identifier}:${hour}`;
  }

  /**
   * Check if request is rate limited
   */
  public checkRateLimit(ip: string, sessionId?: string): { allowed: boolean; reason?: string; resetTime?: number } {
    const now = Date.now();
    const currentHour = Math.floor(now / (1000 * 60 * 60));

    // Check global rate limit
    const globalKey = this.getRateLimitKey('global', 'global');
    const globalUsage = rateLimitCache.get<RateLimitInfo>(globalKey) || { count: 0, windowStart: now, blocked: false };
    
    if (globalUsage.count >= this.RATE_LIMITS.global) {
      return { 
        allowed: false, 
        reason: `Global rate limit exceeded (${this.RATE_LIMITS.global}/hour)`,
        resetTime: (currentHour + 1) * 60 * 60 * 1000
      };
    }

    // Check IP rate limit
    const ipKey = this.getRateLimitKey(ip, 'ip');
    const ipUsage = rateLimitCache.get<RateLimitInfo>(ipKey) || { count: 0, windowStart: now, blocked: false };
    
    if (ipUsage.count >= this.RATE_LIMITS.perIP) {
      return { 
        allowed: false, 
        reason: `IP rate limit exceeded (${this.RATE_LIMITS.perIP}/hour)`,
        resetTime: (currentHour + 1) * 60 * 60 * 1000
      };
    }

    // Check session rate limit (if provided)
    if (sessionId) {
      const sessionKey = this.getRateLimitKey(sessionId, 'session');
      const sessionUsage = rateLimitCache.get<RateLimitInfo>(sessionKey) || { count: 0, windowStart: now, blocked: false };
      
      if (sessionUsage.count >= this.RATE_LIMITS.perSession) {
        return { 
          allowed: false, 
          reason: `Session rate limit exceeded (${this.RATE_LIMITS.perSession}/hour)`,
          resetTime: (currentHour + 1) * 60 * 60 * 1000
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Record API usage for rate limiting
   */
  private recordUsage(ip: string, sessionId?: string): void {
    const now = Date.now();

    // Record global usage
    const globalKey = this.getRateLimitKey('global', 'global');
    const globalUsage = rateLimitCache.get<RateLimitInfo>(globalKey) || { count: 0, windowStart: now, blocked: false };
    globalUsage.count++;
    rateLimitCache.set(globalKey, globalUsage);

    // Record IP usage
    const ipKey = this.getRateLimitKey(ip, 'ip');
    const ipUsage = rateLimitCache.get<RateLimitInfo>(ipKey) || { count: 0, windowStart: now, blocked: false };
    ipUsage.count++;
    rateLimitCache.set(ipKey, ipUsage);

    // Record session usage (if provided)
    if (sessionId) {
      const sessionKey = this.getRateLimitKey(sessionId, 'session');
      const sessionUsage = rateLimitCache.get<RateLimitInfo>(sessionKey) || { count: 0, windowStart: now, blocked: false };
      sessionUsage.count++;
      rateLimitCache.set(sessionKey, sessionUsage);
    }

    // Update stats
    this.stats.apiCalls++;
  }

  /**
   * Get cached flight results with intelligent fallback
   */
  public async getFlights(
    params: any, 
    fetchFunction: () => Promise<any>,
    clientInfo: { ip: string; sessionId?: string }
  ): Promise<{ data: any; fromCache: boolean; rateLimited?: boolean; error?: string }> {
    
    this.stats.totalRequests++;

    // Check rate limits first
    const rateLimitCheck = this.checkRateLimit(clientInfo.ip, clientInfo.sessionId);
    if (!rateLimitCheck.allowed) {
      console.log(`🚫 Rate limited: ${rateLimitCheck.reason}`);
      
      // Try to return cached data even if stale
      const cacheKey = this.generateCacheKey(params);
      const cached = flightCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Returning stale cache due to rate limit');
        return { data: cached, fromCache: true, rateLimited: true };
      }
      
      return { 
        data: null, 
        fromCache: false, 
        rateLimited: true, 
        error: `${rateLimitCheck.reason}. Try again after ${new Date(rateLimitCheck.resetTime || 0).toLocaleTimeString()}`
      };
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(params);
    const cached = flightCache.get(cacheKey);
    
    if (cached) {
      console.log(`📦 Cache HIT for ${params.origin} → ${params.destination}`);
      this.stats.cacheHits++;
      return { data: cached, fromCache: true };
    }

    // Cache miss - make API call
    console.log(`🌐 Cache MISS for ${params.origin} → ${params.destination} - Making API call`);
    this.stats.cacheMisses++;
    
    try {
      // Record usage before making the call
      this.recordUsage(clientInfo.ip, clientInfo.sessionId);
      
      const result = await fetchFunction();
      
      // Cache the result with extended TTL for popular routes
      const isPopularRoute = this.isPopularRoute(params.origin, params.destination);
      const cacheTTL = isPopularRoute ? 48 * 60 * 60 : 24 * 60 * 60; // 48h for popular, 24h for others
      
      flightCache.set(cacheKey, result, cacheTTL);
      console.log(`💾 Cached result for ${cacheTTL / 3600}h`);
      
      return { data: result, fromCache: false };
      
    } catch (error: any) {
      console.error('❌ API call failed:', error.message);
      
      // Try to return stale cache on API failure
      const staleCache = flightCache.get(cacheKey);
      if (staleCache) {
        console.log('📦 Returning stale cache due to API failure');
        return { data: staleCache, fromCache: true, error: 'Using cached data due to API error' };
      }
      
      throw error;
    }
  }

  /**
   * Check if route is popular (for extended caching)
   */
  private isPopularRoute(origin: string, destination: string): boolean {
    const popularRoutes = [
      'LAX-JFK', 'JFK-LAX', 'LAX-LAS', 'LAS-LAX',
      'DFW-ORD', 'ORD-DFW', 'LAX-SFO', 'SFO-LAX',
      'JFK-LHR', 'LHR-JFK', 'LAX-LHR', 'LHR-LAX'
    ];
    
    const route = `${origin}-${destination}`;
    return popularRoutes.includes(route);
  }

  /**
   * Get cache and usage statistics
   */
  public getStats(): CacheStats & { 
    cacheSize: number; 
    hitRate: number;
    rateLimits: any;
  } {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;

    return {
      ...this.stats,
      cacheSize: flightCache.keys().length,
      hitRate: Math.round(hitRate * 100) / 100,
      rateLimits: this.RATE_LIMITS
    };
  }

  /**
   * Clear cache (for testing/admin use)
   */
  public clearCache(): void {
    flightCache.flushAll();
    rateLimitCache.flushAll();
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      lastReset: new Date().toISOString()
    };
    console.log('🧹 Cache cleared');
  }

  /**
   * Warm up cache with popular routes
   */
  public async warmupCache(fetchFunction: (params: any) => Promise<any>): Promise<void> {
    const popularSearches = [
      { origin: 'LAX', destination: 'JFK', departDate: '2025-02-15' },
      { origin: 'LAX', destination: 'LAS', departDate: '2025-02-15' },
      { origin: 'DFW', destination: 'ORD', departDate: '2025-02-15' }
    ];

    console.log('🔥 Warming up cache with popular routes...');
    
    for (const search of popularSearches) {
      try {
        await this.getFlights(search, () => fetchFunction(search), { ip: 'warmup' });
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between calls
      } catch (error) {
        console.log(`⚠️ Warmup failed for ${search.origin}-${search.destination}`);
      }
    }
  }
}

// Export singleton instance
export const enhancedFlightCache = new EnhancedFlightCache();

// Schedule cache stats logging
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const stats = enhancedFlightCache.getStats();
    if (stats.totalRequests > 0) {
      console.log(`📊 Cache Stats: ${stats.cacheHits}/${stats.totalRequests} hits (${stats.hitRate}%), ${stats.apiCalls} API calls`);
    }
  }, 10 * 60 * 1000); // Every 10 minutes
}
