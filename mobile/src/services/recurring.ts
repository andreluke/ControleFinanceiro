import { api } from './api'

export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  customIntervalDays?: number
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
  }
  paymentMethodId?: string
  isActive: boolean
  lastProcessedAt?: string
  nextProcessingDate?: string
}

export interface CreateRecurringRequest {
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  customIntervalDays?: number
  categoryId?: string
  paymentMethodId?: string
}

export interface UpdateRecurringRequest {
  description?: string
  amount?: number
  type?: 'income' | 'expense'
  date?: string
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  customIntervalDays?: number
  categoryId?: string
  paymentMethodId?: string
}

export const recurringService = {
  async list(includeInactive?: boolean): Promise<RecurringTransaction[]> {
    return api.get<RecurringTransaction[]>('/recurring', { includeInactive })
  },

  async get(id: string): Promise<RecurringTransaction> {
    return api.get<RecurringTransaction>(`/recurring/${id}`)
  },

  async create(data: CreateRecurringRequest): Promise<RecurringTransaction> {
    return api.post<RecurringTransaction>('/recurring', data)
  },

  async update(id: string, data: UpdateRecurringRequest): Promise<RecurringTransaction> {
    return api.put<RecurringTransaction>(`/recurring/${id}`, data)
  },

  async toggle(id: string): Promise<RecurringTransaction> {
    return api.patch<RecurringTransaction>(`/recurring/${id}/toggle`)
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/recurring/${id}`)
  },

  async process(id: string): Promise<RecurringTransaction> {
    return api.post<RecurringTransaction>(`/recurring/${id}/process`)
  },
}
