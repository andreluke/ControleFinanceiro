import { describe, it, expect, beforeAll } from 'vitest'
import { buildApp } from '../src/config/app'
import { AuthModel } from '../src/modules/auth/auth.model'
import { PaymentMethodModel } from '../src/modules/payment-methods/payment-methods.model'

describe('Payment Methods Module', () => {
  const methodModel = new PaymentMethodModel()
  const authModel = new AuthModel()
  let app: any
  let token: string
  let userId: string

  beforeAll(async () => {
    app = await buildApp()
    
    const email = `pm-test-${Date.now()}@example.com`
    const user = await authModel.createUser({
      name: 'PM Tester',
      email,
      password: 'password123'
    })
    userId = user.id
    token = await app.jwt.sign({ sub: user.id, email: user.email })
  })

  describe('PaymentMethodModel', () => {
    it('should create a payment method', async () => {
      const method = await methodModel.createMethod(userId, {
        name: 'Credit Card'
      })

      expect(method).toBeDefined()
      expect(method.name).toBe('Credit Card')
    })
  })

  describe('Payment Method Routes', () => {
    it('should list methods via API', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/payment-methods',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      expect(response.statusCode).toBe(200)
    })
  })
})
