import { api } from './api'

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
  async get(month?: string): Promise<Summary> {
    return api.get<Summary>('/summary', { month })
  },

  async getMonthly(months: number = 6): Promise<MonthlySummary[]> {
    return api.get<MonthlySummary[]>('/summary/monthly', { months })
  },

  async getByCategory(month?: string, type?: 'income' | 'expense'): Promise<CategorySummary[]> {
    return api.get<CategorySummary[]>('/summary/by-category', { month, type })
  },
}
