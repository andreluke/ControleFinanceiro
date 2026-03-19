import { api } from '../services/api'

const mockFetch = jest.fn()

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}))

global.fetch = mockFetch

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    api.clearToken()
    mockFetch.mockReset()
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' }),
    })
  })

  describe('setToken / getToken / clearToken', () => {
    it('should store and retrieve token', async () => {
      await api.setToken('test-token')
      const token = await api.getToken()
      expect(token).toBe('test-token')
    })

    it('should clear token', async () => {
      await api.setToken('test-token')
      await api.clearToken()
      const token = await api.getToken()
      expect(token).toBeNull()
    })
  })

  describe('GET requests', () => {
    it('should construct URL with query params', async () => {
      await api.get('/test', { id: 1, name: 'test' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test?id=1&name=test'),
        expect.any(Object)
      )
    })

    it('should filter undefined values', async () => {
      await api.get('/test', { id: 1, name: undefined })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test?id=1'),
        expect.any(Object)
      )
    })

    it('should not include query string if no params', async () => {
      await api.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.any(Object)
      )
    })
  })

  describe('POST requests', () => {
    it('should stringify body data', async () => {
      await api.post('/test', { name: 'test' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      )
    })

    it('should not include body if undefined', async () => {
      await api.post('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      )
    })
  })

  describe('PUT requests', () => {
    it('should stringify body data', async () => {
      await api.put('/test', { name: 'updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' }),
        })
      )
    })
  })

  describe('DELETE requests', () => {
    it('should use DELETE method', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ deleted: true }),
      })

      await api.delete('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('PATCH requests', () => {
    it('should stringify body data', async () => {
      await api.patch('/test', { active: true })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ active: true }),
        })
      )
    })

    it('should send "{}" for PATCH with empty body', async () => {
      await api.patch('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: '{}',
        })
      )
    })
  })

  describe('Authentication header', () => {
    it('should include auth header when token exists', async () => {
      await api.setToken('bearer-token')
      await api.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer bearer-token',
          }),
        })
      )
    })

    it('should not include auth header when no token', async () => {
      await api.clearToken()
      await api.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({ Authorization: expect.any(String) }),
        })
      )
    })
  })

  describe('Content-Type header', () => {
    it('should always include Content-Type', async () => {
      await api.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should throw error with message from API response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Validation error' }),
      })

      await expect(api.get('/test')).rejects.toThrow('Validation error')
    })

    it('should throw generic error for non-JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Parse error')),
      })

      await expect(api.get('/test')).rejects.toThrow('Erro desconhecido')
    })
  })

  describe('Response parsing', () => {
    it('should parse JSON response', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      })

      const result = await api.get<typeof mockData>('/test')

      expect(result).toEqual(mockData)
    })
  })
})
