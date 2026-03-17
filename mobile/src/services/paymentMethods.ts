import { api } from './api'

export interface PaymentMethod {
  id: string
  name: string
}

export const paymentMethodService = {
  async list(): Promise<PaymentMethod[]> {
    return api.get<PaymentMethod[]>('/payment-methods')
  },

  async create(name: string): Promise<PaymentMethod> {
    return api.post<PaymentMethod>('/payment-methods', { name })
  },

  async update(id: string, name: string): Promise<PaymentMethod> {
    return api.put<PaymentMethod>(`/payment-methods/${id}`, { name })
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/payment-methods/${id}`)
  },

  async restore(id: string): Promise<PaymentMethod> {
    return api.patch<PaymentMethod>(`/payment-methods/${id}/restore`)
  },
}
