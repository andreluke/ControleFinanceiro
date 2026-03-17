# Feature: Metas de Economia (Goals)

## Descrição
Permitir que usuários definam metas de economia/poupança para acompanhar seu progresso ao longo do tempo.

## Estrutura de Dados

### Tabela `goals` (Banco)
```sql
goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Integração com Transações

### Comportamento de Contribuição
Ao contribuir com uma meta (POST /goals/:id/contribute):

1. **Primeira Contribuição**:
   - Cria automaticamente uma categoria "Meta" com cor cinza (#6B7280) se não existir
   - Cria uma transação do tipo "income" com:
     - Descrição: "Meta: {nome da meta}"
     - Valor: valor contribuido
     - Categoria: "Meta" (cinza)
   - Associa o category_id à meta para uso futuro

2. **Contribuições Subsequentes**:
   - Usa a categoria já associada à meta
   - Se o usuário editar a categoria (nome, cor, etc), a próxima contribuição usará a categoria editada
   - Não cria novas categorias

3. **Se categoria for deletada**:
   - Na próxima contribuição, cria uma nova categoria "Meta" (cinza)
   - Ciclo se repete

### Benefícios
- Transações ficam registradas no extrato
- Usuário pode filtrar/transações por "Meta" para ver histórico de economias
- Categoria editável permite personalização (ex: mudar nome para "Economia Casa" ou cor verde)

## Backend - API

### Endpoints

1. **GET /goals** - Lista metas do usuário
2. **POST /goals** - Cria nova meta
3. **GET /goals/:id** - Detalha uma meta
4. **PUT /goals/:id** - Atualiza meta
5. **DELETE /goals/:id** - Remove meta
6. **POST /goals/:id/contribute** - Adiciona valor à meta

### Campos do Schema
- `name`: Nome da meta (obrigatório)
- `description`: Descrição opcional
- `targetAmount`: Valor alvo (obrigatório)
- `currentAmount`: Valor atual (automático, calculado)
- `deadline`: Data limite (opcional)
- `icon`: Ícone (opcional)
- `color`: Cor (opcional)
- `isActive`: Meta ativa (padrão true)

### Arquivos Backend
- `api/src/drizzle/schema.ts` - Tabela goals
- `api/src/modules/goals/goals.model.ts` - Modelo com métodos CRUD e contribute
- `api/src/modules/goals/goals.controller.ts` - Controlador com validação e autorização
- `api/src/modules/goals/goals.routes.ts` - Rotas da API
- `api/src/modules/goals/goals.schema.ts` - Schemas Zod para validação
- `api/src/modules/goals/goals.types.ts` - Tipos TypeScript
- `api/src/drizzle/migrations/0008_goals_category_id.sql` - Migration para category_id

## Frontend - Página

### KPIs na Página de Metas
1. **Total Economizado** - Soma de currentAmount de todas as metas
2. **Total Faltante** - Quanto falta para atingir todas as metas
3. **Metas Concluídas** - Quantas metas atingiram o targetAmount
4. **Metas Ativas** - Quantas metas ativas (isActive = true)

### Componentes UI

#### GoalCard (`web/src/pages/components/GoalCard.tsx`)
- Nome e ícone/color
- Barra de progresso
- Valor atual / Valor alvo
- Data limite (se houver)
- Botão "Contribuir" (apenas quando meta não concluída)
- Botões de editar e excluir

#### GoalModal (`web/src/pages/components/GoalModal.tsx`)
Modal único para criar, editar e contribuir:

**Modo Criar/Editar:**
- Nome da meta
- Descrição (opcional)
- Valor alvo
- Prazo (datepicker com calendário)
- Cor (seleção de cores predefinidas)
- Botão "Contribuir" (apenas no modo edição)

**Modo Contribuir:**
- Informações da meta (nome, atual/target)
- Input de valor com formatação de moeda (R$)
- Validação de valor positivo

#### GoalsPage (`web/src/pages/GoalsPage.tsx`)
- Header com botão "Criar meta"
- KPIs em cards
- Grid de GoalCards
- Modal integrado (GoalModal)

### Hooks (`web/src/hooks/useGoals.ts`)
- `useGoals()` - Lista metas
- `useCreateGoal()` - Cria meta
- `useUpdateGoal()` - Atualiza meta
- `useDeleteGoal()` - Remove meta
- `useContributeGoal()` - Contribui com valor

### Tipos (`web/src/types/goal.ts`)
- `Goal` - Tipo da meta
- `CreateGoalInput` - Input para criação

### Padrões de Implementação

1. **Datepicker**: Usa Input type="date" com ref e botão de calendário (CalendarDays do lucide-react)
2. **Input de moeda**: Controller do react-hook-form com formatação pt-BR (R$)
   - `formatCurrencyMasked()` - Formata número para pt-BR
   - `parseCurrencyMasked()` - Remove não-dígitos e converte para número
3. **Estado do modal**: Props `initialContributeMode` para abrir no modo contribuição
4. **Formulários**: react-hook-form com zodResolver

## Funcionalidades Extras (Futuro)
- Metas com contribuição automática mensal
- Notificações de progresso
- Metas compartilhadas (família)
- Histórico de contribuições
- Widget no dashboard

## Implementação Concluída
1. ✅ Banco (Tabela)
2. ✅ API CRUD
3. ✅ Página com KPIs
4. ✅ Cards de metas
5. ✅ Modal de criar/editar
6. ✅ Contribuir com valores
7. ✅ Integração com transações (categoria "Meta")
8. ✅ Datepicker com calendário
9. ✅ Input de moeda com formatação
10. ✅ Botão contribuir no card
