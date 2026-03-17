import { api } from './api'
import { withCache, cacheUtils } from './cacheUtils'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  categoryId: string
  category?: {
    id: string
    name: string
    color: string
  }
  subcategoryId?: string
  paymentMethodId?: string
}

export interface TransactionListParams {
  type?: 'income' | 'expense'
  categoryId?: string
  page?: number
  limit?: number
}

export interface TransactionListResponse {
  data: Transaction[]
  total: number
  page: number
  limit: number
}

export interface CreateTransactionRequest {
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  categoryId: string
  subcategoryId?: string
  paymentMethodId?: string
}

export const transactionService = {
  async list(params?: TransactionListParams, useCache = true): Promise<TransactionListResponse> {
    const paramsKey = params ? JSON.stringify(params) : 'all'
    const cacheKey = `transactions_${paramsKey}`
    
    if (useCache) {
      return withCache(
        () => api.get<TransactionListResponse>('/transactions', params as Record<string, string | number | undefined>),
        { cacheKey, cacheTime: 2 * 60 * 1000 }
      )
    }
    
    return api.get<TransactionListResponse>('/transactions', params as Record<string, string | number | undefined>)
  },

  async get(id: string): Promise<Transaction> {
    return api.get<Transaction>(`/transactions/${id}`)
  },

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    const result = await api.post<Transaction>('/transactions', data)
    await transactionService.invalidate()
    return result
  },

  async update(id: string, data: Partial<CreateTransactionRequest>): Promise<Transaction> {
    const result = await api.put<Transaction>(`/transactions/${id}`, data)
    await transactionService.invalidate()
    return result
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
    await transactionService.invalidate()
  },

  invalidate: async () => await cacheUtils.invalidateTransactions(),
}
