# Novas Features — ControleFinanceiro

> Documento de especificação para as próximas 5 funcionalidades priorizadas. Cada seção cobre motivação, mudanças no banco, endpoints novos e fluxo de UI. A feature 5 (emails via Resend) é uma extensão direta da feature 4 (notificações in-app) — ambas compartilham os mesmos ganchos e tabelas.

---

## 1. Previsão de Fechamento do Mês

### O que é

Ao consultar o mês corrente, o sistema projeta quanto o usuário vai **gastar e receber** até o final do mês, com base em:

- Transações já lançadas no mês
- Transações recorrentes ativas que ainda vão ocorrer até o dia 31
- Média histórica dos últimos 3 meses por categoria (fallback)

### Por que faz sentido

O módulo `recurring` e o `summary` já existem. A previsão é essencialmente uma junção deles com lógica de datas futuras — sem novo dado externo.

### Banco de Dados

Nenhuma tabela nova necessária. A lógica é calculada em memória no backend com os dados existentes.

### Novo Endpoint

```
GET /summary/forecast
```

**Query params:** `month`, `year`

**Response:**

```json
{
  "currentIncome": 3200.00,
  "currentExpense": 1800.00,
  "projectedIncome": 4500.00,
  "projectedExpense": 2900.00,
  "projectedBalance": 1600.00,
  "recurringUpcoming": [
    {
      "description": "Aluguel",
      "amount": 1200.00,
      "type": "expense",
      "expectedDate": "2026-03-10"
    }
  ],
  "confidence": "high"
}
```

O campo `confidence` é `high` quando há histórico ≥ 3 meses, `low` quando não há histórico suficiente.

### Lógica no Backend

```
src/modules/summary/
└── summary.forecast.ts   # nova função
```

1. Buscar todas as transações do mês atual (já existente via `transactions.model`)
2. Buscar recorrências ativas com `nextOccurrence` dentro do mês (via `recurring.model`)
3. Calcular datas futuras de cada recorrência até fim do mês
4. Somar ao atual → projeção
5. Histórico dos 3 meses anteriores como referência de confiança

### Frontend

- **Dashboard**: novo card "Previsão de fechamento" abaixo dos KPIs atuais
- Exibe barra de progresso: gasto atual vs projetado
- Indicador visual de confiança (ícone de alerta se `confidence: "low"`)
- Clicável → abre drawer com lista de `recurringUpcoming`

---

## 2. Cartões de Crédito com Fatura

### O que é

Enriquecimento da tabela `payment_methods` para suportar cartões de crédito com controle de **ciclo de fatura**: dia de fechamento, dia de vencimento, limite, e cálculo do período de cada fatura.

### Por que faz sentido

Hoje o usuário pode usar um cartão como forma de pagamento, mas não tem visibilidade do ciclo (quando fecha a fatura, quando vence, quanto já usou do limite). Esse módulo torna o cartão um **objeto de primeira classe**.

### Banco de Dados

**Alterar tabela `payment_methods`** — adicionar colunas opcionais:

```sql
ALTER TABLE payment_methods
  ADD COLUMN type          VARCHAR(20) DEFAULT 'other',  -- 'credit' | 'debit' | 'cash' | 'other'
  ADD COLUMN closing_day   INTEGER,     -- dia do mês que a fatura fecha (1-31)
  ADD COLUMN due_day       INTEGER,     -- dia do mês que a fatura vence (1-31)
  ADD COLUMN credit_limit  NUMERIC(12,2);
```

**Nova tabela `credit_invoices`** — registra pagamentos de fatura:

```sql
CREATE TABLE credit_invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  reference_month   INTEGER NOT NULL,  -- mês da fatura (ex: 3)
  reference_year    INTEGER NOT NULL,  -- ano da fatura (ex: 2026)
  total_amount      NUMERIC(12,2) NOT NULL,
  paid_amount       NUMERIC(12,2) DEFAULT 0,
  due_date          DATE,
  paid_at           TIMESTAMP,
  transaction_id    UUID REFERENCES transactions(id),  -- transação do pagamento
  created_at        TIMESTAMP DEFAULT NOW()
);
```

### Novos Endpoints

```
GET  /credit-cards                          # listar cartões (payment_methods com type='credit')
GET  /credit-cards/:id/invoice?month=&year= # fatura do mês
POST /credit-cards/:id/invoice/pay          # registrar pagamento da fatura
GET  /credit-cards/:id/limit               # uso atual do limite
```

**Response de `/invoice`:**

```json
{
  "paymentMethodId": "uuid",
  "cardName": "Nubank",
  "referenceMonth": 3,
  "referenceYear": 2026,
  "closingDate": "2026-03-03",
  "dueDate": "2026-03-10",
  "creditLimit": 5000.00,
  "usedAmount": 1840.50,
  "availableLimit": 3159.50,
  "isPaid": false,
  "transactions": [ ...lista de transações do período... ]
}
```

### Lógica de Período da Fatura

O período da fatura **não é o mês calendário**. Se `closing_day = 3`:

- Fatura de março: `04/fev` → `03/mar`
- Fatura de abril: `04/mar` → `03/abr`

Essa lógica fica em `src/utils/invoicePeriod.ts`:

```typescript
function getInvoicePeriod(closingDay: number, month: number, year: number) {
  const start = subMonths(setDate(new Date(year, month - 1), closingDay + 1), 1)
  const end   = setDate(new Date(year, month - 1), closingDay)
  return { start, end }
}
```

### Frontend

**Nova página `/credit-cards`:**

- Listagem de cartões com: nome, limite usado/total (barra), fatura atual, próximo vencimento
- Badge "Vence em X dias" em vermelho quando ≤ 5 dias
- Botão "Ver fatura" → abre página de detalhe da fatura

**Página de fatura `/credit-cards/:id/invoice`:**

- Header: período, total, limite usado, vencimento
- Lista de transações do período (idêntica à de Transferências)
- Botão "Pagar fatura" → cria transação de débito e marca a fatura como paga

**Integração com Transferências:**

- Ao criar transação com `paymentMethodId` de um cartão crédito, o campo aparece normalmente
- A transação entra automaticamente na fatura do período correspondente

---

## 3. Split de Transação por Categoria

### O que é

Permite dividir **um único gasto** em múltiplas categorias/subcategorias. Exemplo: uma compra de R$ 300 no supermercado onde R$ 200 são "Alimentação" e R$ 100 são "Higiene".

### Por que faz sentido

Hoje um lançamento só aceita uma categoria. Isso força o usuário a criar duas transações separadas ou a escolher a categoria "dominante" e perder granularidade nos relatórios.

### Banco de Dados

**Nova tabela `transaction_splits`:**

```sql
CREATE TABLE transaction_splits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id   UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  category_id      UUID NOT NULL REFERENCES categories(id),
  subcategory_id   UUID REFERENCES subcategories(id),
  amount           NUMERIC(12,2) NOT NULL,
  description      VARCHAR(255),
  created_at       TIMESTAMP DEFAULT NOW()
);
```

**Alterar tabela `transactions`:**

```sql
ALTER TABLE transactions
  ADD COLUMN is_split BOOLEAN DEFAULT FALSE;
```

Quando `is_split = true`:
- `categoryId` na transação pai recebe a categoria do maior split (para manter compatibilidade com filtros existentes)
- O `amount` da transação pai continua sendo o total
- Os splits somam exatamente ao total

### Endpoints Alterados

**`POST /transactions`** — aceita campo opcional `splits`:

```json
{
  "description": "Compras no Extra",
  "amount": 300.00,
  "type": "expense",
  "date": "2026-03-15",
  "categoryId": "uuid-alimentacao",
  "paymentMethodId": "uuid",
  "splits": [
    { "categoryId": "uuid-alimentacao", "amount": 200.00 },
    { "categoryId": "uuid-higiene",     "amount": 100.00 }
  ]
}
```

**`GET /transactions`** — retorna `splits` quando `is_split = true`:

```json
{
  "id": "uuid",
  "description": "Compras no Extra",
  "amount": 300.00,
  "isSplit": true,
  "splits": [
    { "categoryId": "uuid-alimentacao", "categoryName": "Alimentação", "amount": 200.00 },
    { "categoryId": "uuid-higiene",     "categoryName": "Higiene",     "amount": 100.00 }
  ]
}
```

### Compatibilidade com Summary

O módulo `summary/by-category` deve considerar os splits ao agrupar. Lógica:

- Se `is_split = false` → usa `category_id` da transação (comportamento atual)
- Se `is_split = true` → ignora `category_id` da transação pai e usa cada split individualmente com seu respectivo `amount`

Isso garante que os gráficos de pizza continuam corretos sem quebrar transações existentes.

### Frontend

**Modal de criação/edição de transação:**

- Toggle "Dividir por categoria" — ao ativar, aparece seção de splits
- Campos por split: categoria, subcategoria (opcional), valor
- Soma dos splits em tempo real com indicador de diferença para o total
- Botão "+" para adicionar split, "×" para remover
- Validação: soma dos splits deve ser igual ao `amount` total

**Lista de transações:**

- Transações com split exibem badge "Dividido" e ícone de expansão
- Expandir mostra cada split com categoria e valor

---

## 4. Notificações de Orçamento e Metas

### O que é

Sistema de alertas que notifica o usuário quando:

- Um orçamento ultrapassa **80%** do limite (alerta amarelo)
- Um orçamento ultrapassa **100%** do limite (alerta vermelho)
- Uma meta atinge **50%**, **75%** ou **100%** do valor alvo

As notificações ficam persistidas no banco e aparecem na interface. O canal inicial é **in-app** (sem dependência de email/push). Email pode ser adicionado depois.

### Banco de Dados

**Nova tabela `notifications`:**

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        VARCHAR(50) NOT NULL,   -- 'budget_warning' | 'budget_exceeded' | 'goal_milestone'
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  entity_type VARCHAR(50),            -- 'budget' | 'goal'
  entity_id   UUID,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

**Nova tabela `notification_settings`:**

```sql
CREATE TABLE notification_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) UNIQUE,
  budget_warning_pct    INTEGER DEFAULT 80,   -- percentual para alerta amarelo
  budget_exceeded       BOOLEAN DEFAULT TRUE,
  goal_milestones       BOOLEAN DEFAULT TRUE,
  email_enabled         BOOLEAN DEFAULT FALSE,
  email_address         VARCHAR(255),
  updated_at            TIMESTAMP DEFAULT NOW()
);
```

### Novos Endpoints

```
GET    /notifications              # listar notificações do usuário (paginado)
PATCH  /notifications/:id/read     # marcar como lida
PATCH  /notifications/read-all     # marcar todas como lidas
DELETE /notifications/:id          # deletar notificação
GET    /notifications/settings     # configurações do usuário
PUT    /notifications/settings     # atualizar configurações
```

### Quando Gerar Notificações

As notificações são geradas **ao momento do evento**, não por cron. Os ganchos ficam nos controllers existentes:

| Evento | Onde adicionar gancho | Tipo gerado |
|--------|----------------------|-------------|
| `POST /transactions` | `transactions.controller` | `budget_warning` ou `budget_exceeded` |
| `PUT /transactions/:id` | `transactions.controller` | idem |
| `POST /goals/:id/contribute` | `goals.controller` | `goal_milestone` |

**Lógica de deduplicação:** antes de inserir, verificar se já existe notificação do mesmo `type + entity_id` criada nas últimas 24h. Se sim, não duplicar.

### Frontend

**Ícone de sino no header** com badge de contagem de não lidas:

- Clique abre dropdown com as últimas 10 notificações
- Cada item: ícone colorido (amarelo/vermelho/verde), título, tempo relativo ("há 2 horas")
- Link "Ver todas" → página `/notifications`
- Marcar como lida ao clicar

**Página `/notifications`:**

- Lista completa paginada
- Filtros: tipo, lidas/não lidas
- Botão "Marcar todas como lidas"
- Link para a entidade relacionada (ex: clicar na notificação de orçamento vai para `/budgets`)

**Página de configurações `/settings`:**

- Toggle para cada tipo de notificação
- Slider para percentual de alerta de orçamento (padrão: 80%)
- Toggle e campo de email para notificações por email (fase 2)

---

## 5. Emails Transacionais via Resend

### O que é

Extensão da feature 4: quando uma notificação in-app é gerada e o usuário tem `email_enabled = true` em `notification_settings`, o backend também envia um email usando o [Resend](https://resend.com). Os templates são escritos com **React Email** — componentes `.tsx` que compilam para HTML compatível com todos os clientes de email.

Nenhum novo endpoint é necessário além dos já definidos na feature 4. A integração é inteiramente server-side.

### Por que Resend

- SDK TypeScript-first com tipos completos — sem `any` ou adaptadores
- Suporte nativo a **React Email**: templates como componentes, com preview em desenvolvimento (`email dev`)
- Webhook para rastrear entrega, abertura e bounce sem infraestrutura adicional
- Free tier de 3.000 emails/mês — suficiente para o volume inicial do projeto
- Autenticação via API key sem configuração de SMTP

### Instalação

```bash
# dentro de api/
pnpm add resend
pnpm add -D @react-email/components react react-dom @types/react
```

> O `react` instalado aqui é apenas para renderização server-side dos templates. Não interfere com o frontend.

### Variáveis de Ambiente

Adicionar em `api/.env` e registrar no schema `src/settings/env.ts`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@seudominio.com.br
APP_URL=https://app.seudominio.com.br
```

```typescript
// src/settings/env.ts — adicionar ao schema Zod existente
RESEND_API_KEY:    z.string().min(1),
RESEND_FROM_EMAIL: z.string().email(),
APP_URL:           z.string().url(),
```

### Estrutura de Arquivos

```
api/src/
└── emails/
    ├── resend.client.ts          # instância singleton do Resend
    ├── email.service.ts          # funções públicas de envio
    └── templates/
        ├── BudgetWarning.tsx     # alerta: orçamento em X% do limite
        ├── BudgetExceeded.tsx    # alerta: orçamento ultrapassado
        └── GoalMilestone.tsx     # marco de meta atingido (50/75/100%)
```

### Resend Client (singleton)

```typescript
// src/emails/resend.client.ts
import { Resend } from 'resend'
import { env } from '@/settings/env'

export const resend = new Resend(env.RESEND_API_KEY)
```

### Email Service

Arquivo central que expõe as funções de envio. Cada função recebe os dados necessários, renderiza o template com `@react-email/render` e chama `resend.emails.send`.

```typescript
// src/emails/email.service.ts
import { render } from '@react-email/components'
import { resend } from './resend.client'
import { env } from '@/settings/env'
import { BudgetWarning }  from './templates/BudgetWarning'
import { BudgetExceeded } from './templates/BudgetExceeded'
import { GoalMilestone }  from './templates/GoalMilestone'

interface EmailRecipient {
  name:  string
  email: string
}

export async function sendBudgetWarningEmail(
  to: EmailRecipient,
  data: { categoryName: string; usedPct: number; usedAmount: number; budgetAmount: number }
) {
  const html = await render(BudgetWarning({ userName: to.name, appUrl: env.APP_URL, ...data }))
  return resend.emails.send({
    from:    env.RESEND_FROM_EMAIL,
    to:      `${to.name} <${to.email}>`,
    subject: `Atenção: orçamento de ${data.categoryName} em ${data.usedPct}%`,
    html,
  })
}

export async function sendBudgetExceededEmail(
  to: EmailRecipient,
  data: { categoryName: string; usedAmount: number; budgetAmount: number; exceededBy: number }
) {
  const html = await render(BudgetExceeded({ userName: to.name, appUrl: env.APP_URL, ...data }))
  return resend.emails.send({
    from:    env.RESEND_FROM_EMAIL,
    to:      `${to.name} <${to.email}>`,
    subject: `Orçamento de ${data.categoryName} ultrapassado`,
    html,
  })
}

export async function sendGoalMilestoneEmail(
  to: EmailRecipient,
  data: { goalName: string; milestone: 50 | 75 | 100; currentAmount: number; targetAmount: number }
) {
  const html = await render(GoalMilestone({ userName: to.name, appUrl: env.APP_URL, ...data }))
  return resend.emails.send({
    from:    env.RESEND_FROM_EMAIL,
    to:      `${to.name} <${to.email}>`,
    subject: `Meta "${data.goalName}" chegou a ${data.milestone}%!`,
    html,
  })
}
```

### Exemplo de Template React Email

```tsx
// src/emails/templates/BudgetWarning.tsx
import {
  Html, Head, Preview, Body, Container,
  Heading, Text, Button, Hr, Section
} from '@react-email/components'

interface Props {
  userName:     string
  categoryName: string
  usedPct:      number
  usedAmount:   number
  budgetAmount: number
  appUrl:       string
}

export function BudgetWarning({ userName, categoryName, usedPct, usedAmount, budgetAmount, appUrl }: Props) {
  const remaining = budgetAmount - usedAmount

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Orçamento de {categoryName} em {usedPct}% — R$ {remaining.toFixed(2)} restantes</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '8px', padding: '32px' }}>

          <Heading style={{ fontSize: '20px', color: '#09090b', marginBottom: '8px' }}>
            Atenção ao orçamento
          </Heading>

          <Text style={{ color: '#52525b', lineHeight: '1.6' }}>
            Olá, {userName}. O orçamento de <strong>{categoryName}</strong> atingiu <strong>{usedPct}%</strong> do limite definido.
          </Text>

          <Section style={{ backgroundColor: '#fef9c3', borderRadius: '6px', padding: '16px', margin: '24px 0' }}>
            <Text style={{ margin: 0, color: '#713f12' }}>
              Gasto até agora: <strong>R$ {usedAmount.toFixed(2)}</strong><br />
              Limite do orçamento: <strong>R$ {budgetAmount.toFixed(2)}</strong><br />
              Saldo restante: <strong>R$ {remaining.toFixed(2)}</strong>
            </Text>
          </Section>

          <Button
            href={`${appUrl}/budgets`}
            style={{ backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '6px', padding: '12px 24px', textDecoration: 'none', fontSize: '14px' }}
          >
            Ver orçamentos
          </Button>

          <Hr style={{ borderColor: '#e4e4e7', margin: '32px 0 16px' }} />
          <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>
            Você recebe este email porque ativou alertas de orçamento no ControleFinanceiro.
            Para desativar, acesse Configurações → Notificações.
          </Text>

        </Container>
      </Body>
    </Html>
  )
}
```

Os templates `BudgetExceeded` e `GoalMilestone` seguem a mesma estrutura, alterando apenas cores (vermelho para excedido, verde para meta) e o texto do corpo.

### Integração com a Feature 4 (notificationTrigger)

O ponto de integração é o utilitário `notificationTrigger.ts`, que já será criado para a feature 4. Basta adicionar a chamada de email **após** persistir a notificação no banco, dentro do mesmo bloco assíncrono:

```typescript
// src/utils/notificationTrigger.ts
import * as emailService from '@/emails/email.service'

export async function triggerBudgetNotification(params: {
  userId:       string
  userName:     string
  categoryName: string
  usedPct:      number
  usedAmount:   number
  budgetAmount: number
  entityId:     string
}) {
  const { userId, userName, categoryName, usedPct, usedAmount, budgetAmount, entityId } = params

  // 1. Deduplicação: verificar notificação recente (24h) — já definido na feature 4
  const alreadyNotified = await checkRecentNotification(userId, 'budget_warning', entityId)
  if (alreadyNotified) return

  // 2. Persistir notificação in-app (feature 4)
  await db.insert(notifications).values({
    userId,
    type:       usedPct >= 100 ? 'budget_exceeded' : 'budget_warning',
    title:      `Orçamento de ${categoryName} em ${usedPct}%`,
    body:       `Você usou R$ ${usedAmount.toFixed(2)} de R$ ${budgetAmount.toFixed(2)}`,
    entityType: 'budget',
    entityId,
  })

  // 3. Email (feature 5) — só dispara se o usuário habilitou
  const settings = await getNotificationSettings(userId)
  if (settings?.emailEnabled && settings.emailAddress) {
    const fn = usedPct >= 100 ? emailService.sendBudgetExceededEmail : emailService.sendBudgetWarningEmail
    await fn(
      { name: userName, email: settings.emailAddress },
      { categoryName, usedPct, usedAmount, budgetAmount, exceededBy: usedAmount - budgetAmount }
    ).catch(err => console.error('[email] falha ao enviar:', err))
    // catch isola falha de email — nunca deve quebrar a transação principal
  }
}
```

O mesmo padrão se aplica para `triggerGoalMilestoneNotification`.

### Banco de Dados

Nenhuma tabela nova. As colunas `email_enabled` e `email_address` já estão definidas na tabela `notification_settings` da feature 4. O único acréscimo é uma coluna de rastreamento opcional:

```sql
ALTER TABLE notification_settings
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  -- true após o usuário confirmar o endereço de email
```

Verificação de email é opcional na fase 1 — basta o usuário informar o endereço. Para evitar envios para endereços inválidos, o Resend retorna bounce via webhook que pode atualizar esse campo no futuro.

### Webhook de Bounce (opcional, fase 2)

O Resend envia eventos via webhook para uma URL configurada no painel. Registrar o endpoint:

```
POST /webhooks/resend
```

```typescript
// src/modules/webhooks/resend.webhook.ts
fastify.post('/webhooks/resend', async (request, reply) => {
  const event = request.body as ResendWebhookEvent

  if (event.type === 'email.bounced') {
    // desabilitar email do usuário para evitar novos envios
    await db.update(notificationSettings)
      .set({ emailEnabled: false })
      .where(eq(notificationSettings.emailAddress, event.data.to))
  }

  return reply.status(200).send({ ok: true })
})
```

### Preview Local dos Templates

O React Email tem um servidor de preview embutido que renderiza os templates no browser durante o desenvolvimento:

```bash
# instalar CLI globalmente
pnpm add -D react-email

# rodar preview apontando para a pasta de templates
npx react-email dev --dir src/emails/templates --port 3001
```

Acesse `http://localhost:3001` para visualizar e iterar os templates com hot-reload.

### Frontend (Configurações)

Nenhuma página nova — apenas expandir a seção de configurações já prevista na feature 4:

**Página `/settings` → aba "Notificações":**

- Toggle "Receber alertas por email"
- Campo de texto para o endereço de email (aparece ao ativar o toggle)
- Botão "Salvar" — chama `PUT /notifications/settings`
- Texto explicativo: quais eventos disparam email (orçamento em alerta, orçamento excedido, marcos de meta)

O campo de email é pré-preenchido com o email de cadastro do usuário, mas pode ser alterado para um email diferente (ex: email pessoal distinto do de login).

---

## Ordem de Implementação Sugerida

| Prioridade | Feature | Complexidade | Depende de |
|------------|---------|-------------|-----------|
| 1 | Previsão de fechamento | Baixa | — |
| 2 | Notificações in-app | Média | — |
| 3 | Emails via Resend | Baixa | Feature 4 |
| 4 | Split de transação | Média | — |
| 5 | Cartões com fatura | Alta | — |

A feature 5 (emails) tem complexidade baixa porque toda a lógica de trigger e deduplicação já está na feature 4 — é apenas adicionar o canal de entrega. Por isso entra logo após as notificações in-app estarem funcionando, antes de partir para features de banco mais complexas.
