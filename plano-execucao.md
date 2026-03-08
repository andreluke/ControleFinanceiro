# Plano de Execução — FinanceApp (Controle Financeiro)

> Documento que consolida os passos de execução para implementar o projeto completo, baseado em `design-system.md`, `backend-project-plan.md`, `frontend-project-plan.md` e nas imagens de referência em `project-images/`.

**Referências visuais:**
- `project-images/dashboard.png` — Dashboard com KPIs, gráficos e tabela
- `project-images/lista-transferências.png` — Tela de transferências com filtros e paginação
- `project-images/login.png` — Tela de login
- `project-images/register.png` — Tela de cadastro

---

## Ordem de Execução Recomendada

O backend deve ser implementado primeiro (ou em paralelo) para que o frontend possa consumir a API. O design system é aplicado durante o desenvolvimento do frontend.

---

# PARTE 1 — BACKEND (API)

## Etapa 1.1 — Setup Base do Backend (1 dia)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Inicializar projeto | `pnpm init` na pasta `backend/` ou raiz |
| 2 | Instalar dependências | TypeScript, tsx, tsup, Fastify, Drizzle, Zod, plugins |
| 3 | Configurar TypeScript | `tsconfig.json` com strict mode |
| 4 | Configurar Fastify | Instância base em `src/config/app.ts` |
| 5 | Registrar plugins | `@fastify/cors`, `@fastify/jwt`, `@fastify/swagger` |
| 6 | Configurar Docker Compose | PostgreSQL 16, variáveis de ambiente |
| 7 | Configurar Drizzle | `drizzle.config.ts`, conexão em `src/drizzle/client.ts` |
| 8 | Criar schema do banco | Tabelas: `users`, `categories`, `payment_methods`, `transactions` |
| 9 | Validação de env | `src/settings/env.ts` com Zod (PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN) |
| 10 | Error handler global | `src/errors/errorHandler.ts` e `AppError.ts` |
| 11 | Entry point | `src/index.ts` — buildApp() e listen |
| 12 | Gerar e rodar migrations | `pnpm drizzle:generate` e `pnpm drizzle:migrate` |

---

## Etapa 1.2 — Módulo Auth (1–2 dias)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Schema `users` | Já definido no Drizzle — garantir migração |
| 2 | Instalar bcrypt | Hash de senha no registro |
| 3 | `POST /auth/register` | Validação Zod, hash da senha, inserir usuário |
| 4 | `POST /auth/login` | Validar credenciais, gerar JWT com `@fastify/jwt` |
| 5 | Middleware de autenticação | `preHandler` que verifica JWT e popula `req.user` |
| 6 | `GET /auth/me` | Retornar dados do usuário autenticado |

---

## Etapa 1.3 — Categorias e Métodos de Pagamento (1 dia)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Módulo categories | controller, routes, model, schema (Zod) |
| 2 | CRUD categorias | GET, POST, PUT, DELETE (soft-delete) |
| 3 | `PATCH /categories/:id/restore` | Restaurar categoria deletada |
| 4 | Módulo payment-methods | controller, routes, model, schema |
| 5 | CRUD payment-methods | GET, POST, PUT, DELETE (soft-delete) |
| 6 | `PATCH /payment-methods/:id/restore` | Restaurar método deletado |

---

## Etapa 1.4 — Transações (2 dias)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Módulo transactions | controller, routes, model, schema |
| 2 | `GET /transactions` | Filtros: month, type, categoryId, paymentMethodId, page, limit |
| 3 | `GET /transactions/:id` | Buscar por ID |
| 4 | `POST /transactions` | Criar com validação Zod |
| 5 | `PUT /transactions/:id` | Atualizar |
| 6 | `DELETE /transactions/:id` | Remover (hard delete) |
| 7 | Paginação | Retornar `{ data: Transaction[], total: number }` |

---

## Etapa 1.5 — Summary (1 dia)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Módulo summary | controller, routes, model |
| 2 | `GET /summary?month=YYYY-MM` | totalBalance, monthlyIncome, monthlyExpense, monthlyChange |
| 3 | `GET /summary/monthly` | Totais mês a mês (últimos 6 meses) — para gráfico de linha |
| 4 | `GET /summary/by-category` | Gastos agrupados por categoria com % — para donut |

---

## Etapa 1.6 — Qualidade do Backend (1 dia)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Documentação Swagger | Garantir que todos os endpoints estejam documentados |
| 2 | Biome | Configurar lint e format |
| 3 | Testes de integração | Testes Unitários | fastify inject para rotas principais |
| 4 | README | Quickstart com Docker e variáveis de ambiente |

---

# PARTE 2 — FRONTEND

## Etapa 2.1 — Setup Base do Frontend (1 dia)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Criar projeto Vite | `pnpm create vite frontend --template react-ts` |
| 2 | Instalar dependências | React Router, TanStack Query, Axios, Recharts, Zustand, React Hook Form, Zod, date-fns, Lucide React |
| 3 | Configurar Tailwind | Tokens do design system (cores, fontes, sombras, border-radius) |
| 4 | Configurar alias `@` | `path.resolve(__dirname, 'src')` no vite.config |
| 5 | Criar estrutura de pastas | components/, hooks/, pages/, services/, store/, types/, utils/ |
| 6 | Instância Axios | `src/services/api.ts` com baseURL e interceptors JWT |
| 7 | QueryClient | Configurar TanStack Query no App |
| 8 | Auth store (Zustand) | token, user, login(), logout() com persist |

---

## Etapa 2.2 — Design System e Componentes Base

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Fonte Inter | Importar no index.html ou CSS |
| 2 | Componentes UI | Badge, Button, Card, Input, Pagination, PeriodTabs, Dropdown, Skeleton |
| 3 | Sidebar | Layout fixo 220–240px, nav ativo/inativo, perfil na base |
| 4 | Header | (se necessário) |
| 5 | PageWrapper | Layout com Sidebar + área de conteúdo |

---

## Etapa 2.3 — Auth no Frontend (1 dia)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Página Login | Referência: `project-images/login.png` — formulário com React Hook Form + Zod |
| 2 | Integração `POST /auth/login` | Chamar API, salvar token e user no Zustand |
| 3 | Auth guard | PrivateRoute — redirecionar para /login se não autenticado |
| 4 | Página Register | Referência: `project-images/register.png` — `POST /auth/register` |
| 5 | Redirect após login | Navegar para /dashboard |

---

## Etapa 2.4 — Dashboard (3 dias)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Página Dashboard | Referência: `project-images/dashboard.png` |
| 2 | Hooks de dados | useSummary, useMonthlySummary, useCategorySummary, useTransactions |
| 3 | 4 KpiCards | Conectar ao `GET /summary` — Saldo, Receita, Despesa, Variação |
| 4 | PeriodTabs | 7D / 30D / Este Mês / Personalizado — atualizar filtro de mês |
| 5 | BalanceLineChart | AreaChart com `GET /summary/monthly` — linha #3B82F6, gradiente |
| 6 | CategoryDonutChart | PieChart com `GET /summary/by-category` — cores por categoria |
| 7 | Tabela de últimas transações | `GET /transactions?limit=5` — TransactionTable com TransactionRow |
| 8 | Grid layout | 4 cols KPI + 70/30 gráficos conforme design system |

---

## Etapa 2.5 — Transferências (2 dias)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Página Transfers | Referência: `project-images/lista-transferências.png` |
| 2 | TransactionFilters | Busca, dropdown tipo, dropdown período, botão Filtros |
| 3 | Tabela com paginação | `GET /transactions` com page/limit |
| 4 | Modal Nova Transferência | React Hook Form + Zod, `POST /transactions` |
| 5 | Invalidação de cache | Ao criar/editar/deletar — invalidateQueries |
| 6 | Botão CTA | "Nova Transferência" — estilização conforme design system |

---

## Etapa 2.6 — Polimento do Frontend (1–2 dias)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Skeletons | Carregamento em cards e tabelas |
| 2 | Estados de erro | Retry, mensagens amigáveis |
| 3 | Responsividade | Breakpoints md/lg |
| 4 | Acessibilidade | aria-labels, focus ring |

---

## Etapa 2.7 — Deploy (1 dia)

| # | Passo | Detalhes |
|---|-------|----------|
| 1 | Build produção | `pnpm build` (tsc && vite build) |
| 2 | Deploy frontend | Vercel ou Netlify |
| 3 | Deploy backend | Railway, Render, ou VPS |
| 4 | Variáveis de ambiente | `VITE_API_URL` apontando para API em produção |

---

# RESUMO DE CRONOGRAMA

| Parte | Etapas | Duração estimada |
|-------|--------|------------------|
| Backend | 1.1 a 1.6 | 7–8 dias |
| Frontend | 2.1 a 2.7 | 10–12 dias |
| **Total** | | **~17–20 dias** |

---

# CHECKLIST RÁPIDO

## Backend
- [ ] Setup (pnpm, TypeScript, Fastify, Drizzle, Docker)
- [ ] Auth (register, login, JWT, /me)
- [ ] Categorias (CRUD + soft-delete)
- [ ] Payment Methods (CRUD + soft-delete)
- [ ] Transações (CRUD + filtros + paginação)
- [ ] Summary (3 endpoints)
- [ ] Swagger, Biome, testes, README

## Frontend
- [ ] Setup (Vite, React, Tailwind, TanStack Query, Zustand)
- [ ] Design system (tokens no Tailwind)
- [ ] Componentes base (Sidebar, UI)
- [ ] Login + Register
- [ ] Dashboard (KPIs, gráficos, tabela)
- [ ] Transferências (filtros, tabela, modal)
- [ ] Polimento (skeletons, erros, a11y)
- [ ] Deploy

---

# REFERÊNCIAS DE ARQUIVOS

| Documento | Conteúdo |
|-----------|----------|
| `design-system.md` | Cores, tipografia, espaçamento, componentes visuais |
| `backend-project-plan.md` | Stack, estrutura, schema DB, endpoints, exemplos de código |
| `frontend-project-plan.md` | Stack, estrutura, serviços, hooks, exemplos de código |
| `project-images/dashboard.png` | Mockup do dashboard |
| `project-images/lista-transferências.png` | Mockup da tela de transferências |
| `project-images/login.png` | Mockup do login |
| `project-images/register.png` | Mockup do cadastro |
