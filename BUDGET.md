# Orçamentos Recorrentes

## Visão Geral

Orçamentos recorrentes permitem que você defina um limite de gastos para uma categoria que será automaticamente recriado no início de cada mês.

## Funcionalidades

### Criar Orçamento Recorrente

1. Vá para a página de Orçamentos
2. Clique em "Novo Orçamento"
3. Selecione uma categoria
4. Defina o valor do orçamento
5. Ative o toggle "Orçamento Recorrente"
6. Clique em "Criar orçamento"

### Comportamento Automático

- Ao ativar um orçamento como recorrente, ele será automaticamente recriado no início de cada mês
- O valor do orçamento é mantido (copiado do mês anterior)
- O orçamento mantém as mesmas configurações de categoria/subcategoria

### Ativar/Desativar

- Orçamentos recorrentes mostram um badge "Recorrente" no card
- Botão "Desativar" permite desativar a recorrência sem deletar
- Um orçamento desativado não será recriado no próximo mês
- Para reativar, é necessário editar o orçamento

### Editar Orçamento

- Ao editar um orçamento recorrente, o valor será atualizado para todos os meses futuros
- Não é possível mudar a categoria de um orçamento recorrente existente
- Para mudar a categoria, delete o orçamento e crie um novo

## Campos da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `is_recurring` | boolean | Indica se o orçamento é recorrente |
| `is_active` | boolean | Indica se o orçamento está ativo (pode ser recriado) |
| `recurring_group_id` | uuid | Agrupa orçamentos recorrentes entre meses |

## API Endpoints

### Criar Orçamento Recorrente

```
POST /budgets
Body: {
  "categoryId": "uuid",
  "amount": 1000.00,
  "month": 3,
  "year": 2026,
  "isRecurring": true
}
```

### Desativar Orçamento

```
PATCH /budgets/:id/toggle
```

### Listar Orçamentos

```
GET /budgets?month=3&year=2026
```

Os orçamentos recorrentes são automaticamente recriados ao fazer a consulta.

## Lógica de Recriação

A recriação ocorre automaticamente ao consultar orçamentos para um mês:

1. Verifica se existem orçamentos recorrentes ativos para o usuário
2. Verifica se já existem orçamentos criados para o mês solicitado
3. Para cada orçamento recorrente ativo sem representação no mês:
   - Cria uma cópia com o mesmo valor e categoria
   - Mantém o status `isActive` do orçamento original
   - Vincula ao `recurring_group_id` do orçamento original
