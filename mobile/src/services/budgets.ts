import { api } from './api'
import { CACHE_KEYS } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

export interface Budget {
  id: string
  categoryId: string
  category?: {
    id: string
    name: string
    color: string
  }
  subcategoryId?: string
  amount: number
  spent: number
  month: number
  year: number
}

export interface BudgetListParams {
  month?: number
  year?: number
}

export interface CreateBudgetRequest {
  categoryId: string
  subcategoryId?: string
  amount: number
  month: number
  year: number
}

export const budgetService = {
  async list(params?: BudgetListParams, useCache = true): Promise<Budget[]> {
    const cacheKey = `${CACHE_KEYS.BUDGETS}_${params?.month}_${params?.year}`
    
    if (useCache) {
      return withCache(
        () => api.get<Budget[]>('/budgets', params as Record<string, string | number | undefined>),
        { cacheKey, cacheTime: 5 * 60 * 1000 }
      )
    }
    
    return api.get<Budget[]>('/budgets', params as Record<string, string | number | undefined>)
  },

  async create(data: CreateBudgetRequest): Promise<Budget> {
    const result = await api.post<Budget>('/budgets', data)
    budgetService.invalidate()
    return result
  },

  async update(id: string, amount: number): Promise<Budget> {
    const result = await api.put<Budget>(`/budgets/${id}`, { amount })
    budgetService.invalidate()
    return result
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`)
    budgetService.invalidate()
  },

  invalidate: async () => await cacheUtils.invalidateBudgets(),
}
