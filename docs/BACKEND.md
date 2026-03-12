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
