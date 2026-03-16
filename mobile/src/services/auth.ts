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
      await api.post('/auth/logout')
    } finally {
      await api.clearToken()
    }
  },

  async me(): Promise<AuthResponse['user']> {
    return api.get<AuthResponse['user']>('/auth/me')
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await api.getToken()
    return !!token
  },
}
