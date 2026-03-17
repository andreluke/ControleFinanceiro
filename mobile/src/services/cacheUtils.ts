import { cacheService, CACHE_KEYS } from './cache'

const DEFAULT_CACHE_TIME = 5 * 60 * 1000

interface FetchOptions {
  cacheKey?: string
  cacheTime?: number
  skipCache?: boolean
}

export async function withCache<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {}
): Promise<T> {
  const { cacheKey, cacheTime = DEFAULT_CACHE_TIME, skipCache = false } = options

  if (!skipCache && cacheKey) {
    const cached = await cacheService.get<T>(cacheKey, cacheTime)
    if (cached) {
      fetchFn().then(data => cacheService.set(cacheKey, data)).catch(() => {})
      return cached
    }
  }

  const data = await fetchFn()

  if (cacheKey) {
    cacheService.set(cacheKey, data).catch(() => {})
  }

  return data
}

export async function clearCache(pattern?: string): Promise<void> {
  if (pattern) {
    await cacheService.deletePattern(pattern)
  } else {
    await cacheService.clear()
  }
}

export async function clearKeys(...keys: string[]): Promise<void> {
  for (const key of keys) {
    await cacheService.delete(key)
  }
}

export const cacheUtils = {
  invalidateSummary: async () => {
    await clearKeys(CACHE_KEYS.SUMMARY, CACHE_KEYS.SUMMARY_MONTHLY)
  },
  invalidateTransactions: async () => {
    await clearKeys(CACHE_KEYS.TRANSACTIONS)
    await cacheService.deletePattern('transactions')
  },
  invalidateBudgets: async () => {
    await clearKeys(CACHE_KEYS.BUDGETS)
  },
  invalidateCategories: async () => {
    await clearKeys(CACHE_KEYS.CATEGORIES, CACHE_KEYS.SUBCATEGORIES)
  },
  invalidatePaymentMethods: async () => {
    await clearKeys(CACHE_KEYS.PAYMENT_METHODS)
  },
  invalidateRecurring: async () => {
    await clearKeys(CACHE_KEYS.RECURRING)
  },
  invalidateAll: async () => {
    await clearCache()
  },
}
