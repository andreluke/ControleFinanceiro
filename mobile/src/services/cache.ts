import * as SecureStore from 'expo-secure-store'

interface CacheItem<T> {
  data: T
  timestamp: number
}

export const DEFAULT_CACHE_TIME = 5 * 60 * 1000

const cache: Map<string, CacheItem<any>> = new Map()
let isInitialized = false
let initPromise: Promise<void> | null = null

const sanitizeKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_')
}

const loadCacheToMemory = async () => {
  if (isInitialized) return
  if (initPromise) return initPromise
  
  initPromise = (async () => {
    try {
      const keysStr = await SecureStore.getItemAsync('cache_keys')
      if (!keysStr) {
        isInitialized = true
        return
      }
      
      const keys: string[] = JSON.parse(keysStr)
      
      for (const key of keys) {
        try {
          const value = await SecureStore.getItemAsync(`cache_${key}`)
          if (value) {
            const item = JSON.parse(value)
            cache.set(key, item)
          }
        } catch {}
      }
    } catch (err) {
      console.error('Error loading cache:', err)
    }
    isInitialized = true
  })()
  
  return initPromise
}

const saveToStorage = async (key: string, item: CacheItem<any>) => {
  try {
    const safeKey = sanitizeKey(key)
    await SecureStore.setItemAsync(`cache_${safeKey}`, JSON.stringify(item))
    
    const keysStr = await SecureStore.getItemAsync('cache_keys')
    const keys: string[] = keysStr ? JSON.parse(keysStr) : []
    if (!keys.includes(safeKey)) {
      keys.push(safeKey)
      await SecureStore.setItemAsync('cache_keys', JSON.stringify(keys))
    }
  } catch (err) {
    console.error('Error saving cache:', err)
  }
}

const removeFromStorage = async (key: string) => {
  try {
    const safeKey = sanitizeKey(key)
    await SecureStore.deleteItemAsync(`cache_${safeKey}`)
    
    const keysStr = await SecureStore.getItemAsync('cache_keys')
    if (keysStr) {
      const keys: string[] = JSON.parse(keysStr).filter((k: string) => k !== safeKey)
      await SecureStore.setItemAsync('cache_keys', JSON.stringify(keys))
    }
  } catch (err) {
    console.error('Error removing cache:', err)
  }
}

export const cacheService = {
  async get<T>(key: string, cacheTime = DEFAULT_CACHE_TIME): Promise<T | null> {
    await loadCacheToMemory()
    
    const safeKey = sanitizeKey(key)
    const item = cache.get(safeKey)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > cacheTime
    
    if (isExpired) {
      cache.delete(safeKey)
      await removeFromStorage(key)
      return null
    }
    
    return item.data as T
  },

  async set<T>(key: string, data: T): Promise<void> {
    const safeKey = sanitizeKey(key)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    }
    cache.set(safeKey, item)
    await saveToStorage(key, item)
  },

  async delete(key: string): Promise<void> {
    const safeKey = sanitizeKey(key)
    cache.delete(safeKey)
    await removeFromStorage(key)
  },

  async deletePattern(pattern: string): Promise<void> {
    const keysToDelete: string[] = []
    cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      cache.delete(key)
      removeFromStorage(key)
    })
  },

  async clear(): Promise<void> {
    cache.clear()
    try {
      const keysStr = await SecureStore.getItemAsync('cache_keys')
      if (keysStr) {
        const keys: string[] = JSON.parse(keysStr)
        for (const key of keys) {
          await SecureStore.deleteItemAsync(`cache_${key}`)
        }
        await SecureStore.deleteItemAsync('cache_keys')
      }
    } catch (err) {
      console.error('Error clearing cache:', err)
    }
  },

  async getAllKeys(): Promise<string[]> {
    await loadCacheToMemory()
    return Array.from(cache.keys())
  },
}

export const CACHE_KEYS = {
  USER: 'user',
  SUMMARY: 'summary',
  SUMMARY_MONTHLY: 'summary_monthly',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  PAYMENT_METHODS: 'payment_methods',
  RECURRING: 'recurring',
} as const

export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS]
