# Frontend - ControleFinanceiro Web

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
pnpm dev        # desenvolvimento
pnpm build      # Build produção
pnpm lint       # Verificar código
pnpm test       # Rodar testes
pnpm type-check # Verificar tipos (pnpm tsc --noEmit)
```

## Estrutura de Arquivos

```
web/
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes base (Button, Input, Dialog, etc.)
│   │   ├── charts/       # Gráficos (Recharts)
│   │   ├── layout/       # Layout (Sidebar, Header, PageWrapper)
│   │   ├── routing/      # Rotas (ProtectedRoute, GlobalErrorBoundary)
│   │   ├── dashboard/    # Componentes do Dashboard
│   │   └── kpi/          # Cards de KPI
│   ├── hooks/            # Custom hooks (useTransactions, useCategories, etc.)
│   ├── pages/            # Páginas da aplicação
│   │   ├── components/   # Componentes específicos de páginas
│   │   └── *.tsx        # Páginas principais
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

---

## Páginas

### Dashboard (`/`)

- **KPIs**: Saldo Total, Receita no Mês, Despesa no Mês, Variação Mensal
- **Gráficos**: Evolução mensal (barras), Por categoria (pizza/torta)
- **Últimas transações**
- **Filtro de período**: 7 dias, 30 dias, Este Mês, Mês Passado, Período Específico

### Transferências (`/transfers`)

- Lista de transações com paginação
- Filtros: busca, tipo, período
- Modal de criação/edição
- **Filtro de período**: Todo período, Este mês, Mês passado, Período Específico

### Orçamentos (`/budgets`)

- Lista de orçamentos do mês
- **KPIs**: Total orçado, Total gasto, Restante, Atenção (próximos + acima)
- Modal de criação/edição com árvore de categorias + subcategorias
- Seleção de mês/ano

**Funcionalidades Recentes**:
- **Orçamentos Recorrentes**: Toggle para marcar como recorrente
- **Valor Base + Subcategorias**: Exibição detalhada no card
- **Badge "Calculado"**: Indica orçamento que soma subcategorias
- **Badge "Recorrente"**: Indica orçamento recorrente
- **Botão Ativar/Desativar**: Para orçamentos recorrentes
- **Editar Base**: Ao editar categoria pai com subcategorias, edita apenas o valor base

### Transações Recorrentes (`/recurring`)

- Lista de recorrências
- **KPIs**: Receitas Recorrentes, Despesas Recorrentes, Ativas, Inativas
- Modal de criação/edição
- Toggle ativar/desativar
- Gerar transação manualmente

### Metas de Economia (`/goals`)

- Lista de metas
- **KPIs**: Total economizado, Total das metas, Restante
- Cards com progresso visual
- Modal com modos: visualização, depósito, saque
- Histórico de movimentações (depósitos verdes +, saques vermelhos -)

---

## Serviços (Services)

Serviços encapsulam chamadas API. Cada recurso tem seu próprio arquivo:

| Serviço | Descrição |
|---------|-----------|
| `services/api.ts` | Instância axios com interceptors |
| `services/auth.ts` | Autenticação |
| `services/transactions.ts` | Transações |
| `services/categories.ts` | Categorias |
| `services/subcategories.ts` | Subcategorias |
| `services/paymentMethods.ts` | Formas de pagamento |
| `services/budgets.ts` | Orçamentos |
| `services/recurring.ts` | Transações recorrentes |
| `services/goals.ts` | Metas de economia |
| `services/summary.ts` | Resumos |

---

## Hooks

Hooks encapsulam lógica de data fetching com React Query:

| Hook | Descrição |
|------|-----------|
| `useAuth` | Autenticação |
| `useTransactions` | Transações |
| `useCategories` | Categorias |
| `useSubcategories` | Subcategorias |
| `usePaymentMethods` | Formas de pagamento |
| `useBudgets` | Orçamentos (inclui `useCreateBudget`, `useUpdateBudget`, `useDeleteBudget`, `useToggleBudgetActive`) |
| `useRecurringTransactions` | Transações recorrentes |
| `useGoals` | Metas (inclui hooks para contribute/withdraw) |
| `useSummary` | Resumos |
| `useToast` | Toast notifications |

---

## Tipos (Types)

Tipos TypeScript definidos em `src/types/`:

| Arquivo | Descrição |
|---------|-----------|
| `auth.ts` | Autenticação (login, register, user) |
| `transaction.ts` | Transações (com subcategory) |
| `category.ts` | Categorias |
| `subcategory.ts` | Subcategorias |
| `paymentMethod.ts` | Formas de pagamento |
| `budget.ts` | Orçamentos (com recurring, baseAmount, subcategoriesTotal) |
| `recurring.ts` | Transações recorrentes |
| `goal.ts` | Metas e contribuições |
| `summary.ts` | Resumos |

---

## Componentes UI

Componentes base em `src/components/ui/`:

| Componente | Descrição |
|------------|-----------|
| Button | Botão com variants |
| Input | Campo de texto |
| Label | Rótulo |
| Select | Select com Radix |
| Checkbox | Checkbox com Radix |
| Switch | Toggle com Radix |
| Dialog | Modal com Radix |
| DropdownMenu | Menu dropdown |
| Toast | Notificações |
| Card | Card container |
| Skeleton | Loading placeholder |
| Tabs | Abas |

---

## Funcionalidades Especiais

### Subcategorias

- Criadas como tabela separada (não self-referencing)
- FK para categoria pai
- Suportam cor própria
- Integradas em: Transactions, Budgets, Recurring

### Orçamentos com Subcategorias

**Edição**:
- Seleção em árvore: Categoria > Subcategoria
- Ao selecionar subcategoria, UI mostra apenas a subcategoria
- "Mudar categoria" para voltar à árvore

**Valor Total**:
- Valor total = `baseAmount` + soma(subcategorias)
- Ao editar categoria pai com subcategorias, mostra campo "Valor base"
- O total é calculado automaticamente

**Cards**:
- Exibe: Base + Subcategorias = Total
- Badge "Calculado" para orçamentos soma de subcategorias
- Badge "Recorrente" para orçamentos recorrentes

### Orçamentos Recorrentes

**Criação**:
- Toggle "Orçamento Recorrente" no modal
- Ao ativar, cria o grupo recorrente automaticamente

**Recriação Automática**:
- Consultar orçamentos do mês ativa a recriação
- Mantém valor e configurações

**Controle**:
- Botão "Desativar" no card (não recria no próximo mês)
- Reativação apenas ao editar
- Editar valor atualiza todos os meses futuros

### Metas de Economia

**Transações**:
- Depositar: cria transação de despesa
- Sacar: cria transação de receita
- Forma de pagamento "Interno" (criada automaticamente)

**Histórico**:
- Lista de movimentações
- Depósitos: verde com "+"
- Saques: vermelho com "-"

**Interface**:
- Modal com modos: view, deposit, withdraw
- Botões Depositar/Sacar no card
- Barra de progresso

### Filtro de Período

- **Dashboard**: Período Específico com navegação por meses
- **Transferências**: Input de mês com setas de navegação
- **Orçamentos**: Select de mês/ano
- URL atualizada com o período (ex: `?period=2026-01`)

---

## Autenticação

- **Store**: `src/store/authStore.ts` (Zustand + persist)
- **Hook bootstrap**: `src/hooks/useAuthBootstrap.ts`
- **Rota protegida**: `src/components/routing/ProtectedRoute.tsx`
- **Remember Me**: Mantém login por 30 dias (padrão: 24h)

---

## API Client

O `services/api.ts` já configura:

- Base URL via `VITE_API_URL`
- Interceptor de token JWT
- Cache em memória para GET requests
- Tratamento de erros
- Log de erros no console
- Logout automático em 401

---

## Estilização

- **TailwindCSS** com `tailwind-merge` e `clsx`
- **Componentes** com `class-variance-authority` para variants
- Sistema de design em `docs/design-system.md`
- **Tema**: Light/Dark mode via CSS variables

---

## Adicionar Nova Feature

1. **Criar tipos** em `src/types/{feature}.ts`
2. **Criar serviço** em `src/services/{feature}.ts`
3. **Criar hook** em `src/hooks/use{Feature}.ts`
4. **Criar página** em `src/pages/{Feature}Page.tsx`
5. **Adicionar rota** em `src/routing/lazyPages.ts`
6. **Criar componentes** em `src/pages/components/`

---

## Hooks Úteis

```typescript
// Data fetching
useQuery()           // Buscar dados
useMutation()        // Criar/atualizar/deletar

// Formulários
useForm()            // React Hook Form
zodResolver()        // Validação Zod

// UI
useToast()           // Notificações
useDialog()          // Dialog state

// Router
useParams()          // Parâmetros da URL
useSearchParams()    // Query params
useNavigate()        // Navegação
```

---

## Comandos Úteis

```bash
# Verificar tipos
pnpm tsc --noEmit

# Limpar cache e rebuild
pnpm clear

# Verificar lint
pnpm lint

# Build produção
pnpm build
```
