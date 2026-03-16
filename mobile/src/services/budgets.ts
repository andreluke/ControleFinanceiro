import { api } from './api'

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
  async list(params?: BudgetListParams): Promise<Budget[]> {
    return api.get<Budget[]>('/budgets', params as Record<string, string | number | undefined>)
  },

  async create(data: CreateBudgetRequest): Promise<Budget> {
    return api.post<Budget>('/budgets', data)
  },

  async update(id: string, amount: number): Promise<Budget> {
    return api.put<Budget>(`/budgets/${id}`, { amount })
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/budgets/${id}`)
  },
}
