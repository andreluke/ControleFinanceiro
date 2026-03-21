import { decodeJWT, isTokenExpiringSoon, getTokenExpiryDate } from '../utils/jwt'

function createMockJWT(payload: object, secret = 'test-secret'): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '')
  const signature = btoa(`${header}.${payloadBase64}.${secret}`)
  return `${header}.${payloadBase64}.${signature}`
}

describe('JWT Utils', () => {
  describe('decodeJWT', () => {
    it('should decode a valid JWT token', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { sub: 'user-123', email: 'test@example.com', iat: now, exp: now + 3600 }
      const token = createMockJWT(payload)

      const result = decodeJWT(token)

      expect(result).toBeDefined()
      expect(result?.sub).toBe('user-123')
      expect(result?.email).toBe('test@example.com')
      expect(result?.iat).toBe(now)
      expect(result?.exp).toBe(now + 3600)
    })

    it('should return null for invalid token format', () => {
      expect(decodeJWT('invalid-token')).toBeNull()
      expect(decodeJWT('only-two-parts')).toBeNull()
      expect(decodeJWT('')).toBeNull()
    })

    it('should return null for malformed base64', () => {
      const invalidToken = 'header.invalid!!!base64.signature'
      expect(decodeJWT(invalidToken)).toBeNull()
    })

    it('should correctly extract sub and email claims', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = {
        sub: 'user-456',
        email: 'user@example.com',
        iat: now,
        exp: now + 86400,
      }
      const token = createMockJWT(payload)

      const result = decodeJWT(token)

      expect(result?.sub).toBe('user-456')
      expect(result?.email).toBe('user@example.com')
    })
  })

  describe('isTokenExpiringSoon', () => {
    it('should return true if token expires in less than threshold', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { sub: 'user', email: 'test@test.com', iat: now, exp: now + 180 }
      const token = createMockJWT(payload)

      const result = isTokenExpiringSoon(token, 5)

      expect(result).toBe(true)
    })

    it('should return false if token has plenty of time', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { sub: 'user', email: 'test@test.com', iat: now, exp: now + 3600 }
      const token = createMockJWT(payload)

      const result = isTokenExpiringSoon(token, 5)

      expect(result).toBe(false)
    })

    it('should return true if token is expired', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { sub: 'user', email: 'test@test.com', iat: now - 7200, exp: now - 3600 }
      const token = createMockJWT(payload)

      const result = isTokenExpiringSoon(token, 5)

      expect(result).toBe(true)
    })

    it('should return true for invalid token', () => {
      expect(isTokenExpiringSoon('invalid', 5)).toBe(true)
      expect(isTokenExpiringSoon('', 5)).toBe(true)
    })

    it('should use custom threshold when provided', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { sub: 'user', email: 'test@test.com', iat: now, exp: now + 180 }
      const token = createMockJWT(payload)

      expect(isTokenExpiringSoon(token, 5)).toBe(true)
      expect(isTokenExpiringSoon(token, 4)).toBe(true)
      expect(isTokenExpiringSoon(token, 3)).toBe(true)
      expect(isTokenExpiringSoon(token, 2)).toBe(false)
    })

    it('should handle boundary condition at exactly threshold', () => {
      const now = Math.floor(Date.now() / 1000)
      const fiveMinutesInSeconds = 5 * 60
      const payload = {
        sub: 'user',
        email: 'test@test.com',
        iat: now,
        exp: now + fiveMinutesInSeconds,
      }
      const token = createMockJWT(payload)

      const result = isTokenExpiringSoon(token, 5)

      expect(result).toBe(true)
    })
  })

  describe('getTokenExpiryDate', () => {
    it('should return Date object for valid token', () => {
      const now = Math.floor(Date.now() / 1000)
      const expTime = now + 3600
      const payload = { sub: 'user', email: 'test@test.com', iat: now, exp: expTime }
      const token = createMockJWT(payload)

      const result = getTokenExpiryDate(token)

      expect(result).toBeInstanceOf(Date)
      expect(result?.getTime()).toBe(expTime * 1000)
    })

    it('should return null for invalid token', () => {
      expect(getTokenExpiryDate('invalid')).toBeNull()
      expect(getTokenExpiryDate('')).toBeNull()
    })

    it('should return correct expiry date', () => {
      const futureDate = new Date('2025-12-31T23:59:59Z')
      const expTime = Math.floor(futureDate.getTime() / 1000)
      const payload = { sub: 'user', email: 'test@test.com', iat: expTime - 3600, exp: expTime }
      const token = createMockJWT(payload)

      const result = getTokenExpiryDate(token)

      expect(result?.toISOString()).toBe(futureDate.toISOString())
    })
  })
})
