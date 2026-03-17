import { api } from './api'

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

export interface CreateCategoryRequest {
  name: string
  color?: string
  icon?: string
}

export interface UpdateCategoryRequest {
  name?: string
  color?: string
  icon?: string
}

export const categoryService = {
  async list(): Promise<Category[]> {
    return api.get<Category[]>('/categories')
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    return api.post<Category>('/categories', data)
  },

  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/categories/${id}`)
  },

  async restore(id: string): Promise<Category> {
    return api.patch<Category>(`/categories/${id}/restore`)
  },
}
