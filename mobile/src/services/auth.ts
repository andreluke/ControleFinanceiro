import { api } from './api'
import { isTokenExpiringSoon } from '../utils/jwt'

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
  }
}

let lastRefreshAttempt = 0
const REFRESH_COOLDOWN = 60 * 1000

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    await api.setToken(response.token)
    return response
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    await api.setToken(response.token)
    return response
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {})
    } finally {
      await api.clearToken()
    }
  },

  async refreshToken(): Promise<string> {
    const now = Date.now()
    if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
      const token = await api.getToken()
      if (token) return token
    }

    lastRefreshAttempt = now
    const response = await api.post<{ token: string }>('/auth/refresh-token', {})
    await api.setToken(response.token)
    return response.token
  },

  async ensureValidToken(): Promise<string> {
    const token = await api.getToken()
    if (!token) throw new Error('No token available')

    if (isTokenExpiringSoon(token, 5)) {
      return this.refreshToken()
    }

    return token
  },

  async me(): Promise<AuthResponse['user']> {
    const response = await api.get<{ user: AuthResponse['user'] }>('/auth/me')
    return response.user
  },

  async updateProfile(name: string): Promise<AuthResponse['user']> {
    const response = await api.put<{ user: AuthResponse['user'] }>('/auth/me', { name })
    return response.user
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return api.put<{ message: string }>('/auth/me/password', { currentPassword, newPassword })
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await api.getToken()
    return !!token
  },
}
