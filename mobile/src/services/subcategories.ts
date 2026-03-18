import { api } from './api'
import { CACHE_KEYS } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

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
  async list(useCache = true): Promise<Subcategory[]> {
    if (useCache) {
      return withCache(
        () => api.get<Subcategory[]>('/subcategories'),
        { cacheKey: CACHE_KEYS.SUBCATEGORIES, cacheTime: 30 * 60 * 1000 }
      )
    }
    
    return api.get<Subcategory[]>('/subcategories')
  },

  async listByCategory(categoryId: string): Promise<Subcategory[]> {
    return api.get<Subcategory[]>('/subcategories', { categoryId })
  },

  async create(data: CreateSubcategoryRequest): Promise<Subcategory> {
    const result = await api.post<Subcategory>('/subcategories', data)
    await subcategoryService.invalidate()
    return result
  },

  async update(id: string, data: UpdateSubcategoryRequest): Promise<Subcategory> {
    const result = await api.put<Subcategory>(`/subcategories/${id}`, data)
    await subcategoryService.invalidate()
    return result
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/subcategories/${id}`)
    await subcategoryService.invalidate()
  },

  async restore(id: string): Promise<Subcategory> {
    const result = await api.patch<Subcategory>(`/subcategories/${id}/restore`)
    await subcategoryService.invalidate()
    return result
  },

  invalidate: async () => await cacheUtils.invalidateCategories(),
}
