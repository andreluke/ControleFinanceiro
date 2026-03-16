export interface Category {
  id: string
  name: string
  color: string
  icon?: string | null
  deletedAt?: string | null
}

export interface Subcategory {
  id: string
  userId: string
  categoryId: string
  name: string
  color: string
  icon?: string | null
  deletedAt?: string | null
}

export interface PaymentMethod {
  id: string
  name: string
}

export interface Transaction {
  id: string
  description: string
  subDescription?: string | null
  amount: number
  type: 'income' | 'expense'
  date: string
  categoryId?: string | null
  category?: Category | null
  subcategoryId?: string | null
  subcategory?: Subcategory | null
  paymentMethodId?: string | null
  paymentMethod?: PaymentMethod | null
  createdAt: string
}

export interface TransactionInput {
  description: string
  subDescription?: string
  amount: number
  type: 'income' | 'expense'
  date: string
  categoryId?: string
  subcategoryId?: string
  paymentMethodId?: string
}

export interface ListTransactionsParams {
  page?: number
  limit?: number
  month?: string
  type?: 'income' | 'expense'
  categoryId?: string
}

export interface TransactionsResponse {
  data: Transaction[]
  total: number
}

export interface Budget {
  id: string
  categoryId: string
  subcategoryId?: string | null
  category?: Category | null
  subcategory?: Subcategory | null
  amount: number
  spent: number
  month: number
  year: number
}

export interface BudgetSummary {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  overBudgetCount: number
  nearLimitCount: number
  budgets: Budget[]
}

export interface RecurringTransaction {
  id: string
  description: string
  subDescription?: string | null
  amount: number
  type: 'income' | 'expense'
  categoryId?: string | null
  category?: Category | null
  subcategoryId?: string | null
  subcategory?: Subcategory | null
  paymentMethodId?: string | null
  paymentMethod?: PaymentMethod | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  customIntervalDays?: number | null
  dayOfMonth: number
  dayOfWeek?: number | null
  startDate: string
  endDate?: string | null
  isActive: boolean
  lastGeneratedAt?: string | null
  createdAt: string
}

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
  balance: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  color: string
  total: number
  percentage: number
}
