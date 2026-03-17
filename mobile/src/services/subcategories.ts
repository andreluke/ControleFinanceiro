import { api } from './api'

export interface Subcategory {
  id: string
  name: string
  color?: string
  icon?: string
  categoryId: string
  categoryName?: string
}

export interface CreateSubcategoryRequest {
  name: string
  categoryId: string
  color?: string
  icon?: string
}

export interface UpdateSubcategoryRequest {
  name?: string
  categoryId?: string
  color?: string
  icon?: string
}

export const subcategoryService = {
  async list(): Promise<Subcategory[]> {
    return api.get<Subcategory[]>('/subcategories')
  },

  async listByCategory(categoryId: string): Promise<Subcategory[]> {
    return api.get<Subcategory[]>('/subcategories', { categoryId })
  },

  async create(data: CreateSubcategoryRequest): Promise<Subcategory> {
    return api.post<Subcategory>('/subcategories', data)
  },

  async update(id: string, data: UpdateSubcategoryRequest): Promise<Subcategory> {
    return api.put<Subcategory>(`/subcategories/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/subcategories/${id}`)
  },

  async restore(id: string): Promise<Subcategory> {
    return api.patch<Subcategory>(`/subcategories/${id}/restore`)
  },
}
