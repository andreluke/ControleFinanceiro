# System Design Proposto - FinanceApp Mobile

## 1. Visão Geral

Este documento apresenta as recomendações de design para adaptar o FinanceApp para dispositivos móveis (iOS e Android), mantendo consistência visual e de experiência com a versão web existente.

### 1.1 Princípios de Design

1. **Adaptação，而非重新设计**: Manter a identidade visual existente
2. **Mobile-first**: Pensar nas limitações e affordances mobile
3. **Navegação touch-friendly**: Alvos de toque mínimos de 44x44px
4. **Performance**: Otimizar para conexões móveis

---

## 2. Estrutura de Layout Mobile

### 2.1 Navegação Principal

#### Opção A: Bottom Tab Navigation (Recomendado)
```
┌─────────────────────────────────────────┐
│              Status Bar                 │
├─────────────────────────────────────────┤
│                                         │
│           Conteúdo da Página           │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ [Home] [Transações] [+] [Metas] [Mais] │
└─────────────────────────────────────────┘
```

#### Especificações Bottom Nav
- **Altura**: 56px + safe area (iOS)
- **Ícones**: 24x24px
- **Labels**: text-xs
- **Tab ativo**: cor primária (#2563EB)
- **Tab inativo**: #8892A4
- **Ícone central (+)**: Elevated, 48x48px

#### Itens do Bottom Nav
1. **Dashboard** (LayoutDashboard icon) → /dashboard
2. **Transações** (ArrowLeftRight icon) → /transfers
3. **+** (Plus icon) → Modal de nova transação
4. **Metas** (Target icon) → /budgets
5. **Mais** (Menu icon) → Menu drawer

### 2.2 Estrutura de Página

```
┌─────────────────────────────────────────┐
│ ◀ Título da Página           [Ações] 📋│
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐│
│ │ Period Selector (horizontal scroll) ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │Saldo │ │Receita│ │Despesa│ │Var. %│   │
│ └──────┘ └──────┘ └──────┘ └──────┘   │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Gráfico de Evolução (compact)      ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Resumo por Categoria (horizontal)  ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Transações Recentes (list)         ││
│ │ • Item 1                            ││
│ │ • Item 2                            ││
│ │ • Item 3                            ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 2.3 Header Mobile

```
┌─────────────────────────────────────────┐
│ ◀              Título          [Avatar]│
├─────────────────────────────────────────┤
```

- **Altura**: 44px + status bar
- **Back button**: 44x44px touch target
- **Título**: text-lg font-semibold
- **Ação direita**: Avatar (32x32) ou ícone

---

## 3. Adaptações de Tipografia

### 3.1 Tamanhos Adaptados

| Elemento | Desktop (web) | Mobile | Recomendação |
|----------|---------------|--------|--------------|
| H1 | 24px | 20px | text-xl |
| H2 | 20px | 18px | text-lg |
| Body | 14px | 14px | text-sm |
| Caption | 12px | 12px | text-xs |
| Button | 14px | 14px | text-sm |

### 3.2 Escopo Mobile
- Reduzir H1 de text-2xl para text-xl
- Manter corpo em text-sm (leitura confortável)
- Labels podem usar text-xs para economia de espaço

---

## 4. Cores (Manter Consistência)

### 4.1 Paleta Mantida

Todas as cores do design system atual devem ser mantidas:

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | #2563EB | Ações principais |
| Primary Light | #3B82F6 | Hover states |
| Background | #0F1117 | Fundo app |
| Card | #1A2035 | Cards, superfícies |
| Foreground | #FFFFFF | Texto principal |
| Secondary | #8892A4 | Texto secundário |
| Success | #22C55E | Receitas |
| Danger | #EF4444 | Despesas, erros |
| Warning | #F59E0B | Alertas |
| Border | #1E2A40 | Bordas |

### 4.2 Ajustes Mobile
- **Transparências**: Reduzir uso de opacidades em backgrounds
- **Contraste**: Garantir WCAG AA em telas menores

---

## 5. Componentes Mobile

### 5.1 Bottom Sheet (替代 Modal)

Em mobile, prefira Bottom Sheet sobre Dialog:

```
┌─────────────────────────────────────────┐
│ ═══════ (drag indicator)               │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │  Título                  [X]        ││
│ └─────────────────────────────────────┘│
│                                         │
│  Form fields...                        │
│                                         │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ [Botão Primário - Full Width]      ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Especificações Bottom Sheet**:
- Border radius top: 16px
- Max height: 90vh
- Drag indicator: 32x4px, centered
- Background: #1A2035

### 5.2 Cards Mobile

```typescript
// Card紧凑型
className: 'rounded-xl border bg-card p-4'

// KPI Card (单列)
className: 'rounded-lg bg-card p-4 flex items-center gap-3'
// Icon | Label + Value stacked
```

### 5.3 Lists Mobile

```typescript
// Transaction list item
className: 'flex items-center justify-between py-3 border-b border-border'

// Swipe actions (左滑删除/编辑)
- Left swipe: Edit (blue)
- Right swipe: Delete (red)
```

### 5.4 Form Inputs Mobile

```typescript
// Input
className: 'h-11 text-base' // Larger touch target

// Labels
className: 'text-sm font-medium mb-1'

// Error text
className: 'text-xs text-danger mt-1'
```

**Ajustes**:
- Input height: 44px (h-11) para melhor touch
- Font size: text-base para evitar zoom em iOS
- Date picker: Native date input ou custom wheel picker
- Select: Native select ou custom bottom sheet

### 5.5 Buttons Mobile

```typescript
// Primary button (full width em mobile)
className: 'h-11 w-full rounded-lg bg-primary text-white'

// Secondary button
className: 'h-10 w-full rounded-lg border border-border'

// FAB (Floating Action Button)
className: 'fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary shadow-lg'
```

### 5.6 Charts Mobile

```typescript
// Gráfico compactado
- Altura: 200px (vs 280px desktop)
- Legenda: abaixo do gráfico
- Toque: tooltip ao tocar

// Donut chart
- Tamanho: 160x160px
- Centro: valor total
```

### 5.7 Period Selector Mobile

```typescript
// Horizontal scroll tabs
className: 'flex gap-2 overflow-x-auto pb-2 snap-x'

// Tab
className: 'flex-shrink-0 px-3 py-1.5 rounded-full text-xs snap-center'
// Active: bg-primary text-white
// Inactive: bg-card border border-border
```

---

## 6. Espaçamento Mobile

### 6.1 Grid e Gaps

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Page padding | 32px (p-8) | 16px (p-4) |
| Card padding | 24px (p-6) | 16px (p-4) |
| Gap entre cards | 16px (gap-4) | 12px (gap-3) |
| Gap entre seções | 24px (gap-6) | 20px (gap-5) |
| List item padding | 16px | 12px |

### 6.2 Touch Targets

```
// Mínimo: 44x44px
min-h-11 min-w-11

// Ideal para botões principais
h-12 (48px)
```

---

## 7. Navegação Específica

### 7.1 Drawer/Menu (Mais)

```
┌────────────────────────┐
│ ◀  Menu               │
├────────────────────────┤
│                        │
│  [Avatar] Nome         │
│  email@email.com       │
│                        │
├────────────────────────┤
│  📊 Dashboard          │
│  ↔️ Transferências     │
│  🔄 Recorrentes        │
│  🎯 Metas              │
├────────────────────────┤
│  💳 Investimentos     │
│  ⚙️ Configurações     │
├────────────────────────┤
│  🚪 Sair               │
└────────────────────────┘
```

### 7.2 Detalhes Transações

```
┌─────────────────────────────────────────┐
│ ◀  Detalhes da Transação                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Descrição Principal                 ││
│  │ R$ -150,00          15/03/2026      ││
│  │ Despesa • Alimentação              ││
│  └─────────────────────────────────────┘│
│                                         │
│  Categoria: Restaurantes                │
│  Método: Cartão de Crédito              │
│  Observação: Almoço de trabalho         │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ [Editar]              [Excluir]     ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 7.3 Adicionar Transação (FAB Flow)

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ + Nova Transação                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Receita] [Despesa]  ← Toggle        │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Descrição *                         ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌──────────┐ ┌────────────────────────┐ │
│  │ R$ 0,00  │ │ Data                  │ │
│  └──────────┘ └────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Categoria           ▼              ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Método              ▼              ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Cancelar]    [Salvar]                │
└─────────────────────────────────────────┘
```

---

## 8. Screenshots/Fluxos Mobile

### 8.1 Dashboard Mobile

```
┌─────────────────────────────────────────┐
│ FinanceApp                        [👤]  │
├─────────────────────────────────────────┤
│ Resumo Financeiro                       │
│ ┌─────────────────────────────────────┐│
│ │ Este Mês ▼                          ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐│
│ │Saldo │ │Receita│ │Despesa│ │Var. % ││
│ │R$ 5.2K│ │R$ 8.0K│ │R$ 2.8K│ │-15%   ││
│ └───────┘ └───────┘ └───────┘ └───────┘│
│                                         │
│ Evolução do Saldo                       │
│ ┌─────────────────────────────────────┐│
│ │     📈 Line Chart (200px)          ││
│ └─────────────────────────────────────┘│
│                                         │
│ Por Categoria                           │
│ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │🍔 45%│ │🚗 25%│ │🏠 20%│            │
│ └──────┘ └──────┘ └──────┘            │
│                                         │
│ Transações Recentes                Ver + │
│ ┌─────────────────────────────────────┐│
│ │ 🥗 Restaurante    -R$ 45,00  15/03 ││
│ ├─────────────────────────────────────┤│
│ │ 🚕 Uber            -R$ 22,90  14/03 ││
│ ├─────────────────────────────────────┤│
│ │ 💰 Salário       +R$ 5.000  14/03  ││
│ └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│ [🏠]  [↔️]  [+]  [🎯]  [≡]            │
└─────────────────────────────────────────┘
```

### 8.2 Lista de Transações Mobile

```
┌─────────────────────────────────────────┐
│ ◀  Transferências              [+]     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐│
│ │ 🔍 Buscar...                        ││
│ └─────────────────────────────────────┘│
│ ┌───────────┐ ┌───────────────────────┐│
│ │ Todos ▼   │ │ Este mês ▼            ││
│ └───────────┘ └───────────────────────┘│
│                                         │
│ HOJE                                    │
│ ┌─────────────────────────────────────┐│
│ │ 🥗 Restaurante        -R$ 45,00     ││
│ │    Almoço                     12:30 ││
│ └─────────────────────────────────────┘│
│ ┌─────────────────────────────────────┐│
│ │ 🚕 Uber                 -R$ 22,90   ││
│ │    Viagem                   14:15   ││
│ └─────────────────────────────────────┘│
│                                         │
│ ONTEM                                   │
│ ┌─────────────────────────────────────┐│
│ │ 💰 Salário             +R$ 5.000    ││
│ │    Janeiro                    ---   ││
│ └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│ [🏠]  [↔️]  [+]  [🎯]  [≡]            │
└─────────────────────────────────────────┘
```

---

## 9. Interações e Gestos

### 9.1 Gestos Suportados

| Gesto | Contexto | Ação |
|-------|----------|------|
| Tap | Item de lista | Abrir detalhe |
| Swipe Left | Item transação | Opções (edit/delete) |
| Pull Down | Listas | Refresh |
| Swipe Down | Bottom sheet | Fechar |
| Long Press | Cards | Menu de contexto |

### 9.2 Animações

```typescript
// Page transitions
- Slide from right (push)
- Slide to right (pop)
- Fade (modal open/close)

// Bottom sheet
- Slide up (spring animation)
- Backdrop fade in

// List items
- Fade in on load
- Staggered reveal

// Micro-interactions
- Button press: scale(0.98)
- Success: checkmark animation
- Error: shake animation
```

---

## 10. Responsividade e Breakpoints

### 10.1 Breakpoints Recomendados

| Dispositivo | Largura | Layout |
|-------------|---------|--------|
| Mobile Small | < 375px | Single column, smaller fonts |
| Mobile Standard | 375px - 414px | Baseline |
| Mobile Large | > 414px | Slightly larger touch targets |
| Tablet | 768px+ | Consider two-column layout |

### 10.2 Orientações

- **Portrait**: Layout default
- **Landscape**: Adaptar para usar largura extra (tabelas, charts)

---

## 11. Stack Técnica Sugerida

### 11.1 Opções de Framework

**Opção A: React Native (Recomendado)**
- Compartilha lógica com web
- Expo para desenvolvimento rápido
- Componentes nativos

**Opção B: Capacitor/Ionic**
- Wrapper web existente
- Build para iOS/Android
- Menos personalizado

**Opção C: Flutter**
- Performance nativa
- UI customizada
- Maior investimento inicial

### 11.2 Estrutura Sugerida (React Native)

```
mobile/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes base
│   │   ├── forms/      # Formulários
│   │   ├── charts/     # Gráficos
│   │   └── lists/      # Componentes de lista
│   ├── screens/
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── TransactionDetail/
│   │   ├── AddTransaction/
│   │   └── Settings/
│   ├── navigation/
│   │   ├── BottomTabs.tsx
│   │   ├── Stack.tsx
│   │   └── types.ts
│   ├── hooks/          # Custom hooks (compartilhados?)
│   ├── services/       # API calls
│   ├── store/          # State management
│   ├── theme/          # Cores, spacing, typography
│   └── utils/          # Funções utilitárias
├── assets/
└── App.tsx
```

### 11.3 Reutilização de Design System

Manter consistência extraindo tokens:

```typescript
// theme/tokens.ts (compartilhável)
export const colors = {
  primary: '#2563EB',
  background: '#0F1117',
  card: '#1A2035',
  // ...
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  // ...
}
```

---

## 12. Funcionalidades Mobile

### 12.1 Prioridades

#### Alta Prioridade
1. ✅ Dashboard com KPIs
2. ✅ Listar transações
3. ✅ Adicionar transação (receita/despesa)
4. ✅ Editar transação
5. ✅ Excluir transação
6. ✅ Categorias
7. ✅ Métodos de pagamento
8. ✅ Seletor de período

#### Média Prioridade
1. Transações recorrentes
2. Metas e orçamentos
3. Gráficos de evolução
4. Gráficos por categoria
5. Exportação de dados

#### Baixa Prioridade
1. Investimentos
2. Cartões
3. Configurações avançadas
4. Notificações push

---

## 13. Comparativo: Web vs Mobile

### 13.1 Componentes Adaptados

| Web (Atual) | Mobile (Proposto) | Notas |
|-------------|-------------------|-------|
| Sidebar (240px) | Bottom Tabs (56px) | Navegação mais acessível |
| PageWrapper (p-8) | Screen (p-4) | Menos padding |
| Dialog (centered modal) | Bottom Sheet | Melhor ergonomia |
| Table (scrollable) | List (cards) | Layout mobile |
| Cards (p-6) | Cards (p-4) | Compacto |
| Grid 4-col | Grid 2-col ou scroll | Adaptação |
| Input (h-9) | Input (h-11) | Touch target |
| Period tabs | Horizontal scroll tabs | Mobile pattern |

### 13.2 Elementos Removidos em Mobile
- Tooltips (substituir por labels)
- Hover states (não existe)
- Drag-and-drop (manter apenas onde intuitivo)
- Multi-select avançado

---

## 14. Próximos Passos

1. **Definição de Stack**: Escolher React Native vs outra opção
2. **Extração de Design Tokens**: Criar package compartilhado
3. **Setup de Projeto**: Criar projeto base com estrutura
4. **Componentes Base**: Implementar Button, Input, Card, etc.
5. **Navegação**: Configurar Bottom Tabs + Stack
6. **Telas**: Implementar uma a uma
7. **Integração**: Conectar com API existente

---

## 15. Observações

### 15.1 API Existente
O app mobile deve consumir a mesma API REST que o web:
- Endpoints já implementados em `/web/src/services/`
- Autenticação por token (manter)
- React Query para cache e sync

### 15.2 Considerações de Performance
- Lazy loading de listas
- Imagens em baixa resolução inicial
- Cache local (AsyncStorage/MMKV)
- Otimizar bundle size

### 15.3 Testes
- Testes em dispositivos reais
- Testes de performance (RN Performance)
- Testes de usabilidade

---

*Documento de proposta para desenvolvimento mobile.*
*Baseado no system design atual do FinanceApp Web.*
*Data: 2026-03-15*
