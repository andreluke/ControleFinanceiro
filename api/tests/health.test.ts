import { describe, it, expect } from 'vitest'
import { buildApp } from '../src/config/app'

describe('Basic Routes', () => {
  it('should return health check status', async () => {
    const app = await buildApp()
    
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    })
    
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.payload)
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })
})
