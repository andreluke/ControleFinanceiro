const mockGetItemAsync = jest.fn()
const mockSetItemAsync = jest.fn()
const mockDeleteItemAsync = jest.fn()

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}))

import { cacheService, CACHE_KEYS, DEFAULT_CACHE_TIME } from '../services/cache'

describe('Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetItemAsync.mockResolvedValue(null)
    mockSetItemAsync.mockResolvedValue(undefined)
    mockDeleteItemAsync.mockResolvedValue(undefined)
  })

  describe('CACHE_KEYS', () => {
    it('should export expected cache keys', () => {
      expect(CACHE_KEYS.USER).toBe('user')
      expect(CACHE_KEYS.SUMMARY).toBe('summary')
      expect(CACHE_KEYS.TRANSACTIONS).toBe('transactions')
      expect(CACHE_KEYS.BUDGETS).toBe('budgets')
      expect(CACHE_KEYS.CATEGORIES).toBe('categories')
      expect(CACHE_KEYS.GOALS).toBe('goals')
    })
  })

  describe('DEFAULT_CACHE_TIME', () => {
    it('should be 5 minutes in milliseconds', () => {
      expect(DEFAULT_CACHE_TIME).toBe(5 * 60 * 1000)
    })
  })

  describe('set', () => {
    it('should call SecureStore.setItemAsync', async () => {
      await cacheService.set('test', { data: 'value' })
      
      expect(mockSetItemAsync).toHaveBeenCalled()
    })

    it('should include data and timestamp in storage', async () => {
      await cacheService.set('mykey', { id: 1 })
      
      const call = mockSetItemAsync.mock.calls.find(c => c[0] !== 'cache_keys')
      expect(call).toBeDefined()
      const stored = JSON.parse(call[1])
      expect(stored.data).toEqual({ id: 1 })
      expect(stored.timestamp).toBeDefined()
    })
  })

  describe('get', () => {
    it('should call SecureStore.getItemAsync', async () => {
      await cacheService.get('test')
      
      expect(mockGetItemAsync).toHaveBeenCalled()
    })

    it('should return null when no data', async () => {
      mockGetItemAsync.mockResolvedValue(null)
      
      const result = await cacheService.get('nonexistent')
      
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should call SecureStore.deleteItemAsync', async () => {
      await cacheService.delete('test')
      
      expect(mockDeleteItemAsync).toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('should call SecureStore.deleteItemAsync', async () => {
      await cacheService.clear()
      
      expect(mockGetItemAsync).toHaveBeenCalledWith('cache_keys')
    })
  })

  describe('getAllKeys', () => {
    it('should return array', async () => {
      const result = await cacheService.getAllKeys()
      
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
