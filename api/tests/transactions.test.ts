import { describe, it, expect, beforeAll } from 'vitest'
import { buildApp } from '../src/config/app'
import { AuthModel } from '../src/modules/auth/auth.model'
import { CategoryModel } from '../src/modules/categories/categories.model'
import { PaymentMethodModel } from '../src/modules/payment-methods/payment-methods.model'
import { TransactionModel } from '../src/modules/transactions/transactions.model'

describe('Transactions Module', () => {
  const transactionModel = new TransactionModel()
  const categoryModel = new CategoryModel()
  const methodModel = new PaymentMethodModel()
  const authModel = new AuthModel()
  
  let app: any
  let token: string
  let userId: string
  let categoryId: string
  let paymentMethodId: string

  beforeAll(async () => {
    app = await buildApp()
    
    const email = `trans-test-${Date.now()}@example.com`
    const user = await authModel.createUser({
      name: 'Trans Tester',
      email,
      password: 'password123'
    })
    userId = user.id
    token = await app.jwt.sign({ sub: user.id, email: user.email })

    const category = await categoryModel.createCategory(userId, { name: 'Food' })
    categoryId = category.id

    const method = await methodModel.createMethod(userId, { name: 'Debit Card' })
    paymentMethodId = method.id
  })

  describe('TransactionModel', () => {
    it('should create a transaction', async () => {
      const transaction = await transactionModel.createTransaction(userId, {
        description: 'Lunch',
        amount: 25.50,
        type: 'expense',
        date: new Date().toISOString(),
        categoryId,
        paymentMethodId
      })

      expect(transaction).toBeDefined()
      expect(transaction.description).toBe('Lunch')
      expect(transaction.amount).toBe("25.50")
    })

    it('should list transactions with filters', async () => {
      await transactionModel.createTransaction(userId, {
        description: 'Salary',
        amount: 5000,
        type: 'income',
        date: new Date().toISOString()
      })

      const filters = { page: 1, limit: 10 }
      const result = await transactionModel.findAll(userId, filters)
      expect(result.data.length).toBeGreaterThanOrEqual(1)
      expect(result.total).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Transaction Routes', () => {
    it('should list transactions via API', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/transactions?page=1&limit=10',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.data).toBeDefined()
    })

    it('should create transaction via API', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          description: 'Groceries',
          amount: 150.75,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId,
          paymentMethodId
        }
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.payload)
      expect(body.description).toBe('Groceries')
    })
  })
})
