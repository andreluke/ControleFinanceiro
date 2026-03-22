import { api } from './api'
import { CACHE_KEYS } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  startDate: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  customIntervalDays?: number
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
  }
  paymentMethodId?: string
  paymentMethod?: {
    id: string
    name: string
  }
  isActive: boolean
  lastProcessedAt?: string
  nextProcessingDate?: string
}

export interface CreateRecurringRequest {
  description: string
  amount: number
  type: 'income' | 'expense'
  startDate: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  customIntervalDays?: number
  categoryId?: string
  paymentMethodId?: string
}

export interface UpdateRecurringRequest {
  description?: string
  amount?: number
  type?: 'income' | 'expense'
  startDate?: string
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  customIntervalDays?: number
  categoryId?: string
  paymentMethodId?: string
}

export const recurringService = {
  async list(includeInactive?: boolean, useCache = true): Promise<RecurringTransaction[]> {
    const cacheKey = `${CACHE_KEYS.RECURRING}_${includeInactive}`
    
    if (useCache) {
      return withCache(
        () => api.get<RecurringTransaction[]>('/recurring', { includeInactive: includeInactive ? 'true' : undefined }),
        { cacheKey, cacheTime: 5 * 60 * 1000 }
      )
    }
    
    return api.get<RecurringTransaction[]>('/recurring', { includeInactive: includeInactive ? 'true' : undefined })
  },

  async get(id: string): Promise<RecurringTransaction> {
    return api.get<RecurringTransaction>(`/recurring/${id}`)
  },

  async create(data: CreateRecurringRequest): Promise<RecurringTransaction> {
    const result = await api.post<RecurringTransaction>('/recurring', data)
    await recurringService.invalidate()
    return result
  },

  async update(id: string, data: UpdateRecurringRequest): Promise<RecurringTransaction> {
    const result = await api.put<RecurringTransaction>(`/recurring/${id}`, data)
    await recurringService.invalidate()
    return result
  },

  async toggle(id: string): Promise<RecurringTransaction> {
    const result = await api.patch<RecurringTransaction>(`/recurring/${id}/toggle`)
    await recurringService.invalidate()
    return result
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recurring/${id}`)
    await recurringService.invalidate()
  },

  async process(id: string): Promise<RecurringTransaction> {
    const result = await api.post<RecurringTransaction>(`/recurring/${id}/process`)
    await recurringService.invalidate()
    return result
  },

  invalidate: async () => await cacheUtils.invalidateRecurring(),
}
