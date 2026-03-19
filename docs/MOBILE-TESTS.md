# Mobile - Plano de Testes Automatizados

## Framework

**Jest** - Estável, compatível com Expo/React Native, boa integração TypeScript

```bash
pnpm add -D jest @types/jest @babel/preset-typescript @babel/preset-env
```

## Estrutura de Diretórios

```
mobile/
├── src/
│   └── __tests__/
│       ├── setup.ts              # Mocks globais (SecureStore, fetch, theme)
│       ├── jwt.test.ts           # ✅ 13 testes
│       ├── auth.test.ts          # ✅ 18 testes
│       ├── api.test.ts           # ✅ 18 testes
│       ├── cache.test.ts         # ✅ 7 testes
│       └── components/
│           └── theme.test.ts     # ✅ 19 testes
├── jest.config.js
├── babel.config.js
└── package.json
```

---

## Testes Implementados

### ✅ JWT Utils (`src/__tests__/jwt.test.ts`) - 13 testes

| Teste | Status |
|-------|--------|
| `decodeJWT` - decodifica token válido | ✅ |
| `decodeJWT` - retorna null para token inválido | ✅ |
| `decodeJWT` - retorna null para base64 malformado | ✅ |
| `decodeJWT` - extrai sub e email corretamente | ✅ |
| `isTokenExpiringSoon` - true se expira em menos de threshold | ✅ |
| `isTokenExpiringSoon` - false se tem tempo suficiente | ✅ |
| `isTokenExpiringSoon` - true se expirado | ✅ |
| `isTokenExpiringSoon` - true para token inválido | ✅ |
| `isTokenExpiringSoon` - usa threshold customizado | ✅ |
| `isTokenExpiringSoon` - condição de fronteira | ✅ |
| `getTokenExpiryDate` - retorna Date para token válido | ✅ |
| `getTokenExpiryDate` - retorna null para token inválido | ✅ |
| `getTokenExpiryDate` - retorna data correta | ✅ |

### ✅ Auth Service (`src/__tests__/auth.test.ts`) - 18 testes

| Teste | Status |
|-------|--------|
| `login` - login com credenciais válidas | ✅ |
| `login` - erro em credenciais inválidas | ✅ |
| `login` - passa rememberMe | ✅ |
| `register` - registro com sucesso | ✅ |
| `register` - erro se email existe | ✅ |
| `logout` - chama endpoint e limpa token | ✅ |
| `logout` - limpa token mesmo se logout falha | ✅ |
| `refreshToken` - chama endpoint refresh | ✅ |
| `ensureValidToken` - retorna token se não expirando | ✅ |
| `ensureValidToken` - lança erro se sem token | ✅ |
| `me` - retorna dados do usuário | ✅ |
| `me` - lança erro se não autenticado | ✅ |
| `updateProfile` - atualiza perfil | ✅ |
| `changePassword` - altera senha | ✅ |
| `changePassword` - erro se senha errada | ✅ |
| `isAuthenticated` - true com token | ✅ |
| `isAuthenticated` - false sem token | ✅ |

### ✅ API Client (`src/__tests__/api.test.ts`) - 18 testes

| Teste | Status |
|-------|--------|
| `setToken/getToken/clearToken` - store/retrieve | ✅ |
| `setToken/getToken/clearToken` - clear | ✅ |
| `GET` - URL com query params | ✅ |
| `GET` - filtra valores undefined | ✅ |
| `GET` - sem query string se sem params | ✅ |
| `POST` - stringify body | ✅ |
| `POST` - body undefined se não fornecido | ✅ |
| `PUT` - stringify body | ✅ |
| `DELETE` - método DELETE | ✅ |
| `PATCH` - stringify body | ✅ |
| `PATCH` - "{}" para body vazio | ✅ |
| Auth header - incluso com token | ✅ |
| Auth header - não incluso sem token | ✅ |
| Content-Type - sempre incluso | ✅ |
| Error - erro com mensagem da API | ✅ |
| Error - erro genérico para JSON inválido | ✅ |
| Response parsing - parse JSON | ✅ |

### ✅ Cache Service (`src/__tests__/cache.test.ts`) - 7 testes

| Teste | Status |
|-------|--------|
| `CACHE_KEYS` - exporta chaves esperadas | ✅ |
| `DEFAULT_CACHE_TIME` - 5 minutos | ✅ |
| `set` - chama SecureStore | ✅ |
| `set` - inclui data e timestamp | ✅ |
| `get` - chama SecureStore | ✅ |
| `get` - retorna null quando vazio | ✅ |
| `delete` - chama SecureStore | ✅ |
| `clear` - chama SecureStore | ✅ |
| `getAllKeys` - retorna array | ✅ |

---

**Total: 75 testes passando** ✅

### Coverage Atual

| Arquivo | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| `services/api.ts` | 56% | 60% | 78% | 56% |
| `services/auth.ts` | 88% | 50% | 100% | 90% |
| `services/cache.ts` | 65% | 52% | 71% | 65% |
| `utils/jwt.ts` | 100% | 80% | 100% | 100% |

### Notas sobre Component Tests

Testes de componentes UI (Button, Input, Card, Badge, Progress) foram removidos porque:
- React Native usa módulos nativos complexos (StyleSheet, react-native-svg, etc.)
- `react-test-renderer` tem problemas de compatibilidade com React 19
- Mocks de `react-native-gesture-handler` e `react-native-reanimated` são problemáticos

Alternativas para testar componentes:
1. Usar `@testing-library/react-native` com Jest experimental
2. Testes manuais no Expo Go
3. Testes E2E com Detox

---

## CI/CD

### GitHub Actions

Workflow em `.github/workflows/mobile-tests.yml`:

```yaml
on:
  push:
    branches: [main, develop]
    paths: ['mobile/**']
  pull_request:
    branches: [main, develop]
    paths: ['mobile/**']

jobs:
  test:
    - Checkout
    - Setup pnpm
    - Setup Node.js 22
    - Install dependencies
    - Run TypeScript check
    - Run tests
    - Run tests with coverage
    - Upload to Codecov
```

### Codecov Integration

Adicione `codecov.yml` na raiz:

```yaml
coverage:
  precision: 2
  round: down
  status:
    project:
      default:
        target: 50%
    patch:
      default:
        target: 50%
```

---

## Estrutura de Diretórios

```
mobile/
├── src/
│   └── __tests__/
│       ├── setup.ts              # Mocks globais
│       ├── jwt.test.ts           # JWT utils (100% coverage)
│       ├── auth.test.ts          # Auth service
│       ├── api.test.ts           # API client
│       ├── cache.test.ts         # Cache service
│       └── components/
│           └── theme.test.ts     # Theme tokens
├── jest.config.js
├── babel.config.js
└── package.json
```

---

## 1. Testes Unitários - Utils

### `src/utils/jwt.test.ts`

```typescript
describe('JWT Utils', () => {
  describe('decodeJWT', () => {
    it('should decode a valid JWT token')
    it('should return null for invalid token format')
    it('should return null for empty string')
    it('should correctly extract sub and email claims')
  })

  describe('isTokenExpiringSoon', () => {
    it('should return true if token expires in less than threshold')
    it('should return false if token has plenty of time')
    it('should return true if token is expired')
    it('should return true for invalid token')
    it('should use custom threshold when provided')
  })

  describe('getTokenExpiryDate', () => {
    it('should return Date object for valid token')
    it('should return null for invalid token')
    it('should return correct expiry date')
  })
})
```

---

## 2. Testes Unitários - Services

### `src/services/auth.test.ts`

```typescript
describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.clearToken()
  })

  describe('login', () => {
    it('should login successfully with valid credentials')
    it('should store token in api')
    it('should return user data and token')
    it('should throw error on invalid credentials')
    it('should handle network errors')
  })

  describe('register', () => {
    it('should register successfully')
    it('should throw error if email exists')
    it('should validate password length')
  })

  describe('logout', () => {
    it('should call logout endpoint')
    it('should clear token from storage')
  })

  describe('refreshToken', () => {
    it('should call refresh-token endpoint')
    it('should update stored token')
    it('should implement cooldown to prevent rapid refreshes')
    it('should throttle refresh attempts within cooldown period')
  })

  describe('ensureValidToken', () => {
    it('should return current token if not expiring soon')
    it('should refresh if token is expiring soon')
    it('should throw error if no token available')
  })

  describe('me', () => {
    it('should return user data')
    it('should throw if not authenticated')
  })
})
```

### `src/services/api.test.ts`

```typescript
describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.clearToken()
  })

  describe('request', () => {
    it('should include auth header when token exists')
    it('should not include auth header when no token')
    it('should parse JSON response')
    it('should throw error with message from API')
    it('should handle non-JSON error responses')
  })

  describe('GET requests', () => {
    it('should construct query string from params')
    it('should filter undefined values')
  })

  describe('POST requests', () => {
    it('should stringify body data')
    it('should handle undefined body')
  })

  describe('401 handling', () => {
    it('should attempt token refresh on 401')
    it('should retry request with new token after refresh')
    it('should logout if refresh fails')
    it('should not retry for refresh-token endpoint itself')
    it('should only retry once per request')
  })
})
```

### `src/services/cache.test.ts`

```typescript
describe('Cache Service', () => {
  beforeEach(() => {
    cacheService.clear()
  })

  describe('get', () => {
    it('should return cached data')
    it('should return null if not found')
    it('should return null if expired')
    it('should delete expired items from storage')
  })

  describe('set', () => {
    it('should store data with timestamp')
    it('should handle large data within limits')
    it('should skip data exceeding storage limit')
  })

  describe('delete', () => {
    it('should remove item from cache')
    it('should update cache_keys list')
  })

  describe('clear', () => {
    it('should clear all cached items')
    it('should clear all keys')
  })

  describe('deletePattern', () => {
    it('should delete items matching pattern')
    it('should not delete non-matching items')
  })

  describe('getAllKeys', () => {
    it('should return all cache keys')
  })
})
```

---

## 3. Testes Unitários - Stores

### `src/stores/auth.test.ts`

```typescript
describe('Auth Store', () => {
  beforeEach(() => {
    authStore.setState({ user: null, isAuthenticated: false })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have user as null')
    it('should have isAuthenticated as false')
    it('should have isLoading as true')
  })

  describe('checkAuth', () => {
    it('should authenticate and load user when token exists')
    it('should call ensureValidToken')
    it('should remain unauthenticated without token')
    it('should set isLoading to false after check')
  })

  describe('login', () => {
    it('should set user and isAuthenticated on success')
    it('should clear cache on login')
    it('should throw and not set state on failure')
  })

  describe('register', () => {
    it('should set user and isAuthenticated on success')
    it('should clear cache on register')
  })

  describe('logout', () => {
    it('should clear user and isAuthenticated')
    it('should call api.clearToken')
    it('should clear cache')
  })

  describe('setUser', () => {
    it('should update user state')
  })
})
```

---

## 4. Testes de Componentes UI

### `src/components/ui/Button.test.tsx`

```typescript
describe('Button Component', () => {
  it('should render with children')
  it('should call onPress when pressed')
  it('should not call onPress when disabled')
  it('should show loading indicator when loading')
  it('should apply variant styles correctly')
  it('should apply size styles correctly')
})
```

### `src/components/ui/Input.test.tsx`

```typescript
describe('Input Component', () => {
  it('should render with label')
  it('should call onChangeText on input')
  it('should toggle password visibility')
  it('should show error message')
  it('should be disabled when specified')
})
```

### `src/components/ui/Card.test.tsx`

```typescript
describe('Card Component', () => {
  it('should render children')
  it('should apply custom className')
  it('should render with header and footer')
})
```

---

## 5. Testes de Integração (E2E-like)

### Fluxos de Autenticação

```typescript
describe('Auth Flows', () => {
  describe('Login Flow', () => {
    it('should navigate to home on successful login')
    it('should show error on failed login')
    it('should persist login across app restart')
  })

  describe('Token Refresh Flow', () => {
    it('should automatically refresh expiring token')
    it('should retry failed request after refresh')
    it('should logout if refresh fails')
  })

  describe('Logout Flow', () => {
    it('should clear all data on logout')
    it('should redirect to login')
  })
})
```

---

## 6. Testes de Mocks

### Configuração de Mocks

```typescript
// src/__tests__/mocks.ts
export const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  setToken: vi.fn(),
  getToken: vi.fn(),
  clearToken: vi.fn(),
}

export const mockSecureStore = {
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}

vi.mock('expo-secure-store', () => mockSecureStore)
```

---

## 7. Testes de Regressão - Bugs Conhecidos

Registrar bugs e criar testes para garantir que não voltem:

```typescript
describe('Regression Tests', () => {
  describe('Issue: SecureStore 2048 byte limit', () => {
    it('should not crash when cache data exceeds limit')
    it('should gracefully skip large cache items')
  })

  describe('Issue: PATCH with empty body', () => {
    it('should send "{}" as body for PATCH requests')
  })

  describe('Issue: Concurrent refresh attempts', () => {
    it('should debounce concurrent refresh calls')
    it('should not make multiple refresh requests simultaneously')
  })
})
```

---

## 8. Cobertura de Testes

### Metas de Cobertura

| Área | Meta |
|------|------|
| Utils | 90% |
| Services | 80% |
| Stores | 85% |
| Components | 60% |

### Comandos

```bash
# Rodar testes
pnpm test

# Rodar com coverage
pnpm test:coverage

# Rodar em watch mode
pnpm test:watch

# Rodar testes específicos
pnpm test -- src/utils/jwt.test.ts
```

---

## 9. CI/CD

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm tsc --noEmit
```

---

## 10. Priorização

### Fase 1 - Críticos (JWT e Auth)
- `decodeJWT` - usados em todo lugar
- `isTokenExpiringSoon` - lógica de refresh
- `authService.ensureValidToken` - fluxo principal
- `api.ts` 401 handling - resiliência

### Fase 2 - Serviços
- `authService` - login, logout, refresh
- `cacheService` - offline support

### Fase 3 - Stores
- `authStore` - estado global

### Fase 4 - Componentes UI
- Button, Input, Card
- Form components

---

## Checklist de Implementação

- [x] Instalar Jest e dependências
- [x] Configurar `jest.config.js`
- [x] Configurar `babel.config.js` com presets para React e TypeScript
- [x] Criar mocks para SecureStore e fetch
- [x] Implementar testes de `jwt.ts` (13 testes, 100% coverage)
- [x] Implementar testes de `auth.ts` (18 testes, 90% lines)
- [x] Implementar testes de `api.ts` (18 testes, 56% lines)
- [x] Implementar testes de `cache.ts` (7 testes, 65% lines)
- [x] Implementar testes de `theme.ts` (19 testes)
- [x] Configurar GitHub Actions em `.github/workflows/mobile-tests.yml`
- [x] Configurar coverage report
- [ ] Implementar testes de `authStore` (futuro)
- [ ] Implementar testes de componentes UI (futuro - requer configuração adicional)
