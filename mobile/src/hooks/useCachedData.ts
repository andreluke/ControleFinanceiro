import { useState, useEffect, useCallback } from 'react'
import { cacheService, DEFAULT_CACHE_TIME } from '../services/cache'

interface UseCachedDataOptions<T> {
  key: string
  fetchFn: () => Promise<T>
  cacheTime?: number
  immediate?: boolean
}

interface UseCachedDataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isStale: boolean
}

export function useCachedData<T>({
  key,
  fetchFn,
  cacheTime = DEFAULT_CACHE_TIME,
  immediate = true,
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)

  const fetchData = useCallback(async (useCache = true) => {
    try {
      if (useCache) {
        const cached = await cacheService.get<T>(key, cacheTime)
        if (cached) {
          setData(cached)
          setLoading(false)
          setIsStale(false)
        }
      }

      const freshData = await fetchFn()
      setData(freshData)
      await cacheService.set(key, freshData)
      setError(null)
      setIsStale(false)
    } catch (err) {
      if (!data) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
      const cached = await cacheService.get<T>(key, Infinity)
      if (cached) {
        setData(cached)
        setIsStale(true)
      }
    } finally {
      setLoading(false)
    }
  }, [key, fetchFn, cacheTime, data])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [immediate])

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(false),
    isStale,
  }
}

export async function invalidateCache(pattern?: string): Promise<void> {
  if (pattern) {
    await cacheService.deletePattern(pattern)
  } else {
    await cacheService.clear()
  }
}

export async function invalidateKeys(...keys: string[]): Promise<void> {
  for (const key of keys) {
    await cacheService.delete(key)
  }
}
