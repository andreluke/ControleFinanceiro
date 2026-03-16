import { api } from './api'

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
  async list(params?: TransactionListParams): Promise<TransactionListResponse> {
    return api.get<TransactionListResponse>('/transactions', params as Record<string, string | number | undefined>)
  },

  async get(id: string): Promise<Transaction> {
    return api.get<Transaction>(`/transactions/${id}`)
  },

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    return api.post<Transaction>('/transactions', data)
  },

  async update(id: string, data: Partial<CreateTransactionRequest>): Promise<Transaction> {
    return api.put<Transaction>(`/transactions/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/transactions/${id}`)
  },
}
