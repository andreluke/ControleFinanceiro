import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function tryRefreshToken(): Promise<string | null> {
  if (isRefreshing) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const { authService } = await import('./auth')
      const newToken = await authService.refreshToken()
      return newToken
    } catch {
      const { useAuthStore } = await import('../stores/auth')
      useAuthStore.getState().logout()
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

class ApiClient {
  private token: string | null = null

  async setToken(token: string) {
    this.token = token
    await SecureStore.setItemAsync('auth_token', token)
  }

  async getToken(): Promise<string | null> {
    if (this.token) return this.token
    this.token = await SecureStore.getItemAsync('auth_token')
    return this.token
  }

  async clearToken() {
    this.token = null
    await SecureStore.deleteItemAsync('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuth = true
  ): Promise<T> {
    const token = await this.getToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401 && retryOnAuth && endpoint !== '/auth/refresh-token') {
      const newToken = await tryRefreshToken()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        })

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ message: 'Erro desconhecido' }))
          throw new Error(error.message || `Erro ${retryResponse.status}`)
        }

        return retryResponse.json()
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
      throw new Error(error.message || `Erro ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const filteredParams = params 
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
      : undefined
    const url = filteredParams
      ? `${endpoint}?${new URLSearchParams(filteredParams as Record<string, string>).toString()}`
      : endpoint
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : '{}',
    })
  }
}

export const api = new ApiClient()
