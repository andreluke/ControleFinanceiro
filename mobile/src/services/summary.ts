import { api } from './api'
import { CACHE_KEYS } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

export interface Summary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyChange: number
}

export interface MonthlySummary {
  month: string
  income: number
  expense: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  color: string
  total: number
  percentage: number
}

export const summaryService = {
  async get(month?: string, useCache = true): Promise<Summary> {
    const cacheKey = `${CACHE_KEYS.SUMMARY}_${month || 'current'}`
    
    if (useCache) {
      return withCache(
        () => api.get<Summary>('/summary', { month }),
        { cacheKey, cacheTime: 5 * 60 * 1000 }
      )
    }
    
    return api.get<Summary>('/summary', { month })
  },

  async getMonthly(months: number = 6, useCache = true): Promise<MonthlySummary[]> {
    const cacheKey = `${CACHE_KEYS.SUMMARY_MONTHLY}_${months}`
    
    if (useCache) {
      return withCache(
        () => api.get<MonthlySummary[]>('/summary/monthly', { months }),
        { cacheKey, cacheTime: 10 * 60 * 1000 }
      )
    }
    
    return api.get<MonthlySummary[]>('/summary/monthly', { months })
  },

  async getByCategory(month?: string, type?: 'income' | 'expense', useCache = true): Promise<CategorySummary[]> {
    const cacheKey = `${CACHE_KEYS.SUMMARY}_byCategory_${month || 'current'}_${type || 'expense'}`
    
    if (useCache) {
      return withCache(
        () => api.get<CategorySummary[]>('/summary/by-category', { month, type }),
        { cacheKey, cacheTime: 5 * 60 * 1000 }
      )
    }
    
    return api.get<CategorySummary[]>('/summary/by-category', { month, type })
  },

  invalidate: async () => await cacheUtils.invalidateSummary(),
}
