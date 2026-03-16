# Backend - FinanceApp API

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
pnpm dev              # Desenvolvimento (tsx watch)
pnpm build            # Build produção
pnpm start            # Executar build
pnpm test             # Rodar testes
pnpm lint             # Verificar código
pnpm format           # Formatar código
pnpm type-check       # Verificar tipos
pnpm drizzle:generate # Gerar migrations
pnpm drizzle:migrate  # Aplicar migrations
```

## Estrutura de Arquivos

```
api/
├── src/
│   ├── config/           # Fastify app e rotas
│   │   ├── app.ts        # Configuração principal do Fastify
│   │   └── routes.ts     # Registro de todas as rotas
│   ├── drizzle/         # ORM e Schema
│   │   ├── schema.ts     # Definição das tabelas
│   │   └── client.ts     # Cliente do banco
│   ├── errors/           # Tratamento de erros
│   │   ├── AppError.ts   # Classe de erro customizada
│   │   └── errorHandler.ts
│   ├── modules/          # Módulos (MVC)
│   │   ├── auth/         # Autenticação
│   │   ├── transactions/ # Transações
│   │   ├── categories/   # Categorias
│   │   ├── subcategories/# Subcategorias
│   │   ├── payment-methods/
│   │   ├── budgets/      # Orçamentos
│   │   ├── recurring/    # Transações recorrentes
│   │   └── summary/      # Resumos
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

## Módulos

### Auth
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário atual

### Transactions
- `GET /transactions` - Listar (com paginação e filtros)
- `GET /transactions/:id` - Detalhar
- `POST /transactions` - Criar
- `PUT /transactions/:id` - Atualizar
- `DELETE /transactions/:id` - Deletar

**Filtros disponíveis**: `month`, `type`, `categoryId`, `paymentMethodId`, `startDate`, `endDate`, `page`, `limit`

### Categories
- `GET /categories` - Listar
- `POST /categories` - Criar
- `PUT /categories/:id` - Atualizar
- `DELETE /categories/:id` - Deletar

### Subcategories
- `GET /subcategories` - Listar todas
- `GET /subcategories/:id` - Detalhar
- `POST /subcategories` - Criar
- `PUT /subcategories/:id` - Atualizar
- `DELETE /subcategories/:id` - Deletar

**Características**:
- Pertencem a uma categoria pai
- Suportam cor e ícone próprios
- FK para `categories`

### Payment Methods
- `GET /payment-methods` - Listar
- `POST /payment-methods` - Criar
- `PUT /payment-methods/:id` - Atualizar
- `DELETE /payment-methods/:id` - Deletar

### Budgets (Orçamentos)
- `GET /budgets` - Listar orçamentos do mês
- `POST /budgets` - Criar orçamento
- `PUT /budgets/:id` - Atualizar valor
- `DELETE /budgets/:id` - Deletar orçamento

**Características**:
- Orçamento por categoria OU por subcategoria
- Orçamentos de subcategoria são "medidores" (não somam no total)
- Se não existir orçamento da categoria e criar um de subcategoria, cria automaticamente um de R$ 0 para a categoria
-自动删除 categoria com R$ 0 se todas as subcategorias forem deletadas

### Recurring (Transações Recorrentes)
- `GET /recurring` - Listar recorrências
- `POST /recurring` - Criar recorrência
- `PUT /recurring/:id` - Atualizar
- `DELETE /recurring/:id` - Deletar
- `PUT /recurring/:id/toggle` - Ativar/Desativar
- `POST /recurring/:id/generate` - Gerar transação agora

**Frequências suportadas**:
- `daily` - Diária
- `weekly` - Semanal
- `monthly` - Mensal
- `yearly` - Anual
- `custom` - Personalizada (dias)

**Campos**:
- `dayOfMonth` - Dia do mês (1-31)
- `dayOfWeek` - Dia da semana (0-6)
- `startDate` - Data de início
- `endDate` - Data de término (opcional)
- `isActive` - Se está ativa

### Summary
- `GET /summary` - Resumo geral (receitas, despesas, saldo)
- `GET /summary/monthly` - Resumo por mês
- `GET /summary/by-category` - Resumo por categoria

## Padrão de Arquitetura

Cada módulo segue o padrão MVC:

```
module/
├── {module}.model.ts    # Lógica de acesso a dados (Drizzle)
├── {module}.schema.ts   # Validação de input (Zod)
├── {module}.controller.ts # Handlers das rotas
├── {module}.routes.ts   # Definição das rotas
└── {module}.types.ts   # Tipos TypeScript
```

## Adicionar Novo Módulo

1. Criar pasta em `src/modules/{nome}`
2. Criar `schema.ts` com validações Zod
3. Criar `model.ts` com operações de banco
4. Criar `controller.ts` com handlers
5. Criar `routes.ts` com definições de rota
6. Criar `types.ts` com tipos TypeScript
7. Registrar rotas em `src/config/routes.ts` ou `src/config/app.ts`

## Banco de Dados

O schema está em `src/drizzle/schema.ts`. Tabelas principais:

- `users` - Usuários
- `transactions` - Transações financeiras (com `categoryId`, `subcategoryId`)
- `categories` - Categorias
- `subcategories` - Subcategorias (FK para `categories`)
- `payment_methods` - Métodos de pagamento
- `budgets` - Orçamentos (com `categoryId`, `subcategoryId`)
- `recurring_transactions` - Transações recorrentes (com `categoryId`, `subcategoryId`)

## Erros

Erros são tratados via `AppError` que retorna JSON padronizado:
```json
{ "message": "Mensagem de erro", "statusCode": 500 }
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
│   │   └── client.ts     # Cliente do banco
│   ├── errors/           # Tratamento de erros
│   │   ├── AppError.ts   # Classe de erro customizada
│   │   └── errorHandler.ts
│   ├── modules/          # Módulos (MVC)
│   │   ├── auth/         # Autenticação
│   │   ├── transactions/ # Transações
│   │   ├── categories/   # Categorias
│   │   ├── payment-methods/
│   │   └── summary/      # Resumos
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

## Módulos

### Auth
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário atual

### Transactions
- `GET /transactions` - Listar (com paginação e filtros)
- `GET /transactions/:id` - Detalhar
- `POST /transactions` - Criar
- `PUT /transactions/:id` - Atualizar
- `DELETE /transactions/:id` - Deletar

**Filtros disponíveis**: `month`, `type`, `categoryId`, `paymentMethodId`, `startDate`, `endDate`, `page`, `limit`

### Categories
- `GET /categories` - Listar
- `POST /categories` - Criar
- `PUT /categories/:id` - Atualizar
- `DELETE /categories/:id` - Deletar

### Payment Methods
- `GET /payment-methods` - Listar
- `POST /payment-methods` - Criar
- `PUT /payment-methods/:id` - Atualizar
- `DELETE /payment-methods/:id` - Deletar

### Summary
- `GET /summary` - Resumo geral (receitas, despesas, saldo)
- `GET /summary/monthly` - Resumo por mês
- `GET /summary/by-category` - Resumo por categoria

## Padrão de Arquitetura

Cada módulo segue o padrão MVC:

```
module/
├── {module}.model.ts    # Lógica de acesso a dados (Drizzle)
├── {module}.schema.ts   # Validação de input (Zod)
├── {module}.controller.ts # Handlers das rotas
└── {module}.routes.ts   # Definição das rotas
```

## Adicionar Novo Módulo

1. Criar pasta em `src/modules/{nome}`
2. Criar `schema.ts` com validações Zod
3. Criar `model.ts` com operações de banco
4. Criar `controller.ts` com handlers
5. Criar `routes.ts` com definições de rota
6. Registrar rotas em `src/config/routes.ts`

## Banco de Dados

O schema está em `src/drizzle/schema.ts`. Tabelas principais:
- `users` - Usuários
- `transactions` - Transações financeiras
- `categories` - Categorias
- `payment_methods` - Métodos de pagamento

## Erros

Erros são tratados via `AppError` que retorna JSON padronizado:
```json
{ "message": "Mensagem de erro", "code": "ERROR_CODE" }
```
