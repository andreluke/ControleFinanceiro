# Plano de Projeto — FinanceApp API (Backend)

> Nova API REST para controle financeiro pessoal, inspirada na arquitetura da FinestControl-API.  
> Stack: **TypeScript · Fastify · Drizzle ORM · PostgreSQL · Zod · Docker**

---

## 1. Stack Tecnológica

| Tecnologia | Versão sugerida | Papel |
|------------|----------------|-------|
| **Node.js** | 20 LTS | Runtime |
| **TypeScript** | 5+ | Tipagem estática em toda a aplicação |
| **Fastify** | 4+ | HTTP server — rápido, schema-first |
| **Drizzle ORM** | 0.30+ | ORM type-safe, migrations, query builder |
| **PostgreSQL** | 16+ | Banco de dados relacional |
| **Zod** | 3+ | Validação de schemas de entrada/saída |
| **pnpm** | 8+ | Gerenciador de pacotes eficiente |
| **tsup** | latest | Build TypeScript para produção |
| **Docker / Docker Compose** | latest | Ambiente local isolado |
| **Biome** | latest | Linter + formatter (substitui ESLint/Prettier) |
| **@fastify/jwt** | latest | Autenticação JWT |
| **@fastify/cors** | latest | CORS para o frontend |
| **@fastify/swagger** | latest | Documentação OpenAPI automática |

---

## 2. Estrutura de Pastas

```
src/
├── config/
│   ├── app.ts            # Instância do Fastify + plugins
│   ├── routes.ts         # Registro central de rotas
│   └── logger.ts         # Configuração de log (pino)
├── drizzle/
│   ├── client.ts         # Conexão com o banco
│   ├── schema.ts         # Definição de todas as tabelas
│   └── migrations/       # Arquivos de migração gerados
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.model.ts
│   │   └── auth.schema.ts    # Schemas Zod
│   ├── transactions/
│   │   ├── transactions.controller.ts
│   │   ├── transactions.routes.ts
│   │   ├── transactions.model.ts
│   │   └── transactions.schema.ts
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.routes.ts
│   │   ├── categories.model.ts
│   │   └── categories.schema.ts
│   ├── payment-methods/
│   │   ├── payment-methods.controller.ts
│   │   ├── payment-methods.routes.ts
│   │   ├── payment-methods.model.ts
│   │   └── payment-methods.schema.ts
│   └── summary/
│       ├── summary.controller.ts
│       ├── summary.routes.ts
│       └── summary.model.ts
├── errors/
│   ├── AppError.ts           # Classe base de erro
│   └── errorHandler.ts       # Handler global do Fastify
├── enums/
│   └── statusCodes.ts
├── utils/
│   ├── currency.ts           # Helpers de moeda/cálculo
│   └── date.ts               # Helpers de data
├── settings/
│   └── env.ts                # Leitura e validação de env vars (Zod)
└── index.ts                  # Entry point
```

---

## 3. Modelagem do Banco de Dados

### Tabelas principais (Drizzle Schema)

```ts
// src/drizzle/schema.ts
import { pgTable, uuid, text, numeric, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'

export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense'])

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  email:     text('email').notNull().unique(),
  password:  text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').references(() => users.id).notNull(),
  name:      text('name').notNull(),
  color:     text('color').notNull().default('#3B82F6'),
  icon:      text('icon'),
  deletedAt: timestamp('deleted_at'),
})

export const paymentMethods = pgTable('payment_methods', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').references(() => users.id).notNull(),
  name:      text('name').notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const transactions = pgTable('transactions', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').references(() => users.id).notNull(),
  categoryId:      uuid('category_id').references(() => categories.id),
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),
  description:     text('description').notNull(),
  subDescription:  text('sub_description'),
  amount:          numeric('amount', { precision: 12, scale: 2 }).notNull(),
  type:            transactionTypeEnum('type').notNull(),
  date:            timestamp('date').notNull(),
  createdAt:       timestamp('created_at').defaultNow(),
})
```

---

## 4. Módulos e Endpoints

### Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cadastro de usuário |
| `POST` | `/auth/login` | Login + retorno de JWT |
| `GET`  | `/auth/me` | Dados do usuário autenticado |

### Transactions

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`    | `/transactions` | Listar com filtros (mês, tipo, categoria, método) |
| `GET`    | `/transactions/:id` | Buscar por ID |
| `POST`   | `/transactions` | Criar transação |
| `PUT`    | `/transactions/:id` | Atualizar transação |
| `DELETE` | `/transactions/:id` | Remover transação |

**Query params de listagem:**
```
?month=2024-06
&type=expense|income
&categoryId=uuid
&paymentMethodId=uuid
&page=1
&limit=10
```

### Categories

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`    | `/categories` | Listar categorias do usuário |
| `POST`   | `/categories` | Criar categoria |
| `PUT`    | `/categories/:id` | Atualizar categoria |
| `DELETE` | `/categories/:id` | Soft-delete |
| `PATCH`  | `/categories/:id/restore` | Restaurar |

### Payment Methods

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`    | `/payment-methods` | Listar métodos |
| `POST`   | `/payment-methods` | Criar método |
| `PUT`    | `/payment-methods/:id` | Atualizar |
| `DELETE` | `/payment-methods/:id` | Soft-delete |
| `PATCH`  | `/payment-methods/:id/restore` | Restaurar |

### Summary

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/summary` | Saldo total, receita e despesa do mês |
| `GET` | `/summary/monthly` | Totais mês a mês (últimos N meses) |
| `GET` | `/summary/by-category` | Gastos agrupados por categoria (%) |

---

## 5. Exemplos de Código

### Entry point

```ts
// src/index.ts
import { buildApp } from './config/app'
import { env } from './settings/env'

const app = buildApp()

app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
  app.log.info(`Server running on port ${env.PORT}`)
})
```

### App config

```ts
// src/config/app.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import { registerRoutes } from './routes'
import { errorHandler } from '../errors/errorHandler'
import { env } from '../settings/env'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: env.CORS_ORIGIN })
  app.register(jwt, { secret: env.JWT_SECRET })
  app.register(swagger, { openapi: { info: { title: 'FinanceApp API', version: '1.0.0' } } })

  registerRoutes(app)
  app.setErrorHandler(errorHandler)

  return app
}
```

### Validação de env com Zod

```ts
// src/settings/env.ts
import { z } from 'zod'

const envSchema = z.object({
  PORT:        z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET:  z.string().min(32),
  CORS_ORIGIN: z.string().default('*'),
})

export const env = envSchema.parse(process.env)
```

### AppError

```ts
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message)
  }
}
```

### Controller de transações (exemplo)

```ts
// src/modules/transactions/transactions.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { TransactionModel } from './transactions.model'
import { createTransactionSchema, listTransactionsSchema } from './transactions.schema'
import { AppError } from '../../errors/AppError'

export async function listTransactions(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.id
  const filters = listTransactionsSchema.parse(req.query)
  const transactions = await TransactionModel.findAll(userId, filters)
  return reply.send(transactions)
}

export async function createTransaction(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.id
  const body = createTransactionSchema.parse(req.body)
  const transaction = await TransactionModel.create({ ...body, userId })
  return reply.status(201).send(transaction)
}
```

### Schema Zod de transação

```ts
// src/modules/transactions/transactions.schema.ts
import { z } from 'zod'

export const createTransactionSchema = z.object({
  description:     z.string().min(1).max(120),
  subDescription:  z.string().max(120).optional(),
  amount:          z.number().positive(),
  type:            z.enum(['income', 'expense']),
  date:            z.string().datetime(),
  categoryId:      z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
})

export const listTransactionsSchema = z.object({
  month:           z.string().regex(/^\d{4}-\d{2}$/).optional(),
  type:            z.enum(['income', 'expense']).optional(),
  categoryId:      z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
  page:            z.coerce.number().min(1).default(1),
  limit:           z.coerce.number().min(1).max(100).default(10),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type ListTransactionsInput  = z.infer<typeof listTransactionsSchema>
```

---

## 6. Configuração Docker

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: financeapp
      POSTGRES_PASSWORD: financeapp
      POSTGRES_DB: financeapp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://financeapp:financeapp@db:5432/financeapp
      JWT_SECRET: supersecretjwtkeyatleast32chars!!
      PORT: 3000

volumes:
  pgdata:
```

---

## 7. Scripts

```json
{
  "scripts": {
    "dev":               "tsx watch src/index.ts",
    "build":             "tsup src/index.ts --format cjs --dts",
    "start":             "node build/index.js",
    "drizzle:generate":  "drizzle-kit generate",
    "drizzle:migrate":   "drizzle-kit migrate",
    "drizzle:studio":    "drizzle-kit studio",
    "lint":              "biome check src",
    "format":            "biome format --write src",
    "type-check":        "tsc --noEmit"
  }
}
```

---

## 8. Dependências

```bash
# Produção
pnpm add fastify @fastify/jwt @fastify/cors @fastify/swagger
pnpm add drizzle-orm postgres
pnpm add zod

# Dev
pnpm add -D typescript tsx tsup
pnpm add -D drizzle-kit
pnpm add -D @biomejs/biome
pnpm add -D @types/node
```

---

## 9. Variáveis de Ambiente

```env
# .env
PORT=3000
DATABASE_URL=postgres://financeapp:financeapp@localhost:5432/financeapp
JWT_SECRET=supersecretjwtkeyatleast32chars!!
CORS_ORIGIN=http://localhost:5173
```

---

## 10. Fases de Desenvolvimento

### Fase 1 — Setup base (1 dia)
- [ ] Inicializar projeto com pnpm + TypeScript + tsup
- [ ] Configurar Fastify + plugins (cors, jwt, swagger)
- [ ] Configurar Drizzle + Docker Compose + PostgreSQL
- [ ] Validação de env com Zod
- [ ] Error handler global

### Fase 2 — Auth (1–2 dias)
- [ ] Schema `users` no Drizzle
- [ ] Registro de usuário com hash de senha (bcrypt)
- [ ] Login com geração de JWT
- [ ] Middleware de autenticação (`preHandler`)
- [ ] Rota `/auth/me`

### Fase 3 — Categorias e Métodos de Pagamento (1 dia)
- [ ] CRUD completo de categorias
- [ ] CRUD completo de métodos de pagamento
- [ ] Soft-delete + restore em ambos

### Fase 4 — Transações (2 dias)
- [ ] CRUD completo de transações
- [ ] Filtros por mês, tipo, categoria, método
- [ ] Paginação

### Fase 5 — Summary (1 dia)
- [ ] Saldo total (receitas − despesas)
- [ ] Totais mensais (últimos 6 meses) — para o gráfico de linha
- [ ] Gastos por categoria em % — para o donut

### Fase 6 — Qualidade (1 dia)
- [ ] Documentação Swagger completa
- [ ] Biome lint/format configurado
- [ ] Testes básicos de integração (fastify inject)
- [ ] README com quickstart

---

## 11. Princípios de Design

- **Separação clara**: routes → controllers → models (sem lógica de negócio nas rotas)
- **Type-safety de ponta a ponta**: tipos derivados dos schemas Zod e do Drizzle schema
- **Soft-delete** em entidades que o usuário pode querer restaurar
- **Stateless**: JWT sem sessão no servidor
- **Schema-first**: Zod valida entrada antes de qualquer controller executar
