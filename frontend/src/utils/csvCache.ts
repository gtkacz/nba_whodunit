/**
 * CSV Cache utility with version-based invalidation
 * Caches CSV data in localStorage and invalidates when app version changes
 */

const CACHE_VERSION_KEY = 'nba_draft_csv_cache_version'
const CACHE_PREFIX = 'nba_draft_csv_cache_'
const CACHE_TIMESTAMP_PREFIX = 'nba_draft_csv_cache_timestamp_'

/**
 * Get the current app version from package.json
 * Falls back to a default if not available
 */
function getAppVersion(): string {
  // Use the version injected by Vite's define
  // @ts-expect-error - __APP_VERSION__ is injected by Vite at build time
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'
}

/**
 * Check if cache is valid (version matches)
 */
function isCacheValid(): boolean {
  const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY)
  const currentVersion = getAppVersion()
  return cachedVersion === currentVersion
}

/**
 * Invalidate all cache if version changed
 */
function invalidateCacheIfNeeded(): void {
  if (!isCacheValid()) {
    // Clear all cache entries
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Update cache version
    localStorage.setItem(CACHE_VERSION_KEY, getAppVersion())
  } else if (!localStorage.getItem(CACHE_VERSION_KEY)) {
    // Initialize cache version if not set
    localStorage.setItem(CACHE_VERSION_KEY, getAppVersion())
  }
}

/**
 * Get cache key for a team CSV file
 */
function getCacheKey(team: string, enriched: boolean): string {
  return `${CACHE_PREFIX}${team}_${enriched ? 'enriched' : 'regular'}`
}

/**
 * Get timestamp key for a team CSV file
 */
function getTimestampKey(team: string, enriched: boolean): string {
  return `${CACHE_TIMESTAMP_PREFIX}${team}_${enriched ? 'enriched' : 'regular'}`
}

/**
 * Get cached CSV data for a team
 * @param team - Team abbreviation
 * @param enriched - Whether to get enriched CSV
 * @returns Cached CSV text or null if not found/invalid
 */
export function getCachedCSV(team: string, enriched: boolean): string | null {
  invalidateCacheIfNeeded()

  const cacheKey = getCacheKey(team, enriched)
  const cached = localStorage.getItem(cacheKey)

  if (!cached) {
    return null
  }

  return cached
}

/**
 * Cache CSV data for a team
 * @param team - Team abbreviation
 * @param enriched - Whether this is enriched CSV
 * @param csvText - CSV text to cache
 */
export function setCachedCSV(team: string, enriched: boolean, csvText: string): void {
  invalidateCacheIfNeeded()

  const cacheKey = getCacheKey(team, enriched)
  const timestampKey = getTimestampKey(team, enriched)

  try {
    localStorage.setItem(cacheKey, csvText)
    localStorage.setItem(timestampKey, Date.now().toString())
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, clearing old cache entries')
      // Clear oldest entries (simple strategy: clear all and start fresh)
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Try again
      try {
        localStorage.setItem(cacheKey, csvText)
        localStorage.setItem(timestampKey, Date.now().toString())
      } catch (retryError) {
        console.error('Failed to cache CSV after clearing:', retryError)
      }
    } else {
      console.error('Failed to cache CSV:', error)
    }
  }
}

/**
 * Clear all cached CSV data
 */
export function clearCSVCache(): void {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX))) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem(CACHE_VERSION_KEY)
}

/**
 * Initialize cache (check version and invalidate if needed)
 * Should be called on app startup
 */
export function initializeCache(): void {
  invalidateCacheIfNeeded()
}
