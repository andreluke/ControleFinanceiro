import { api } from './api'

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
  user: {
    id: string
    name: string
    email: string
  }
}

export interface AuthMeResponse {
  user: {
    id: string 
    name: string
    email: string
    createdAt: string
  }
}

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

  async me(): Promise<AuthResponse['user']> {
    const response = await api.get<AuthMeResponse>('/auth/me')
    return response.user
  },

  async updateProfile(name: string): Promise<AuthResponse['user']> {
    const response = await api.put<AuthMeResponse>('/auth/me', { name })
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
