import { api } from './api'
import { CACHE_KEYS } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

export interface PaymentMethod {
  id: string
  name: string
}

export const paymentMethodService = {
  async list(useCache = true): Promise<PaymentMethod[]> {
    if (useCache) {
      return withCache(
        () => api.get<PaymentMethod[]>('/payment-methods'),
        { cacheKey: CACHE_KEYS.PAYMENT_METHODS, cacheTime: 30 * 60 * 1000 }
      )
    }
    
    return api.get<PaymentMethod[]>('/payment-methods')
  },

  async create(name: string): Promise<PaymentMethod> {
    const result = await api.post<PaymentMethod>('/payment-methods', { name })
    await paymentMethodService.invalidate()
    return result
  },

  async update(id: string, name: string): Promise<PaymentMethod> {
    const result = await api.put<PaymentMethod>(`/payment-methods/${id}`, { name })
    await paymentMethodService.invalidate()
    return result
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/payment-methods/${id}`)
    await paymentMethodService.invalidate()
  },

  async restore(id: string): Promise<PaymentMethod> {
    const result = await api.patch<PaymentMethod>(`/payment-methods/${id}/restore`)
    await paymentMethodService.invalidate()
    return result
  },

  invalidate: async () => await cacheUtils.invalidatePaymentMethods(),
}
