# Backend - ControleFinanceiro API

## Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL
- **Validação**: Zod
- **Autenticação**: JWT (@fastify/jwt)
- **Testes**: Vitest
- **Linting**: Biome

## Scripts

```bash
pnpm dev              # desenvolvimento (tsx watch)
pnpm build            # Build padrão
pnpm build:production # Build produção + migrations
pnpm start            # Executar build
pnpm test             # Rodar testes
pnpm lint             # Verificar código
pnpm format           # Formatar código
pnpm type-check       # Verificar tipos (pnpm tsc --noEmit)
pnpm drizzle:generate # Gerar migrations
```

## Estrutura de Arquivos

```
api/
├── src/
│   ├── config/           # Fastify app e rotas
│   │   ├── app.ts        # Configuração principal do Fastify
│   │   └── routes.ts     # Registro de todas as rotas
│   ├── drizzle/          # ORM e Schema
│   │   ├── schema.ts     # Definição das tabelas
│   │   ├── client.ts     # Cliente do banco
│   │   └── migrations/    # Migrations SQL
│   ├── errors/           # Tratamento de erros
│   │   ├── AppError.ts   # Classe de erro customizada
│   │   └── errorHandler.ts
│   ├── modules/          # Módulos (MVC)
│   │   ├── auth/         # Autenticação
│   │   ├── transactions/  # Transações
│   │   ├── categories/   # Categorias
│   │   ├── subcategories/# Subcategorias
│   │   ├── payment-methods/ # Formas de pagamento
│   │   ├── budgets/      # Orçamentos
│   │   ├── recurring/     # Transações recorrentes
│   │   ├── goals/        # Metas de economia
│   │   └── summary/      # Resumos e gráficos
│   ├── settings/
│   │   └── env.ts        # Variáveis de ambiente (Zod)
│   ├── utils/            # Helpers
│   │   ├── catchError.ts
│   │   ├── currency.ts
│   │   └── date.ts
│   └── index.ts          # Entry point
├── tests/
└── package.json
```

## Padrão de Arquitetura

Cada módulo segue o padrão MVC:

```
module/
├── {module}.model.ts       # Lógica de acesso a dados (Drizzle)
├── {module}.schema.ts      # Validação de input (Zod)
├── {module}.controller.ts  # Handlers das rotas
├── {module}.routes.ts     # Definição das rotas
└── {module}.types.ts      # Tipos TypeScript
```

---

## Módulos

### Auth

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registro de novo usuário |
| POST | `/auth/login` | Login com `rememberMe` opcional |
| GET | `/auth/me` | Dados do usuário atual |

**Campos**:
- `name` - Nome do usuário
- `email` - Email (único)
- `password` - Senha (hash bcrypt)
- `rememberMe` - Manter login por 30 dias (padrão: 24h)

### Transactions (Transações)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/transactions` | Listar com paginação e filtros |
| GET | `/transactions/:id` | Detalhar transação |
| POST | `/transactions` | Criar transação |
| PUT | `/transactions/:id` | Atualizar transação |
| DELETE | `/transactions/:id` | Deletar transação |

**Filtros disponíveis**: `month`, `type`, `categoryId`, `subcategoryId`, `paymentMethodId`, `startDate`, `endDate`, `page`, `limit`, `search`

**Campos**:
- `description` - Descrição
- `subDescription` - Descrição adicional (opcional)
- `amount` - Valor (numeric 12,2)
- `type` - Tipo: `income` | `expense`
- `date` - Data da transação
- `categoryId` - FK para categoria
- `subcategoryId` - FK para subcategoria (opcional)
- `paymentMethodId` - FK para forma de pagamento

### Categories (Categorias)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/categories` | Listar todas |
| POST | `/categories` | Criar categoria |
| PUT | `/categories/:id` | Atualizar categoria |
| DELETE | `/categories/:id` | Deletar (soft delete) |
| POST | `/categories/:id/restore` | Restaurar |

**Campos**:
- `name` - Nome da categoria
- `color` - Cor em hex
- `icon` - Ícone (opcional)
- `deletedAt` - Soft delete

### Subcategories (Subcategorias)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/subcategories` | Listar todas |
| GET | `/subcategories/:id` | Detalhar subcategoria |
| POST | `/subcategories` | Criar subcategoria |
| PUT | `/subcategories/:id` | Atualizar subcategoria |
| DELETE | `/subcategories/:id` | Deletar (soft delete) |

**Características**:
- Pertencem a uma categoria pai (`categoryId`)
- Suportam cor e ícone próprios
- FK para `categories`

### Payment Methods (Formas de Pagamento)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/payment-methods` | Listar todas |
| POST | `/payment-methods` | Criar forma de pagamento |
| PUT | `/payment-methods/:id` | Atualizar |
| DELETE | `/payment-methods/:id` | Deletar (soft delete) |
| POST | `/payment-methods/:id/restore` | Restaurar |

**Método especial**:
- `findByName(name, userId)` - Busca por nome (usado para criar "Interno" automaticamente para metas)

### Budgets (Orçamentos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/budgets` | Listar orçamentos do mês |
| POST | `/budgets` | Criar orçamento |
| PUT | `/budgets/:id` | Atualizar orçamento |
| PATCH | `/budgets/:id/toggle` | Ativar/desativar recorrência |
| DELETE | `/budgets/:id` | Deletar orçamento |

**Campos**:
- `categoryId` - FK para categoria
- `subcategoryId` - FK para subcategoria (opcional)
- `amount` - Valor do orçamento
- `baseAmount` - Valor base da categoria (sem subcategorias)
- `month` - Mês
- `year` - Ano
- `isRecurring` - Se é recorrente
- `isActive` - Se está ativo para recriação
- `recurringGroupId` - ID do grupo de recorrência

**Características - Orçamentos com Subcategorias**:
- Valor total = `baseAmount` + soma(subcategorias)
- Ao criar/editar/deletar subcategoria, o total do pai é recalculado automaticamente
- Campo `subcategoriesTotal` retornado na listagem

**Características - Orçamentos Recorrentes**:
- Criados automaticamente no início de cada mês
- `ensureRecurringBudgetsExist()` executado ao consultar
- Botão toggle ativa/desativa para não recriar no próximo mês
- Editar valor atualiza todos os meses futuros

### Recurring (Transações Recorrentes)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/recurring` | Listar recorrências |
| POST | `/recurring` | Criar recorrência |
| PUT | `/recurring/:id` | Atualizar |
| DELETE | `/recurring/:id` | Deletar |
| PATCH | `/recurring/:id/toggle` | Ativar/desativar |
| POST | `/recurring/:id/generate` | Gerar transação agora |

**Frequências suportadas**:
- `daily` - Diária
- `weekly` - Semanal
- `monthly` - Mensal
- `yearly` - Anual
- `custom` - Personalizada (customIntervalDays)

**Campos**:
- `description` - Descrição
- `amount` - Valor
- `type` - Tipo: `income` | `expense`
- `frequency` - Frequência
- `dayOfMonth` - Dia do mês (1-31)
- `dayOfWeek` - Dia da semana (0-6)
- `startDate` - Data de início
- `endDate` - Data de término (opcional)
- `isActive` - Se está ativa
- `lastGeneratedAt` - Última geração

### Goals (Metas de Economia)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/goals` | Listar metas |
| POST | `/goals` | Criar meta |
| PUT | `/goals/:id` | Atualizar meta |
| DELETE | `/goals/:id` | Deletar meta |
| POST | `/goals/:id/contribute` | Depositar valor |
| POST | `/goals/:id/withdraw` | Sacar valor |
| GET | `/goals/:id/history` | Histórico de movimentações |

**Campos**:
- `name` - Nome da meta
- `description` - Descrição (opcional)
- `targetAmount` - Valor alvo
- `currentAmount` - Valor atual (default 0)
- `deadline` - Prazo (opcional)
- `icon` - Ícone (opcional)
- `color` - Cor
- `isActive` - Se está ativa
- `categoryId` - FK para categoria "Meta"

**Tabela goal_contributions**:
- `type` - Tipo: `deposit` | `withdrawal`
- `transactionId` - FK para transação criada
- `amount` - Valor da movimentação

**Lógica**:
- Depositar: cria transação de **despesa** (forma de pagamento "Interno")
- Sacar: cria transação de **receita** (forma de pagamento "Interno")
- Transações da categoria "Meta" são filtradas dos resumos/gráficos

### Summary (Resumos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/summary` | Resumo geral |
| GET | `/summary/monthly` | Resumo por mês |
| GET | `/summary/by-category` | Resumo por categoria |

**Características**:
- Exclui transações da categoria "Meta" de todos os resumos
- Método privado `getMetaCategoryId()` usado para filtragem

---

## Banco de Dados

### Schema Principal

O schema está em `src/drizzle/schema.ts`. Tabelas:

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários |
| `transactions` | Transações financeiras |
| `categories` | Categorias |
| `subcategories` | Subcategorias (FK para categories) |
| `payment_methods` | Formas de pagamento |
| `budgets` | Orçamentos |
| `recurring_transactions` | Transações recorrentes |
| `goals` | Metas de economia |
| `goal_contributions` | Contribuições/saques das metas |

### Migrations

```bash
pnpm drizzle-kit push    # Aplicar (desenvolvimento)
pnpm drizzle-kit generate # Gerar migration
```

---

## Erros

Erros são tratados via `AppError` que retorna JSON padronizado:

```json
{
  "message": "Mensagem de erro",
  "statusCode": 500
}
```

---

## Adicionar Novo Módulo

1. Criar pasta em `src/modules/{nome}`
2. Criar `schema.ts` com validações Zod
3. Criar `model.ts` com operações de banco
4. Criar `controller.ts` com handlers
5. Criar `routes.ts` com definições de rota
6. Criar `types.ts` com tipos TypeScript
7. Registrar rotas em `src/config/routes.ts`
