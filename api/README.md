# FinanceApp API

API REST para controle financeiro pessoal. Stack: **TypeScript · Fastify · Drizzle ORM · PostgreSQL · Zod**.

## Quickstart

### 1. Variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas configurações (ex: JWT_SECRET, DATABASE_URL)
```

### 2. Banco de dados (Docker)

Certifique-se de ter o Docker instalado e rodando. Em seguida, inicie o banco de dados PostgreSQL usando o \`docker-compose.yml\` que está na raiz do projeto (fora da pasta api):

```bash
docker compose up -d db
```

### 3. Migrations

Com o banco de dados rodando, aplique o esquema no banco:

```bash
pnpm drizzle:migrate
```

### 4. Desenvolvimento e Testes

Inicie a API em modo de desenvolvimento local:
```bash
pnpm dev
```
A API estará rodando em `http://localhost:3000`.
Acesse o Swagger UI com a documentação em: `http://localhost:3000/docs`

Para rodar os testes unitários e de integração:
```bash
pnpm test
```

## Scripts

| Script | Descrição |
|-------|-----------|
| `pnpm dev` | Inicia em modo desenvolvimento (tsx watch) |
| `pnpm build` | Build de produção |
| `pnpm start` | Executa o build |
| `pnpm test` | Roda a suíte de testes (Vitest) |
| `pnpm drizzle:generate` | Gera migrations a partir do schema |
| `pnpm drizzle:migrate` | Aplica migrations |
| `pnpm drizzle:studio` | Abre o Drizzle Studio |
| `pnpm lint` | Verificação de qualidade do código (Biome check) |
| `pnpm format` | Formatação automática de código (Biome format) |
| `pnpm type-check` | Verificação de tipos |

## Estrutura

```
src/
├── config/          # Fastify app, rotas
├── drizzle/         # Schema, client, migrations
├── errors/          # AppError, errorHandler
├── modules/         # auth, transactions, categories, etc.
├── settings/        # env (Zod)
├── utils/           # Helpers
└── index.ts
```
