// Simple in-memory cache with TTL support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private timers = new Map<string, NodeJS.Timeout>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Clear existing timer if any
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set cache entry
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlMs);
    
    this.timers.set(key, timer);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  clients: (options?: any) => `clients:${JSON.stringify(options || {})}`,
  client: (id: string) => `client:${id}`,
  clientStats: () => 'client-stats',
  search: (query: string, limit: number) => `search:${query}:${limit}`,
} as const;

// Cache utilities
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = cache.get<T>(key);
      if (cached !== null) {
        resolve(cached);
        return;
      }

      // Fetch fresh data
      const data = await fetcher();
      
      // Cache the result
      cache.set(key, data, ttlMs);
      
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

// Invalidate related cache entries
export function invalidateCache(pattern: string): void {
  const keys = Array.from((cache as any).cache.keys()) as string[];
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}

// Cache warming for frequently accessed data
export async function warmCache() {
  try {
    // Pre-load client stats
    const { ClientService } = await import('./database');
    const stats = await ClientService.getClientStats();
    cache.set(cacheKeys.clientStats(), stats, 10 * 60 * 1000); // 10 minutes
    
    // Pre-load recent clients
    const recentClients = await ClientService.getClients({ limit: 20 });
    cache.set(cacheKeys.clients({ limit: 20 }), recentClients, 5 * 60 * 1000); // 5 minutes
    
    console.log('[Cache] Warmed cache with initial data');
  } catch (error) {
    console.warn('[Cache] Failed to warm cache:', error);
  }
}