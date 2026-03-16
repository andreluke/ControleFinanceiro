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
│   │   ├── routing/      # Rotas (ProtectedRoute, GlobalErrorBoundary)
│   │   ├── dashboard/     # Componentes do Dashboard
│   │   └── kpi/          # Cards de KPI
│   ├── hooks/            # Custom hooks (useTransactions, useCategories, etc.)
│   ├── pages/            # Páginas da aplicação
│   │   ├── components/   # Componentes específicos de páginas
│   │   └── *.tsx         # Páginas principais
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

## Páginas

### Dashboard (`/`)
- KPIs: Saldo Total, Receita no Mês, Despesa no Mês, Variação Mensal
- Gráficos: Evolução mensal, Por categoria
- Últimas transações
- **Filtro de período**: 7 dias, 30 dias, Este Mês, Mês Passado, Período Específico

### Transferências (`/transfers`)
- Lista de transações com paginação
- Filtros: busca, tipo, período
- Modal de criação/edição
- **Filtro de período**: Todo período, Este mês, Mês passado, 2 meses atrás, Período Específico

### Orçamentos (`/budgets`)
- Lista de orçamentos do mês
- KPIs: Total orçado, Total gasto, Remaining, Over budget
- Modal de criação/edição com árvore de categorias + subcategorias
- Seleção de mês/ano

### Transações Recorrentes (`/recurring`)
- Lista de recorrências
- KPIs: Receitas Recorrentes, Despesas Recorrentes, Ativas, Inativas
- Modal de criação/edição
- Toggle ativar/desativar
- Gerar transação manualmente

## Padrões de Desenvolvimento

### Services
Serviços encapsulam chamadas API. Cada recurso tem seu próprio arquivo:
- `services/api.ts` - Instância axios com interceptors
- `services/transactions.ts` - Operações de transações
- `services/categories.ts` - Operações de categorias
- `services/subcategories.ts` - Operações de subcategorias
- `services/budgets.ts` - Operações de orçamentos
- `services/recurring.ts` - Operações de recorrências
- `services/summary.ts` - Operações de resumo

### Hooks
Hooks encapsulam lógica de data fetching com React Query:
- `useTransactions` - Hook para transações
- `useCategories` - Hook para categorias
- `useSubcategories` - Hook para subcategorias
- `useBudgets` - Hook para orçamentos
- `useRecurringTransactions` - Hook para recorrências
- `useSummary` - Hook para resumos

### Types
Tipos TypeScript definidos em `src/types/`:
- `transaction.ts` - Transações (com subcategory)
- `category.ts` - Categorias
- `subcategory.ts` - Subcategorias
- `budget.ts` - Orçamentos
- `recurring.ts` - Transações recorrentes
- `auth.ts` - Autenticação
- `summary.ts` - Resumos

### Componentes UI
Componentes base em `src/components/ui/`:
- Button, Input, Label
- Select, Checkbox
- Dialog (Modal)
- DropdownMenu
- Toast
- Card, Skeleton
- Tabs

## Funcionalidades Especiais

### Subcategorias
- Criadas como tabela separada (não self-referencing)
- FK para categoria pai
- Suportam cor própria
- Integradas em: Transactions, Budgets, Recurring

### Orçamentos com Subcategorias
- Seleção em árvore: Categoria > Subcategoria
- Ao selecionar subcategoria, UI mostra apenas a subcategoria selecionada
- "Mudar categoria" para voltar à árvore
- Orçamentos de subcategoria são "medidores" (não somam no total)
- Auto-criação de orçamento R$ 0 da categoria ao criar de subcategoria
- Auto-delecção de orçamento R$ 0 da categoria ao deletar última subcategoria

### Filtro de Período Específico
- Dashboard: Período Específico com navegação por meses
- Transferências: Input de mês com setas de navegação
- URL atualizada com o período (ex: `?period=2026-01`)

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
