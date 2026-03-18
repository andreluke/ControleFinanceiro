# Changelog

Todas as mudanças são aplicadas em ambas as plataformas (web e API), exceto onde indicado.

---

## [Em Desenvolvimento]

### Correções

- **RecurringModal**: Corrigido conflito de `ref` nos inputs de data (startDate/endDate). Agora utiliza `Controller` do react-hook-form com callback de ref para permitir que o datepicker funcione corretamente.

- **RecurringModal API**: Corrigido schema da rota POST `/recurring` que esperava `date` ao invés de `startDate`.

- **Processamento de Transações Recorrentes**: Corrigido erro `value.toISOString is not a function` ao processar uma transação recorrente. Adicionado método `updateLastGeneratedAt` dedicado.

- **Botão Sacar em Metas**: Corrigido comportamento onde o botão "Sacar" abria o modal de edição ao invés do modal de saque. Agora utiliza `initialMode` com valores `'view' | 'deposit' | 'withdraw'`.

- **Orçamentos - Migration**: Adicionadas migrations para os novos campos de orçamentos (`0011_budgets_recurring.sql`, `0012_budgets_base_amount.sql`).

- **Component Switch**: Criado componente `Switch` usando Radix UI `@radix-ui/react-switch` que estava faltando.

- **Orçamentos - Schema updateBudgetSchema**: Adicionado campo `baseAmount` ao schema de atualização que estava faltando, impedindo a edição do valor base.

- **Orçamentos - Cálculo de Total na Criação**: Corrigido bug onde ao criar um orçamento de categoria pai, o `amount` não considerava subcategorias já existentes. Agora calcula corretamente `baseAmount + soma(subcategorias)` incluindo orçamentos existentes.

- **Orçamentos - Variável showCalculatedBadge**: Adicionada variável que estava faltando no BudgetCard.

---

### Novas Funcionalidades

#### Módulo de Metas de Economia

- **Tabela `goal_contributions`**: Novo campo `type` ("deposit" ou "withdrawal") para distinguir depósitos de saques no histórico.

- **Histórico de Movimentações**:
  - Visualização do histórico completo de contribuições de cada meta
  - Depósitos exibidos com cor verde e sinal "+"
  - Saques exibidos com cor vermelha e sinal "-"
  - Exibe data, tipo e valor de cada movimentação

- **Botões de Ação**:
  - Botão "Depositar" para adicionar valor à meta
  - Botão "Sacar" para remover valor da meta (não pode exceder saldo atual)
  - Modal com modos separados para depósito e saque

- **Lógica de Transações**:
  - Ao depositar: cria transação de **despesa** (dinheiro sai da conta principal → vai para a "caixinha")
  - Ao sacar: cria transação de **receita** (dinheiro retorna para a conta principal)

- **Forma de Pagamento "Interno"**:
  - Transações de contribuição e saque de metas utilizam a forma de pagamento "Interno"
  - Se não existir, é criada automaticamente
  - Comportamento análogo à categoria "Meta"

- **Filtragem de Metas nos Gráficos**:
  - Transações da categoria "Meta" são automaticamente excluídas de todos os gráficos e resumos
  - Afeta: `getSummary`, `getMonthlySummary`, `getByCategorySummary`
  - As metas não afetam o saldo, receitas ou despesas exibidos nos dashboards

#### Módulo de Orçamentos Recorrentes

- **Campos na Tabela**:
  - `isRecurring` (boolean): Marca orçamentos como recorrentes
  - `isActive` (boolean): Controla se o orçamento será recriado no próximo mês
  - `recurringGroupId` (uuid): Agrupa orçamentos recorrentes entre meses
  - `baseAmount` (numeric): Valor base da categoria pai

- **Recriação Automática**:
  - Orçamentos recorrentes são automaticamente recriados no início de cada mês
  - Lógica executada automaticamente ao consultar orçamentos (`ensureRecurringBudgetsExist`)
  - Mantém o mesmo valor e configurações do mês anterior

- **Controle de Ativação/Desativação**:
  - Botão "Desativar/Ativar" visível nos cards de orçamentos recorrentes
  - Ao desativar: o orçamento não será recriado no próximo mês
  - Reativação só pode ser feita ao editar o orçamento
  - Editar um orçamento recorrente atualiza o valor em todos os meses futuros

- **Conversão de Orçamentos**:
  - É possível converter orçamentos antigos (não recorrentes) em recorrentes
  - Ao ativar a recorrência e salvar, o sistema cria o grupo recorrente automaticamente

#### Orçamentos de Categoria com Subcategorias

- **Valor Base e Subcategorias**:
  - Campo `baseAmount` para armazenar o valor base da categoria pai
  - Valor total da categoria = `baseAmount` + soma(subcategorias)
  - Atualização automática quando subcategorias são criadas, editadas ou deletadas
  - Método privado `recalculateParentBudget` para recalcular o total

- **Interface - Cards**:
  - Exibição do valor "Base"单独的 nos cards de orçamento pai
  - Exibição do "Total subcategorias" nos cards
  - Badge "Calculado" para orçamentos que são soma de subcategorias
  - Cálculo correto do total: Base + Subcategorias = Total

- **Interface - Modal de Edição**:
  - Ao editar categoria pai com subcategorias, mostra campo "Valor base"
  - O total é calculado automaticamente e exibido na descrição
  - Não é mais possível editar o total diretamente (apenas o base)

- **Interface - Modal de Criação**:
  - Descrição clara sobre como o valor é calculado
  - Indica se é valor base ou total

---

### Melhorias Internas

#### API

- Adicionado método `findByName` em `PaymentMethodModel` para busca por nome
- Refatorado `SummaryModel` com método privado `getMetaCategoryId` para reutilização de lógica
- Adicionado método `updateLastGeneratedAt` em `RecurringTransactionModel`
- Novo endpoint PATCH `/budgets/:id/toggle` para ativar/desativar orçamentos recorrentes
- Métodos `findRecurringByUser` e `ensureRecurringBudgetsExist` em `BudgetsModel`
- Métodos `getSubcategoriesTotal` e `recalculateParentBudget` em `BudgetsModel`
- Atualizado `updateBudgetSchema` com campo `baseAmount`
- Atualizado `createBudgetSchema` com campo `baseAmount`
- Lógica em `create` considera subcategorias existentes ao calcular amount total

#### Frontend

- Hook `useToggleBudgetActive` adicionado em `useBudgets`
- Componente `Switch` criado usando Radix UI
- Badge "Recorrente" e "Calculado" nos cards de orçamentos
- Indicadores visuais para orçamentos desativados (opacidade reduzida)
- Exibição detalhada: Base + Subcategorias = Total
- Lógica condicional no modal para edição de base vs total

---

## Banco de Dados

### Migrations

```sql
-- 0011_budgets_recurring.sql
ALTER TABLE budgets ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE budgets ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE budgets ADD COLUMN recurring_group_id UUID REFERENCES budgets(id);

CREATE INDEX idx_budgets_recurring_group_id ON budgets(recurring_group_id);
CREATE INDEX idx_budgets_is_recurring ON budgets(is_recurring);

-- 0012_budgets_base_amount.sql
ALTER TABLE budgets ADD COLUMN base_amount NUMERIC(12, 2);
```

### Tabela budgets (campos novos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `is_recurring` | boolean | Indica se o orçamento se repete mensalmente |
| `is_active` | boolean | Indica se o orçamento está ativo para recriação |
| `recurring_group_id` | uuid | Agrupa orçamentos recorrentes entre meses |
| `base_amount` | numeric | Valor base da categoria (sem subcategorias) |

---

## Histórico de Versões

- **[1.x.x]** - Versão atual em desenvolvimento com módulo de Metas e Orçamentos Recorrentes completos
