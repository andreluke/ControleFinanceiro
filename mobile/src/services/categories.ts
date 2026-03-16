import { api } from './api'

export interface Category {
  id: string
  name: string
  color: string
  type: 'income' | 'expense'
}

export const categoryService = {
  async list(): Promise<Category[]> {
    return api.get<Category[]>('/categories')
  },

  async listByType(type: 'income' | 'expense'): Promise<Category[]> {
    return api.get<Category[]>('/categories', { type })
  },
}
