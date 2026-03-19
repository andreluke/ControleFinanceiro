const mockApiPost = jest.fn()
const mockApiGet = jest.fn()
const mockApiPut = jest.fn()
const mockApiSetToken = jest.fn()
const mockApiGetToken = jest.fn()
const mockApiClearToken = jest.fn()

jest.mock('../services/api', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
    put: (...args: unknown[]) => mockApiPut(...args),
    setToken: (...args: unknown[]) => mockApiSetToken(...args),
    getToken: (...args: unknown[]) => mockApiGetToken(...args),
    clearToken: (...args: unknown[]) => mockApiClearToken(...args),
  },
}))

import { authService } from '../services/auth'

const createMockToken = (expOffsetSeconds = 3600) => {
  const now = Math.floor(Date.now() / 1000)
  const payload = { sub: 'user-123', email: 'test@test.com', iat: now, exp: now + expOffsetSeconds }
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = Buffer.from('signature').toString('base64url')
  return `${header}.${payloadBase64}.${signature}`
}

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockApiPost.mockReset()
    mockApiGet.mockReset()
    mockApiPut.mockReset()
    mockApiSetToken.mockReset()
    mockApiGetToken.mockReset()
    mockApiClearToken.mockReset()
    
    mockApiSetToken.mockResolvedValue(undefined)
    mockApiClearToken.mockResolvedValue(undefined)
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
      }
      mockApiPost.mockResolvedValue(mockResponse)

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      })
      expect(mockApiSetToken).toHaveBeenCalledWith('mock-token')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on invalid credentials', async () => {
      mockApiPost.mockRejectedValue(new Error('Credenciais inválidas'))

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Credenciais inválidas')
    })

    it('should pass rememberMe option', async () => {
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
      }
      mockApiPost.mockResolvedValue(mockResponse)

      await authService.login({ email: 'test@test.com', password: 'pass', rememberMe: true })

      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'pass',
        rememberMe: true,
      })
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 'user-1', name: 'New User', email: 'new@test.com' },
      }
      mockApiPost.mockResolvedValue(mockResponse)

      const result = await authService.register({
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
      })

      expect(mockApiPost).toHaveBeenCalledWith('/auth/register', {
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error if email exists', async () => {
      mockApiPost.mockRejectedValue(new Error('E-mail já cadastrado'))

      await expect(
        authService.register({ name: 'Test', email: 'exists@test.com', password: 'pass' })
      ).rejects.toThrow('E-mail já cadastrado')
    })
  })

  describe('logout', () => {
    it('should call logout endpoint and clear token', async () => {
      mockApiPost.mockResolvedValue({ message: 'Logout realizado' })

      await authService.logout()

      expect(mockApiPost).toHaveBeenCalledWith('/auth/logout', {})
      expect(mockApiClearToken).toHaveBeenCalled()
    })

    it('should still clear token even if logout fails', async () => {
      mockApiPost.mockRejectedValue(new Error('Network error'))

      try {
        await authService.logout()
      } catch {
        // Expected to throw
      }

      expect(mockApiClearToken).toHaveBeenCalled()
    })
  })

  describe('refreshToken', () => {
    it('should call refresh-token endpoint', async () => {
      mockApiPost.mockResolvedValue({ token: 'new-token' })

      const result = await authService.refreshToken()

      expect(mockApiPost).toHaveBeenCalledWith('/auth/refresh-token', {})
      expect(mockApiSetToken).toHaveBeenCalledWith('new-token')
      expect(result).toBe('new-token')
    })
  })

  describe('ensureValidToken', () => {
    it('should return current token if not expiring soon', async () => {
      const validToken = createMockToken(3600)
      mockApiGetToken.mockResolvedValue(validToken)

      const result = await authService.ensureValidToken()

      expect(result).toBe(validToken)
      expect(mockApiPost).not.toHaveBeenCalled()
    })

    it('should throw error if no token available', async () => {
      mockApiGetToken.mockResolvedValue(null)

      await expect(authService.ensureValidToken()).rejects.toThrow('No token available')
    })
  })

  describe('me', () => {
    it('should return user data', async () => {
      const mockUser = { id: 'user-1', name: 'Test', email: 'test@test.com' }
      mockApiGet.mockResolvedValue({ user: mockUser })

      const result = await authService.me()

      expect(mockApiGet).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockUser)
    })

    it('should throw if not authenticated', async () => {
      mockApiGet.mockRejectedValue(new Error('Não autenticado'))

      await expect(authService.me()).rejects.toThrow('Não autenticado')
    })
  })

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = { id: 'user-1', name: 'New Name', email: 'test@test.com' }
      mockApiPut.mockResolvedValue({ user: mockUser })

      const result = await authService.updateProfile('New Name')

      expect(mockApiPut).toHaveBeenCalledWith('/auth/me', { name: 'New Name' })
      expect(result).toEqual(mockUser)
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockApiPut.mockResolvedValue({ message: 'Senha alterada com sucesso' })

      const result = await authService.changePassword('oldpass', 'newpass')

      expect(mockApiPut).toHaveBeenCalledWith('/auth/me/password', {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      })
      expect(result).toEqual({ message: 'Senha alterada com sucesso' })
    })

    it('should throw if current password is wrong', async () => {
      mockApiPut.mockRejectedValue(new Error('Senha atual incorreta'))

      await expect(
        authService.changePassword('wrong', 'newpass')
      ).rejects.toThrow('Senha atual incorreta')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      mockApiGetToken.mockResolvedValue('valid-token')

      const result = await authService.isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when no token', async () => {
      mockApiGetToken.mockResolvedValue(null)

      const result = await authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
