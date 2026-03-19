# System Design Atual - FinanceApp Web

## 1. Estrutura Geral

### 1.1 Tipo de Interface
- **Plataforma**: Web application
- **Modo**: Desktop-first (não responsivo para mobile)
- **Frameworks**: React 18 + TypeScript + Tailwind CSS + Radix UI

### 1.2 Layout Principal

#### Página Autenticada
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (240px)  │  Main Content (ml-60, p-8)        │
│                  │                                       │
│ ┌─────────────┐  │  ┌─────────────────────────────────┐│
│ │ Logo        │  │  │ Page Header + Actions          ││
│ └─────────────┘  │  └─────────────────────────────────┘│
│                  │  ┌─────────────────────────────────┐│
│ [Dashboard]     │  │ Period Selector (tabs)         ││
│ [Transferencias] │  └─────────────────────────────────┘│
│ [Recorrentes]    │  ┌─────────────────────────────────┐│
│ [Metas/Orçamento]│  │ KPI Cards Grid (1-4 cols)     ││
│ [Investimentos]  │  └─────────────────────────────────┘│
│ [Cartoes]        │  ┌─────────────────────────────────┐│
│ [Configuracoes]  │  │ Charts Section (2fr/1fr)      ││
│                  │  └─────────────────────────────────┘│
│                  │  ┌─────────────────────────────────┐│
│ ┌─────────────┐  │  │ Latest Transactions / Table    ││
│ │ User Info   │  │  └─────────────────────────────────┘│
│ │ [Logout]    │  │                                     │
│ └─────────────┘  │                                     │
└─────────────────────────────────────────────────────────┘
```

#### Página Pública (Login/Register)
```
┌─────────────────────────────────────────────┐
│           Centered Card (max-w-md)         │
│  ┌───────────────────────────────────────┐ │
│  │ Logo + Title                          │ │
│  │ Form Fields                          │ │
│  │ [Submit Button]                      │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 1.3 Divisão de Seções
- **Header**: Logo + Navegação (público) ou User dropdown (autenticado)
- **Sidebar**: Navegação principal fixa (240px width)
- **Main Content**: Margem left de 240px, padding de 2rem (32px)
- **Container**: max-w-2xl (1400px), centralizado

---

## 2. Tipografia

### 2.1 Família de Fontes
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 2.2 Hierarquia de Tamanhos

| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| H1 (Page Title) | text-2xl (24px) | font-bold (700) | foreground (#FFF) |
| H2 (Section Title) | text-xl (20px) | font-bold (700) | foreground (#FFF) |
| Card Title | text-2xl (24px) | font-semibold (600) | foreground (#FFF) |
| Card Title Small | text-base (16px) | - | foreground |
| Body | text-sm (14px) | font-medium (500) | secondary (#8892A4) |
| Label | text-sm (14px) | font-medium (500) | foreground |
| Small/Caption | text-xs (12px) | - | secondary (#8892A4) |
| Button | text-sm (14px) | font-medium (500) | - |

### 2.3 Pesos Utilizados
- **font-normal**: 400
- **font-medium**: 500
- **font-semibold**: 600
- **font-bold**: 700

---

## 3. Cores e Paleta

### 3.1 Definições CSS (index.css)

```css
:root {
  /* Backgrounds */
  --background: 231 30% 5%;      /* #0F1117 */
  --sidebar: 223 26% 10%;        /* #161B27 */
  --card: 224 26% 14%;           /* #1A2035 */
  
  /* Text */
  --foreground: 0 0% 100%;        /* #FFFFFF */
  --secondary: 220 11% 53%;       /* #8892A4 */
  --muted: 220 11% 53%;           /* #8892A4 */
  
  /* Primary */
  --primary: 217 91% 53%;        /* #2563EB */
  --primary-foreground: 0 0% 100%;
  --primary-hover: 217 70% 60%;   /* #3B82F6 */
  
  /* Semantic */
  --success: 142 71% 45%;         /* #22C55E */
  --danger: 0 84% 60%;            /* #EF4444 */
  --warning: 38 92% 50%;         /* #F59E0B */
  
  /* UI Elements */
  --secondary: 220 15% 35%;       /* #1E2A40 */
  --accent: 217 91% 53%;          /* #2563EB */
  --popover: 224 26% 14%;        /* #1A2035 */
  --border: 220 29% 16%;         /* #1E2A40 */
  --input: 220 22% 19%;          /* #1A2035 */
  --ring: 217 91% 53%;
  
  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  
  /* Radius */
  --radius: 0.75rem;
}
```

### 3.2 Paleta de Cores

| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
| **Primary** | #2563EB | 217 91% 53% | Botões principais, links, elementos ativos |
| **Primary Light** | #3B82F6 | 217 70% 60% | Hover states |
| **Background** | #0F1117 | 231 30% 5% | Fundo geral |
| **Sidebar** | #161B27 | 223 26% 10% | Fundo da sidebar |
| **Card** | #1A2035 | 224 26% 14% | Cards, modais, tabelas |
| **Foreground** | #FFFFFF | 0 0% 100% | Texto principal |
| **Secondary** | #8892A4 | 220 11% 53% | Texto secundário, placeholders |
| **Border** | #1E2A40 | 220 29% 16% | Bordas de elementos |
| **Border Light** | #2A3550 | - | Bordas alternativas |
| **Success** | #22C55E | 142 71% 45% | Receitas, valores positivos |
| **Danger** | #EF4444 | 0 84% 60% | Despesas, erros, ações destrutivas |
| **Warning** | #F59E0B | 38 92% 50% | Alertas, avisos |

### 3.3 Cores com Opacidade

| Nome | Valor |
|------|-------|
| bg-success/20 | rgba(34, 197, 94, 0.2) |
| bg-danger/20 | rgba(239, 68, 68, 0.2) |
| bg-warning/20 | rgba(245, 158, 11, 0.2) |

---

## 4. Componentes de UI

### 4.1 Button

#### Variantes (button-variants.ts)
```typescript
variants: {
  variant: {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  size: {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  }
}
```

#### Estados
- **Default**: bg-primary, texto branco
- **Hover**: bg-primary/90 (10% mais transparente)
- **Disabled**: opacity-50, cursor-not-allowed
- **Loading**: spinner animation + texto desabilitado

### 4.2 Input

```typescript
// Estrutura base
className: `
  flex bg-transparent 
  disabled:opacity-50 
  shadow-sm px-3 py-1 
  border border-input rounded-md 
  focus-visible:outline-none 
  focus-visible:ring-1 focus-visible:ring-ring 
  w-full h-9 
  placeholder:text-muted-foreground 
  md:text-sm text-base 
  transition-colors 
  disabled:cursor-not-allowed
`
```

#### Propriedades
- **Height**: h-9 (36px)
- **Border**: border-input (#1A2035)
- **Border Radius**: rounded-md
- **Focus Ring**: ring-primary (#2563EB)

### 4.3 Card

```typescript
// Card base
className: 'rounded-xl border bg-card text-card-foreground shadow'

// CardHeader
'flex flex-col space-y-1.5 p-6'

// CardTitle
'text-2xl font-semibold leading-none tracking-tight'

// CardDescription  
'text-sm text-muted-foreground'

// CardContent
'p-6 pt-0'

// CardFooter
'flex items-center p-6 pt-0'
```

### 4.4 Dialog (Modal)

```typescript
// Overlay
'fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out'

// Content
'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-card p-6 shadow-lg duration-200'

// Close button
'absolute right-4 top-4 rounded-sm text-secondary opacity-80 transition-opacity hover:opacity-100'
```

### 4.5 Select

```typescript
// Trigger
'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

// Content
'relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md'

// Item
'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground'
```

### 4.6 Checkbox

```typescript
'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground'
```

### 4.7 Sidebar

```typescript
// Container
'fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-border bg-sidebar'

// Logo section
'border-b border-border p-6'

// Nav items
'flex items-center gap-3 rounded-lg px-4 py-3 transition-all'

// Active state
'bg-primary text-white'

// Inactive state
'text-secondary hover:bg-muted hover:text-foreground'

// Locked item
'cursor-not-allowed opacity-60'

// User section
'border-t border-border p-4'
```

### 4.8 Tables

```typescript
// Table container
'overflow-x-auto'

// Table
'w-full min-w-[760px] text-sm'

// Header
'border-border border-b text-secondary text-xs text-left uppercase tracking-wide'

// Row
'border-border/60 border-b last:border-b-0'

// Cell
'px-3 py-4'
```

### 4.9 Tags/Chips (Category)

```typescript
// Category badge
'inline-flex items-center gap-2 px-2 py-1 rounded-md font-medium text-xs'
style={{ 
  backgroundColor: `${category.color}22`, 
  color: category.color 
}}
```

---

## 5. Espaçamento e Dimensões

### 5.1 Espaçamentos (Tailwind)

| Token | Valor | Uso |
|-------|-------|-----|
| p-1 | 4px | Ícones internos |
| p-2 | 8px | Espaçamento interno pequeno |
| p-4 | 16px | Padding de cards, gaps |
| p-5 | 20px | KPI Cards |
| p-6 | 24px | Card content, dialogs |
| p-8 | 32px | Page wrapper |
| gap-2 | 8px | Entre elementos inline |
| gap-4 | 16px | Entre elementos em grid |
| gap-6 | 24px | Entre seções |

### 5.2 Dimensões Fixas

| Componente | Largura | Altura |
|------------|---------|--------|
| Sidebar | w-60 (240px) | h-screen |
| Logo Icon | h-10 w-10 (40px) | - |
| User Avatar | h-10 w-10 (40px) | - |
| Button Default | h-9 (36px) | - |
| Button Small | h-8 (32px) | - |
| Button Large | h-10 (40px) | - |
| Input | h-9 (36px) | - |
| Checkbox | h-4 w-4 (16px) | - |

### 5.3 Border Radius

| Token | Valor |
|-------|-------|
| rounded-sm | calc(var(--radius) - 4px) |
| rounded-md | calc(var(--radius) - 2px) |
| rounded-lg | var(--radius) = 0.75rem (12px) |
| rounded-xl | 0.75rem (12px) |
| rounded-full | 9999px |

---

## 6. Efeitos Visuais

### 6.1 Sombras

```css
/* Card Shadow */
shadow-card: '0 4px 20px rgba(0,0,0,0.3)'

/* CTA Shadow */
shadow-cta: '0 4px 14px rgba(37,99,235,0.4)'

/* Dropdown/Modal Shadow */
shadow-lg / shadow-md
```

### 6.2 Bordas

```css
/* Default border */
border: 1px solid #1E2A40

/* Border lighter */
border-app-border-light: #2A3550
```

### 6.3 Animações

```css
/* Accordion */
'accordion-down': accordion-down 0.2s ease-out
'accentuate-up': accordion-up 0.2s ease-out

/* Toast */
data-[state=open]:animate-in
data-[state=closed]:animate-out
data-[state=closed]:fade-out-0
data-[state=open]:fade-in-0
data-[state=closed]:zoom-out-95
data-[state=open]:zoom-in-95

/* Spinner */
animate-spin (CSS default)
```

### 6.4 Overlays

```css
/* Modal backdrop */
bg-black/70

/* Toast viewport */
fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 
sm:bottom-0 sm:right-0 sm:top-auto md:max-w-[420px]
```

---

## 7. Componentes Específicos do Domínio

### 7.1 KPI Cards (Dashboard)

```typescript
// Grid layout
'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'

// Card content
'p-5'

// Icon container
'text-primary-light'

// Change indicator
'isPositive ? text-success : text-danger'

// Value
'text-2xl font-bold text-foreground'
```

### 7.2 Period Selector

```typescript
// Container
'flex flex-wrap gap-2'

// Tab buttons
variant={activePeriod === key ? 'default' : 'outline'}
'bg-primary text-white' : 'border-border text-secondary'

// Month navigation (specific period)
'flex items-center gap-1 ml-2'
```

### 7.3 Transaction Table

- Min-width: 760px (scrollable)
- Columns: Data, Descrição, Categoria, Método, Valor, Ações
- Row hover: subtle highlight
- Actions: Edit (outline), Delete (destructive)

### 7.4 Charts Section

```typescript
// Grid
'grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]'

// Balance chart (main)
flex: 2fr

// Category donut chart (sidebar)
flex: 1fr
```

---

## 8. Responsividade

### 8.1 Breakpoints Ativos

| Breakpoint | Largura | Comportamento |
|------------|---------|---------------|
| sm | 640px | - |
| md | 768px | Grid 2 colunas, sidebar visible |
| xl | 1024px | - |
| 2xl | 1400px | Container max-width |

### 8.2 Limitações Atuais
- ** NÃO existe design mobile dedicado**
- Sidebar NÃO colapsa em mobile
- Tabelas têm scroll horizontal
- Grid de KPIs permanece em múltiplas colunas

---

## 9. Stack Técnica

### 9.1 Dependências Principais
- **React**: 18.x
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.x
- **Radix UI**: @radix-ui/react-*
- **React Router**: 6.x
- **React Query**: @tanstack/react-query
- **Lucide React**: Ícones
- **React Hook Form**: Formulários
- **Zod**: Validação
- **Date-fns**: Datas
- **Recharts**: Gráficos

### 9.2 Estrutura de Pastas
```
src/
├── components/
│   ├── charts/         # Gráficos (BalanceLineChart, CategoryDonutChart)
│   ├── dashboard/       # Componentes do dashboard
│   ├── kpi/            # KpiCard
│   ├── layout/         # Sidebar, Header, PageWrapper
│   ├── routing/        # Routes, ProtectedRoute, ErrorBoundary
│   └── ui/             # Componentes base (Button, Input, Card, etc.)
├── hooks/              # Custom hooks
├── pages/              # Páginas principais
│   └── components/     # Modais específicos de página
├── services/           # API services
├── store/              # Zustand stores
├── types/              # TypeScript types
└── utils/              # Funções utilitárias
```

---

## 10. Página de Autenticação (Login)

### 10.1 Layout
- Full viewport height (min-h-screen)
- Centered card (max-w-md)
- Background: bg-background (#0F1117)

### 10.2 Card
- bg-card (#1A2035)
- shadow-lg
- rounded-xl
- padding: p-8 (32px)

### 10.3 Form
- Title: text-2xl font-bold
- Subtitle: text-sm text-secondary
- Labels: text-foreground
- Inputs: bg-background border-border text-foreground
- Password toggle: Eye/EyeOff icons
- Checkbox: custom with label
- Submit: w-full bg-primary

---

## 11. Inconsistências e Observações

### 11.1 Itens Bloqueados na Sidebar
- Investimentos (locked: true)
- Cartões (locked: true)
- Configurações (locked: true)
- Exibidos com ícone Lock e opacity-60

### 11.2 Empty States
- Transaction table: "Nenhuma transação encontrada"
- Cards: Skeleton loading states

### 11.3 Error States
- Cards com erro: border-danger/40, bg-danger/5
- Retry button em cada seção

### 11.4 Paginação
- 10 items por página
- Controls: Anterior/Próxima
- Info: "Página X de Y - Z registros"

---

*Documento gerado automaticamente a partir da análise do código-fonte.*
*Data: 2026-03-15*
