import { describe, it, expect, beforeAll } from 'vitest'
import { buildApp } from '../src/config/app'
import { AuthModel } from '../src/modules/auth/auth.model'
import { TransactionModel } from '../src/modules/transactions/transactions.model'

describe('Summary Module', () => {
  const transactionModel = new TransactionModel()
  const authModel = new AuthModel()
  
  let app: any
  let token: string
  let userId: string

  beforeAll(async () => {
    app = await buildApp()
    
    const email = `summary-test-${Date.now()}@example.com`
    const user = await authModel.createUser({
      name: 'Summary Tester',
      email,
      password: 'password123'
    })
    userId = user.id
    token = await app.jwt.sign({ sub: user.id, email: user.email })

    // Create some transactions
    await transactionModel.createTransaction(userId, {
      description: 'Income',
      amount: 1000,
      type: 'income',
      date: new Date().toISOString()
    })

    await transactionModel.createTransaction(userId, {
      description: 'Expense',
      amount: 400,
      type: 'expense',
      date: new Date().toISOString()
    })
  })

  describe('Summary Routes', () => {
    it('should return overall summary', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/summary',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.totalBalance).toBe(600)
      expect(body.monthlyIncome).toBe(1000)
      expect(body.monthlyExpense).toBe(400)
    })

    it('should return monthly summary for chart', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/summary/monthly',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(Array.isArray(body)).toBe(true)
    })

    it('should return category breakdown', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/summary/by-category',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(Array.isArray(body)).toBe(true)
    })
  })
})
