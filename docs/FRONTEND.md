# Frontend - FinanceApp Web

## Stack

- **Framework**: React 19
- **Linguagem**: TypeScript
- **Build**: Vite
- **Router**: React Router DOM v7
- **Data Fetching**: TanStack React Query
- **State**: Zustand
- **HTTP**: Axios
- **Formulários**: React Hook Form + Zod
- **UI**: Radix UI + TailwindCSS
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## Scripts

```bash
pnpm dev        # Desenvolvimento
pnpm build      # Build produção
pnpm lint       # Verificar código
pnpm test       # Rodar testes
```

## Estrutura de Arquivos

```
web/
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes base (Button, Input, Dialog, etc.)
│   │   ├── charts/       # Gráficos
│   │   ├── layout/       # Layout (Sidebar, Header, PageWrapper)
│   │   └── routing/      # Rotas (ProtectedRoute, GlobalErrorBoundary)
│   ├── hooks/            # Custom hooks (useTransactions, useCategories, etc.)
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # API calls (api.ts, transactions.ts, etc.)
│   ├── store/            # Zustand stores (authStore.ts)
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Helpers (date, currency, cn)
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Entry point
│   └── index.css         # Estilos globais
├── package.json
└── vite.config.ts
```

## Padrões de Desenvolvimento

### Services
Serviços封装 chamadas API. Cada recurso tem seu próprio arquivo:
- `services/api.ts` - Instância axios com interceptors
- `services/transactions.ts` - Operações de transações
- `services/categories.ts` - Operações de categorias
- `services/summary.ts` - Operações de resumo

### Hooks
Hooks encapsulam lógica de data fetching com React Query:
- `useTransactions` - Hook para transações
- `useCategories` - Hook para categorias
- `useSummary` - Hook para resumos

### Types
Tipos TypeScript definidos em `src/types/`:
- `transaction.ts`
- `category.ts`
- `paymentMethod.ts`
- `auth.ts`
- `summary.ts`

### Componentes UI
Componentes base em `src/components/ui/`:
- Button, Input, Label
- Select, Checkbox
- Dialog (Modal)
- DropdownMenu
- Toast
- Card, Skeleton

## Adicionar Nova Feature

1. **Criar tipos** em `src/types/{feature}.ts`
2. **Criar serviço** em `src/services/{feature}.ts`
3. **Criar hook** em `src/hooks/use{Feature}.ts`
4. **Criar página** em `src/pages/{Feature}Page.tsx`
5. **Adicionar rota** em `src/routing/lazyPages.ts`
6. **Criar componentes** em `src/components/`

## Autenticação

- Store: `src/store/authStore.ts` (Zustand + persist)
- Hook bootstrap: `src/hooks/useAuthBootstrap.ts`
- Rota protegida: `src/components/routing/ProtectedRoute.tsx`

## API Client

O `services/api.ts` já configura:
- Base URL via `VITE_API_URL`
- Interceptor de token JWT
- Cache em memória para GET requests
- Tratamento de erros
- Log de erros no console
- Logout automático em 401

## Estilização

- TailwindCSS com `tailwind-merge` e `clsx`
- Componentes com `class-variance-authority` para variants
- Sistema de design em `docs/design-system.md`
