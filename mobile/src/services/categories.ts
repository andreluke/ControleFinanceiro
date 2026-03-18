import { api } from './api'
import { CACHE_KEYS } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

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
  async list(useCache = true): Promise<Category[]> {
    if (useCache) {
      return withCache(
        () => api.get<Category[]>('/categories'),
        { cacheKey: CACHE_KEYS.CATEGORIES, cacheTime: 30 * 60 * 1000 }
      )
    }
    
    return api.get<Category[]>('/categories')
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    const result = await api.post<Category>('/categories', data)
    await categoryService.invalidate()
    return result
  },

  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const result = await api.put<Category>(`/categories/${id}`, data)
    await categoryService.invalidate()
    return result
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
    await categoryService.invalidate()
  },

  async restore(id: string): Promise<Category> {
    const result = await api.patch<Category>(`/categories/${id}/restore`)
    await categoryService.invalidate()
    return result
  },

  invalidate: async () => await cacheUtils.invalidateCategories(),
}
