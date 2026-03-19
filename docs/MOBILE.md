# Mobile - ControleFinanceiro App

## Stack

- **Framework**: React Native (Expo SDK 54)
- **Linguagem**: TypeScript
- **Router**: Expo Router
- **Data Fetching**: TanStack React Query
- **State**: Zustand
- **HTTP**: Fetch API nativo
- **Formulários**: React Hook Form + Zod
- **UI**: Componentes customizados + react-native-svg
- **Gestures**: react-native-gesture-handler + @gorhom/bottom-sheet
- **Animações**: react-native-reanimated
- **Cache**: SecureStore + cache em memória
- **Ícones**: SVG customizados

## Scripts

```bash
pnpm start           # desenvolvimento (Expo)
pnpm start --web     # versão web
pnpm android         # build Android (Expo)
pnpm ios             # build iOS (Expo)
```

## Estrutura de Arquivos

```
mobile/
├── app/                    # Rotas Expo Router
│   ├── _layout.tsx         # Layout raiz
│   ├── (auth)/            # Rotas de autenticação
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Rotas com tabs
│   │   ├── _layout.tsx     # Configuração das tabs
│   │   ├── index.tsx       # Dashboard
│   │   ├── transactions.tsx
│   │   ├── recurring.tsx
│   │   ├── goals.tsx
│   │   ├── budgets.tsx
│   │   └── categories.tsx
│   ├── (more)/            # Mais opções
│   │   ├── profile.tsx
│   │   └── export.tsx
│   └── add-transaction.tsx # FAB - adicionar transação
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes base (Button, Input, Card, Modal, etc.)
│   │   ├── icons/        # Ícones SVG customizados
│   │   ├── forms/        # Formulários customizados
│   │   ├── charts/       # Gráficos (recharts via web)
│   │   └── lists/        # Componentes de lista
│   ├── hooks/            # Custom hooks
│   ├── services/         # API calls (api.ts, transactions.ts, etc.)
│   ├── stores/           # Zustand stores
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Helpers (jwt.ts, date, currency)
│   ├── theme/            # Tokens de design (colors, spacing)
│   └── validators/       # Validações Zod
├── package.json
└── app.json
```

---

## Telas

### Autenticação (`(auth)`)

| Tela | Rota | Descrição |
|------|------|-----------|
| Login | `/login` | Login com email/senha |
| Registro | `/register` | Criar conta |

**Features**:
- Validação Zod
- Toggle mostrar/ocultar senha
- Remember Me (mantém token por 7 dias)
- UI moderna com ícones

### Dashboard (`/`)

- **KPIs**: Saldo Total, Receita no Mês, Despesa no Mês
- **Gráficos**: Donut por categoria (despesas/receitas), Barras, Linha de evolução
- **Últimas transações**: Lista resumida
- **Pull-to-refresh**: Atualização manual

### Transações (`/transactions`)

- Lista com busca
- Filtros: tipo, categoria, data
- Ordenação: data, valor
- Pull-to-refresh
- FAB para adicionar

### Transações Recorrentes (`/recurring`)

- Lista de recorrências
- Toggle ativar/desativar
- Criar/editar/deletar
- Gerar transação manualmente

### Metas de Economia (`/goals`)

- Cards com progresso visual
- Modal: depósito/saque
- Histórico de movimentações
- Barra de progresso

### Orçamentos (`/budgets`)

- Lista por categoria do mês
- Progress bar de gastos
- KPIs: orçado/gasto/restante
- Badges de alerta

### Categorias (`/categories`)

- Tabs: Categorias / Subcategorias / Formas de pagamento
- CRUD completo
- Color picker
- Ícones

### Mais (`/more`)

- Perfil: editar nome, alterar senha
- Exportar: PDF, CSV, Excel

---

## Serviços (Services)

Serviços encapsulam chamadas API. Cada recurso tem seu próprio arquivo:

| Serviço | Descrição |
|---------|-----------|
| `services/api.ts` | Cliente fetch com interceptors e auto-refresh |
| `services/auth.ts` | Autenticação + JWT utils |
| `services/transactions.ts` | Transações |
| `services/categories.ts` | Categorias |
| `services/subcategories.ts` | Subcategorias |
| `services/paymentMethods.ts` | Formas de pagamento |
| `services/budgets.ts` | Orçamentos |
| `services/recurring.ts` | Transações recorrentes |
| `services/goals.ts` | Metas de economia |
| `services/summary.ts` | Resumos |
| `services/cache.ts` | Cache com SecureStore |
| `services/export.ts` | Exportação de dados |

---

## Stores (Zustand)

| Store | Descrição |
|-------|-----------|
| `stores/auth.ts` | Autenticação, usuário, login/logout |

---

## Componentes UI

Componentes base em `src/components/ui/`:

| Componente | Descrição |
|------------|-----------|
| Button | Botão com variants |
| Input | Campo de texto com toggle senha |
| Card | Container de card |
| Modal | Modal com Bottom Sheet |
| Badge | Badge com variants |
| Progress | Barra de progresso |
| Skeleton | Loading placeholder |
| DatePicker | Seletor de data |
| ColorPicker | Seletor de cor |
| Card | Card container |

---

## Autenticação e Token

### Fluxo de Autenticação

1. **Login/Register**: Recebe token JWT da API
2. **Token Storage**: Armazenado no SecureStore
3. **Auto-refresh**: Se faltam 5min para expirar, renova automaticamente
4. **Retry 401**: Se receber 401, tenta refresh antes de deslogar

### Arquivos

- `src/utils/jwt.ts`: `decodeJWT()`, `isTokenExpiringSoon()`
- `src/services/auth.ts`: `ensureValidToken()`, `refreshToken()`
- `src/services/api.ts`: Interceptor 401 com retry

### Refresh Proativo

```typescript
// ensureValidToken() verifica se o token expira em menos de 5 minutos
// Se sim, renova automaticamente antes da próxima requisição
const token = await authService.ensureValidToken()
```

### Expiração do Token

- **Sem Remember Me**: 24 horas
- **Com Remember Me**: 7 dias
- **Refresh Endpoint**: `POST /auth/refresh-token` renova para 7 dias

---

## Cache Offline

### Sistema

- **Storage**: SecureStore (2048 bytes limite)
- **Cache em memória**: Map com timestamp
- **Tempo padrão**: 5 minutos
- **Invalidação**: Em mutações (create/update/delete)

### API de Cache

```typescript
cacheService.get<T>(key)      // Pegar do cache
cacheService.set<T>(key, data) // Salvar no cache
cacheService.delete(key)      // Invalidar
cacheService.clear()          // Limpar tudo
```

### Keys de Cache

```typescript
CACHE_KEYS.USER
CACHE_KEYS.SUMMARY
CACHE_KEYS.SUMMARY_MONTHLY
CACHE_KEYS.TRANSACTIONS
CACHE_KEYS.BUDGETS
CACHE_KEYS.CATEGORIES
CACHE_KEYS.SUBCATEGORIES
CACHE_KEYS.PAYMENT_METHODS
CACHE_KEYS.RECURRING
CACHE_KEYS.GOALS
```

---

## API Client

O `services/api.ts` configura:

- Base URL via `EXPO_PUBLIC_API_URL`
- Token JWT no Authorization header
- Auto-refresh on 401 com retry
- Cache inteligente
- Tratamento de erros

---

## Hooks

| Hook | Descrição |
|------|-----------|
| `useCachedData` | Hook para dados com cache |

---

## Tipos (Types)

Tipos em `src/types/index.ts`:

| Tipo | Descrição |
|------|-----------|
| `Transaction` | Transação |
| `Budget` | Orçamento |
| `Goal` | Meta |
| `Category` | Categoria |
| `Subcategory` | Subcategoria |
| `PaymentMethod` | Forma de pagamento |
| `RecurringTransaction` | Transação recorrente |
| `Summary` | Resumo geral |
| `MonthlySummary` | Resumo mensal |
| `CategorySummary` | Resumo por categoria |

---

## Tema e Design

Tokens em `src/theme/tokens.ts`:

- Cores (background, foreground, primary, secondary, etc.)
- Espaçamentos
- Border radius
- Sombras

### Cores Padrão

- **Background**: `#09090B` (dark)
- **Primary**: `#3B82F6` (blue)
- **Success**: `#22C55E` (green)
- **Danger**: `#EF4444` (red)
- **Warning**: `#F59E0B` (yellow)

---

## Navegação

### Estrutura de Tabs

```
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│  Início │ Trans │   +    │ Recorr│  Metas │ Orçam. │ Mais   │
└────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

- **FAB central**: Abre tela de adicionar transação
- **Pull-to-refresh**: Em todas as listas
- **Gestures**: Swipe para voltar

---

## Adicionar Nova Feature

1. **Criar tipos** em `src/types/index.ts`
2. **Criar serviço** em `src/services/{feature}.ts`
3. **Criar tela** em `app/(tabs)/{feature}.tsx`
4. **Adicionar tab** em `app/(tabs)/_layout.tsx`
5. **Exportar** de `src/services/index.ts`

---

## Configuração de Ambiente

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## Comandos Úteis

```bash
# Verificar tipos
npx tsc --noEmit

# Limpar cache Metro
npx expo start --clear

# Build produção
npx expo build:android
npx expo build:ios
```
