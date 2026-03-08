# Plano de Projeto — FinanceApp Frontend

> SPA React que consome a **FinanceApp API** (Fastify + Drizzle + PostgreSQL).  
> Stack: **React · Vite · TypeScript · Tailwind · TanStack Query · Recharts**

---

## 1. Stack Tecnológica

| Tecnologia | Versão sugerida | Papel |
|------------|----------------|-------|
| **React** | 18+ | UI declarativa com Concurrent Features |
| **Vite** | 5+ | Build tool + HMR instantâneo |
| **TypeScript** | 5+ | Contratos de tipo com a API |
| **Tailwind CSS** | 3+ | Utilitários CSS com tokens do design system |
| **TanStack Query** | 5+ | Cache, loading/error states, refetch automático |
| **Recharts** | 2+ | Gráfico de linha (`AreaChart`) e donut (`PieChart`) |
| **React Router DOM** | 6+ | Roteamento SPA |
| **Axios** | 1+ | HTTP client com interceptors de auth (JWT) |
| **Zustand** | 4+ | Estado global leve (auth token, filtros) |
| **React Hook Form + Zod** | latest | Formulários com validação tipada |
| **date-fns** | 3+ | Formatação e manipulação de datas |
| **Lucide React** | latest | Ícones SVG tree-shakeable |

---

## 2. Estrutura de Pastas

```
src/
├── assets/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageWrapper.tsx
│   ├── ui/                   # Componentes atômicos
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Pagination.tsx
│   │   ├── PeriodTabs.tsx
│   │   ├── Dropdown.tsx
│   │   └── Skeleton.tsx
│   ├── charts/
│   │   ├── BalanceLineChart.tsx    # Evolução do Saldo (AreaChart)
│   │   └── CategoryDonutChart.tsx  # Gastos por Categoria (PieChart)
│   ├── kpi/
│   │   └── KpiCard.tsx
│   └── transactions/
│       ├── TransactionTable.tsx
│       ├── TransactionRow.tsx
│       ├── TransactionFilters.tsx
│       ├── TransactionIcon.tsx
│       └── NewTransactionModal.tsx
├── hooks/
│   ├── useTransactions.ts     # GET /transactions
│   ├── useSummary.ts          # GET /summary
│   ├── useMonthlySummary.ts   # GET /summary/monthly
│   ├── useCategorySummary.ts  # GET /summary/by-category
│   ├── useCategories.ts       # GET /categories
│   └── usePaymentMethods.ts   # GET /payment-methods
├── pages/
│   ├── Dashboard.tsx
│   ├── Transfers.tsx
│   └── Login.tsx
├── services/
│   ├── api.ts                 # Instância Axios + interceptors
│   ├── transactions.ts
│   ├── summary.ts
│   ├── categories.ts
│   ├── paymentMethods.ts
│   └── auth.ts
├── store/
│   ├── authStore.ts           # token, user, login(), logout()
│   └── filterStore.ts         # período ativo, filtros de tabela
├── types/
│   ├── transaction.ts
│   ├── summary.ts
│   ├── category.ts
│   └── auth.ts
├── utils/
│   ├── currency.ts            # formatBRL()
│   ├── date.ts                # formatDate(), toMonthParam()
│   └── cn.ts                  # helper clsx + tailwind-merge
├── App.tsx
└── main.tsx
```

---

## 3. Configuração Base

### Tailwind — Tokens do Design System

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          global:  '#0F1117',
          sidebar: '#161B27',
          card:    '#1A2035',
          alt:     '#1E2A3B',
        },
        primary: {
          DEFAULT: '#2563EB',
          light:   '#3B82F6',
        },
        success: '#22C55E',
        danger:  '#EF4444',
        warning: '#F59E0B',
        text: {
          primary:   '#FFFFFF',
          secondary: '#8892A4',
          badge:     '#CBD5E1',
        },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      borderRadius: { card: '12px' },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.3)',
        cta:  '0 4px 14px rgba(37,99,235,0.4)',
      },
    },
  },
}
```

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
```

---

## 4. Camada de Serviços

### Instância Axios com JWT

```ts
// src/services/api.ts
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(err)
  }
)
```

### Serviço de transações

```ts
// src/services/transactions.ts
import { api } from './api'
import type { Transaction, ListTransactionsParams, CreateTransactionInput } from '@/types/transaction'

export const TransactionService = {
  list: (params: ListTransactionsParams) =>
    api.get<{ data: Transaction[]; total: number }>('/transactions', { params }).then(r => r.data),

  create: (body: CreateTransactionInput) =>
    api.post<Transaction>('/transactions', body).then(r => r.data),

  update: (id: string, body: Partial<CreateTransactionInput>) =>
    api.put<Transaction>(`/transactions/${id}`, body).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/transactions/${id}`),
}
```

---

## 5. Tipagem Alinhada com a API

```ts
// src/types/transaction.ts
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id:              string
  description:     string
  subDescription?: string
  amount:          number
  type:            TransactionType
  date:            string           // ISO 8601
  categoryId?:     string
  category?:       { id: string; name: string; color: string; icon?: string }
  paymentMethodId?: string
  paymentMethod?:  { id: string; name: string }
  createdAt:       string
}

export interface ListTransactionsParams {
  month?:           string           // "2024-06"
  type?:            TransactionType
  categoryId?:      string
  paymentMethodId?: string
  page?:            number
  limit?:           number
}

export interface CreateTransactionInput {
  description:      string
  subDescription?:  string
  amount:           number
  type:             TransactionType
  date:             string
  categoryId?:      string
  paymentMethodId?: string
}
```

```ts
// src/types/summary.ts
export interface Summary {
  totalBalance:   number
  monthlyIncome:  number
  monthlyExpense: number
  monthlyChange:  number
}

export interface MonthlySummary {
  month:   string    // "2024-01"
  income:  number
  expense: number
  balance: number
}

export interface CategorySummary {
  categoryId:   string
  categoryName: string
  color:        string
  total:        number
  percentage:   number
}
```

---

## 6. Hooks com TanStack Query

```ts
// src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TransactionService } from '@/services/transactions'
import type { ListTransactionsParams, CreateTransactionInput } from '@/types/transaction'

export function useTransactions(params: ListTransactionsParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn:  () => TransactionService.list(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,   // mantém dados ao trocar página
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTransactionInput) => TransactionService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
```

```ts
// src/hooks/useSummary.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Summary } from '@/types/summary'

export function useSummary(month: string) {
  return useQuery({
    queryKey: ['summary', month],
    queryFn:  () => api.get<Summary>('/summary', { params: { month } }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}
```

---

## 7. Componentes-Chave

### KpiCard

```tsx
// src/components/kpi/KpiCard.tsx
interface KpiCardProps {
  label:       string
  value:       string
  change:      string
  changeType:  'positive' | 'negative'
  icon:        React.ReactNode
}

export function KpiCard({ label, value, change, changeType, icon }: KpiCardProps) {
  return (
    <div className="bg-bg-card rounded-card p-5 shadow-card">
      <div className="flex justify-between items-start mb-4">
        <div className="text-primary-light">{icon}</div>
        <span className={`text-xs font-semibold ${changeType === 'positive' ? 'text-success' : 'text-danger'}`}>
          {change}
        </span>
      </div>
      <p className="text-text-secondary text-xs mb-1">{label}</p>
      <p className="text-text-primary text-xl font-bold">{value}</p>
    </div>
  )
}
```

### CategoryDonutChart

```tsx
// src/components/charts/CategoryDonutChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { CategorySummary } from '@/types/summary'

export function CategoryDonutChart({ data }: { data: CategorySummary[] }) {
  return (
    <div className="bg-bg-card rounded-card p-5 shadow-card">
      <h3 className="text-text-primary font-semibold mb-4">Gastos por Categoria</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="categoryName"
               innerRadius={60} outerRadius={80} paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-4 space-y-2">
        {data.map(c => (
          <li key={c.categoryId} className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-text-secondary text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              {c.categoryName}
            </span>
            <span className="text-text-primary text-sm font-medium">{c.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 8. Roteamento e Auth Guard

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Dashboard from '@/pages/Dashboard'
import Transfers from '@/pages/Transfers'
import Login from '@/pages/Login'

const qc = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute><PageWrapper /></PrivateRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/transfers"  element={<Transfers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

---

## 9. Zustand — Auth Store

```ts
// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User { id: string; name: string; email: string }

interface AuthStore {
  token:   string | null
  user:    User | null
  login:   (token: string, user: User) => void
  logout:  () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token:  null,
      user:   null,
      login:  (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'finance-auth' }
  )
)
```

---

## 10. Fases de Desenvolvimento

### Fase 1 — Setup (1 dia)
- [ ] Vite + React + TypeScript + Tailwind configurados
- [ ] Tokens do design system no Tailwind
- [ ] Axios + TanStack Query configurados
- [ ] Zustand auth store
- [ ] Estrutura de pastas criada

### Fase 2 — Auth (1 dia)
- [ ] Página de Login (React Hook Form + Zod)
- [ ] Integração com `POST /auth/login`
- [ ] Auth guard + redirect
- [ ] Persistência do token (Zustand persist)

### Fase 3 — Dashboard (3 dias)
- [ ] 4 KpiCards conectados ao `GET /summary`
- [ ] `AreaChart` com dados de `GET /summary/monthly`
- [ ] `PieChart` com dados de `GET /summary/by-category`
- [ ] Tabela de últimas transações com `GET /transactions?limit=5`
- [ ] PeriodTabs (7D / 30D / Este Mês / Personalizado)

### Fase 4 — Transferências (2 dias)
- [ ] Tabela de transações com filtros e paginação
- [ ] Filtros de busca, tipo e período
- [ ] Modal "Nova Transferência" (React Hook Form + Zod + `POST /transactions`)
- [ ] Invalidação de cache ao criar/editar/deletar

### Fase 5 — Polimento (1–2 dias)
- [ ] Skeletons de carregamento em cards e tabelas
- [ ] Estados de erro com retry
- [ ] Responsividade (md / lg breakpoints)
- [ ] Acessibilidade básica (aria-labels, focus ring)

### Fase 6 — Deploy (1 dia)
- [ ] Build de produção (`vite build`)
- [ ] Deploy Vercel / Netlify
- [ ] `VITE_API_URL` configurado para a API em produção

---

## 11. Dependências

```bash
# Produção
pnpm add react react-dom react-router-dom
pnpm add @tanstack/react-query axios
pnpm add recharts
pnpm add zustand
pnpm add react-hook-form zod @hookform/resolvers
pnpm add date-fns lucide-react

# Dev
pnpm add -D vite @vitejs/plugin-react typescript
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D @types/react @types/react-dom
pnpm add -D @biomejs/biome
```

---

## 12. Variáveis de Ambiente

```env
# .env.local
VITE_API_URL=http://localhost:3000
```

---

## 13. Scripts

```json
{
  "scripts": {
    "dev":        "vite",
    "build":      "tsc && vite build",
    "preview":    "vite preview",
    "lint":       "biome check src",
    "type-check": "tsc --noEmit"
  }
}
```
