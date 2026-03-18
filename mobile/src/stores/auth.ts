import { create } from 'zustand'
import { authService } from '../services'

interface User {
  id: string
  name: string
  email: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user }),

  checkAuth: async () => {
    try {
      const isAuth = await authService.isAuthenticated()
      if (isAuth) {
        const user = await authService.me()
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    set({ user: response.user, isAuthenticated: true })
  },

  register: async (name: string, email: string, password: string) => {
    const response = await authService.register({ name, email, password })
    set({ user: response.user, isAuthenticated: true })
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, isAuthenticated: false })
  },
}))
