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
  subcategory?: {
    id: string
    name: string
    color: string
  }
  amount: number
  spent: number
  month: number
  year: number
  isRecurring?: boolean
  isActive?: boolean
  recurringGroupId?: string
  baseAmount?: number
  subcategoriesTotal?: number
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
  isRecurring?: boolean
  baseAmount?: number
}

interface BudgetSummaryResponse {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  overBudgetCount: number
  nearLimitCount: number
  budgets: Budget[]
}

interface BudgetRaw {
  id: string
  amount: number | string
  month: number
  year: number
  categoryId: string
  subcategoryId?: string | null
  categoryName: string
  categoryColor: string
  subcategoryName?: string | null
  subcategoryColor?: string | null
  spent: number | string
  percentage: number
  remaining: number
  isOverBudget: boolean
  isRecurring?: boolean
  isActive?: boolean
  recurringGroupId?: string
  baseAmount?: number | string
  subcategoriesTotal?: number | string
  createdAt: Date
}

const parseBudget = (budget: BudgetRaw): Budget => ({
  id: budget.id,
  categoryId: budget.categoryId,
  category: {
    id: budget.categoryId,
    name: budget.categoryName,
    color: budget.categoryColor,
  },
  subcategoryId: budget.subcategoryId || undefined,
  subcategory: budget.subcategoryId && budget.subcategoryName ? {
    id: budget.subcategoryId,
    name: budget.subcategoryName,
    color: budget.subcategoryColor || budget.categoryColor,
  } : undefined,
  amount: Number(budget.amount) || 0,
  spent: Number(budget.spent) || 0,
  month: budget.month,
  year: budget.year,
  isRecurring: budget.isRecurring,
  isActive: budget.isActive,
  recurringGroupId: budget.recurringGroupId,
  baseAmount: budget.baseAmount ? Number(budget.baseAmount) : undefined,
  subcategoriesTotal: budget.subcategoriesTotal ? Number(budget.subcategoriesTotal) : undefined,
})

export const budgetService = {
  async list(params?: BudgetListParams, useCache = true): Promise<Budget[]> {
    const paramsKey = params ? `${params.month}_${params.year}` : 'current'
    const cacheKey = `budgets_${paramsKey}`
    
    if (useCache) {
      return withCache(
        () => api.get<BudgetSummaryResponse>('/budgets', params as Record<string, string | number | undefined>),
        { cacheKey, cacheTime: 5 * 60 * 1000 }
      ).then(res => res.budgets.map(parseBudget))
    }
    
    return api.get<BudgetSummaryResponse>('/budgets', params as Record<string, string | number | undefined>)
      .then(res => res.budgets.map(parseBudget))
  },

  async create(data: CreateBudgetRequest): Promise<Budget> {
    const result = await api.post<{ budget: Budget }>('/budgets', data)
    budgetService.invalidate()
    return result.budget
  },

  async update(id: string, amount: number): Promise<Budget> {
    const result = await api.put<{ budget: Budget }>(`/budgets/${id}`, { amount })
    budgetService.invalidate()
    return result.budget
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`)
    budgetService.invalidate()
  },

  async toggle(id: string): Promise<Budget> {
    const result = await api.patch<{ budget: Budget }>(`/budgets/${id}/toggle`, {})
    budgetService.invalidate()
    return result.budget
  },

  invalidate: async () => await cacheUtils.invalidateBudgets(),
}
