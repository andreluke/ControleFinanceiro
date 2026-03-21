const mockStorage = {}

const mockSecureStore = {
  getItemAsync: jest.fn(async (key) => mockStorage[key] || null),
  setItemAsync: jest.fn(async (key, value) => {
    mockStorage[key] = value
  }),
  deleteItemAsync: jest.fn(async (key) => {
    delete mockStorage[key]
  }),
  isAvailableAsync: jest.fn(async () => true),
}

jest.mock('expo-secure-store', () => mockSecureStore)

const mockFetch = jest.fn()

global.fetch = mockFetch

jest.mock('../theme/tokens', () => ({
  colors: {
    primary: '#3B82F6',
    secondary: '#71717A',
    foreground: '#FAFAFA',
    background: '#09090B',
    muted: '#27272A',
    border: '#3F3F46',
    card: '#18181B',
    input: '#27272A',
    danger: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  shadows: {
    sm: {},
    md: {},
    lg: {},
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
})
