# FinanceApp Mobile — Plano de Implementação

> Baseado no `SYSTEM_DESIGN_ATUAL.md` e `SYSTEM_DESIGN_MOBILE.md`.  
> Data: 2026-03-15 | Status: Planejamento

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura e Estrutura de Pastas](#3-arquitetura-e-estrutura-de-pastas)
4. [Design System & Tokens](#4-design-system--tokens)
5. [Navegação](#5-navegação)
6. [Componentes Base (UI)](#6-componentes-base-ui)
7. [Telas — Escopo e Prioridade](#7-telas--escopo-e-prioridade)
8. [Integração com a API](#8-integração-com-a-api)
9. [Gestos e Interações](#9-gestos-e-interações)
10. [Performance e Cache](#10-performance-e-cache)
11. [Testes](#11-testes)
12. [Roadmap de Implementação](#12-roadmap-de-implementação)
13. [Decisões e Trade-offs](#13-decisões-e-trade-offs)

---

## 1. Visão Geral

O FinanceApp é atualmente uma aplicação **web desktop-first** (React 18 + TypeScript + Tailwind + Radix UI) sem suporte mobile dedicado. A sidebar fixa de 240px, as tabelas com scroll horizontal e os grids multi-coluna tornam a experiência em celular inviável.

Este plano define como construir um app mobile nativo (iOS + Android) que:

- Compartilha **toda a lógica de negócio** (services, hooks, stores, types, validação) com o projeto web
- Mantém **100% de consistência visual** via design tokens extraídos do sistema existente
- Consome a **mesma API REST** sem modificações no backend
- Entrega as funcionalidades core em ciclos curtos e priorizados

---

## 2. Stack Tecnológica

### 2.1 Framework: React Native + Expo (SDK 52+)

**Justificativa:** O web já usa React 18 + TypeScript + React Query + Zustand + Zod + React Hook Form. React Native com Expo permite reaproveitar diretamente esses packages sem nenhum wrapper, minimizando o delta de conhecimento e a duplicação de código.

| Camada | Web (atual) | Mobile (proposto) | Reaproveitável? |
|---|---|---|---|
| Linguagem | TypeScript | TypeScript | ✅ 100% |
| UI | React + Tailwind | React Native + StyleSheet/NativeWind | ⚠️ Lógica sim, JSX não |
| Roteamento | React Router 6 | Expo Router (file-based) | ⚠️ Estrutura similar |
| Data Fetching | TanStack Query | TanStack Query | ✅ 100% |
| Estado global | Zustand | Zustand | ✅ 100% |
| Forms | React Hook Form + Zod | React Hook Form + Zod | ✅ 100% |
| Datas | date-fns | date-fns | ✅ 100% |
| Gráficos | Recharts | Victory Native / Skia | ❌ Substituir |
| Ícones | Lucide React | Lucide React Native | ✅ mesma API |
| Componentes UI | Radix UI | React Native primitives | ❌ Substituir |

### 2.2 Dependências Principais

```bash
# Core
expo@~52.0.0
react-native@0.76.x
typescript@5.x

# Navegação
expo-router@4.x

# Estilização
nativewind@4.x          # Tailwind syntax para RN
tailwindcss@3.x

# Data & State (reutilizados do web)
@tanstack/react-query@5.x
zustand@5.x
react-hook-form@7.x
zod@3.x
date-fns@3.x

# Gráficos nativos
victory-native@41.x
@shopify/react-native-skia

# Gestos & Animações
react-native-reanimated@3.x
react-native-gesture-handler@2.x

# UX Mobile
@gorhom/bottom-sheet@5.x      # Bottom sheets
react-native-safe-area-context
expo-haptics                   # Feedback tátil
expo-notifications             # Push notifications (fase 2)

# Persistência local
@react-native-async-storage/async-storage
react-native-mmkv              # Cache performático

# Autenticação
expo-secure-store              # Tokens JWT seguros

# Utilitários
expo-constants
expo-status-bar
react-native-svg
```

### 2.3 Ferramentas de Desenvolvimento

```bash
# Build & Deploy
eas-cli                 # Expo Application Services
# iOS: Xcode 16+
# Android: Android Studio Ladybug+

# Qualidade
eslint + prettier       # Reutilizar config do web
jest + @testing-library/react-native
detox                   # E2E em dispositivos reais

# Monorepo (recomendado)
turborepo ou nx         # Para compartilhar packages entre web e mobile
```

---

## 3. Arquitetura e Estrutura de Pastas

### 3.1 Estrutura de Monorepo (Recomendada)

```
financeapp/
├── apps/
│   ├── web/                    # Projeto React existente (sem alterações)
│   └── mobile/                 # Novo projeto Expo
├── packages/
│   ├── core/                   # ← Código compartilhado
│   │   ├── services/           # API calls (axios/fetch)
│   │   ├── hooks/              # useTransactions, useDashboard, etc.
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript interfaces/types
│   │   ├── utils/              # Formatações, helpers
│   │   ├── validators/         # Schemas Zod
│   │   └── constants/          # Enums, configs
│   └── design-tokens/          # ← Tokens extraídos do web
│       ├── colors.ts
│       ├── spacing.ts
│       ├── typography.ts
│       └── index.ts
├── package.json                # Workspace root
└── turbo.json
```

### 3.2 Estrutura Interna do App Mobile

```
apps/mobile/
├── app/                        # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom Tab Navigator
│   │   ├── index.tsx           # Dashboard
│   │   ├── transactions.tsx    # Lista de transações
│   │   ├── budgets.tsx         # Metas/Orçamentos
│   │   └── more.tsx            # Menu drawer
│   └── _layout.tsx             # Root layout (auth guard)
│
├── components/
│   ├── ui/                     # Componentes base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Skeleton.tsx
│   ├── forms/
│   │   ├── TransactionForm.tsx
│   │   └── FilterForm.tsx
│   ├── charts/
│   │   ├── BalanceLineChart.tsx
│   │   └── CategoryDonutChart.tsx
│   ├── lists/
│   │   ├── TransactionListItem.tsx
│   │   └── TransactionList.tsx
│   ├── sheets/                 # Bottom Sheets
│   │   ├── AddTransactionSheet.tsx
│   │   ├── TransactionDetailSheet.tsx
│   │   └── FilterSheet.tsx
│   └── layout/
│       ├── ScreenHeader.tsx
│       └── SafeScrollView.tsx
│
├── theme/
│   ├── index.ts                # Re-exports de @financeapp/design-tokens
│   └── styles.ts               # StyleSheet utilitários
│
├── navigation/
│   └── types.ts                # Tipagem das rotas
│
└── assets/
    ├── images/
    └── fonts/
```

---

## 4. Design System & Tokens

### 4.1 Extração dos Tokens do Web

Criar o package `@financeapp/design-tokens` extraindo os valores do `index.css` atual:

```typescript
// packages/design-tokens/colors.ts
export const colors = {
  // Backgrounds
  background:   '#0F1117',
  sidebar:      '#161B27',
  card:         '#1A2035',

  // Text
  foreground:   '#FFFFFF',
  secondary:    '#8892A4',
  muted:        '#8892A4',

  // Primary
  primary:      '#2563EB',
  primaryLight: '#3B82F6',

  // Semantic
  success:      '#22C55E',
  danger:       '#EF4444',
  warning:      '#F59E0B',

  // UI
  border:       '#1E2A40',
  borderLight:  '#2A3550',
  input:        '#1A2035',
  popover:      '#1A2035',

  // Opacities (util)
  successBg:    'rgba(34, 197, 94, 0.2)',
  dangerBg:     'rgba(239, 68, 68, 0.2)',
  warningBg:    'rgba(245, 158, 11, 0.2)',
} as const;

// packages/design-tokens/spacing.ts
export const spacing = {
  xs:   4,    // p-1
  sm:   8,    // p-2
  md:   16,   // p-4
  lg:   20,   // p-5
  xl:   24,   // p-6
  xxl:  32,   // p-8

  // Mobile-specific
  pagePadding:      16,   // vs 32 no web
  cardPadding:      16,   // vs 24 no web
  sectionGap:       20,   // vs 24 no web
  listItemPadding:  12,
} as const;

// packages/design-tokens/typography.ts
export const typography = {
  fontFamily: 'Inter',

  // Tamanhos adaptados para mobile
  h1:      { fontSize: 20, fontWeight: '700' },  // vs 24px web
  h2:      { fontSize: 18, fontWeight: '700' },  // vs 20px web
  body:    { fontSize: 14, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '400' },
  button:  { fontSize: 14, fontWeight: '500' },
  label:   { fontSize: 14, fontWeight: '500' },
  small:   { fontSize: 12, fontWeight: '400' },
} as const;

// packages/design-tokens/radius.ts
export const radius = {
  sm:   8,
  md:   10,
  lg:   12,
  xl:   16,
  full: 9999,
} as const;
```

### 4.2 Touch Targets

Todos os elementos interativos devem respeitar o mínimo de **44×44px** (Apple HIG / Material Design):

```typescript
// theme/styles.ts
import { spacing } from '@financeapp/design-tokens';

export const touchTarget = {
  minHeight: 44,
  minWidth: 44,
};

export const buttonSizes = {
  sm:      { height: 40, paddingHorizontal: 12 },
  default: { height: 44, paddingHorizontal: 16 },
  lg:      { height: 48, paddingHorizontal: 24 },
  icon:    { height: 44, width: 44 },
};
```

---

## 5. Navegação

### 5.1 Estrutura de Navegação

```
Root Navigator (Expo Router)
├── (auth)                      # Sem autenticação
│   ├── /login
│   └── /register
└── (tabs)                      # Com autenticação
    ├── / (Dashboard)
    ├── /transactions
    │   └── /transactions/[id]  # Detalhe via Stack
    ├── /budgets
    └── /more
        ├── /recurring
        └── /settings
```

### 5.2 Bottom Tab Navigator

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { colors } from '@financeapp/design-tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.sidebar,
          borderTopColor: colors.border,
          height: 56 + safeAreaInsets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index"        options={{ title: 'Dashboard',    tabBarIcon: ... }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transações',   tabBarIcon: ... }} />
      <Tabs.Screen name="add"          options={{ title: '',             tabBarIcon: /* FAB */ }} />
      <Tabs.Screen name="budgets"      options={{ title: 'Metas',        tabBarIcon: ... }} />
      <Tabs.Screen name="more"         options={{ title: 'Mais',         tabBarIcon: ... }} />
    </Tabs>
  );
}
```

O botão central **"+"** deve ser elevado (estilo FAB), com sombra e cor primária, abrindo um Bottom Sheet de nova transação.

### 5.3 Proteção de Rotas

```typescript
// app/_layout.tsx
import { useAuthStore } from '@financeapp/core/stores';
import { Redirect, Stack } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <SplashScreen />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return <Stack />;
}
```

---

## 6. Componentes Base (UI)

A estratégia é construir componentes com API idêntica aos do web onde possível, mas com implementação nativa.

### 6.1 Button

```typescript
// components/ui/Button.tsx
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}
```

Estados: default, hover (pressIn scale 0.98 via Reanimated), disabled (opacity 0.5), loading (ActivityIndicator).

### 6.2 Input

```typescript
// components/ui/Input.tsx
// height: 44px (h-11) para melhor touch target
// fontSize: 16px para evitar zoom automático no iOS
// Estilo de foco com ring primário
```

### 6.3 Card

Implementação com `View` seguindo o mesmo padrão de `rounded-xl`, `bg-card`, `border`.

### 6.4 Bottom Sheet (substitui Dialog)

```typescript
// components/sheets/AddTransactionSheet.tsx
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

// Especificações:
// - snapPoints: ['50%', '90%']
// - borderTopRadius: 16px
// - dragIndicator: 32x4px centralizado
// - backdrop: opacity 0.7 com fade
// - background: colors.card (#1A2035)
```

### 6.5 Transaction List Item

```typescript
// components/lists/TransactionListItem.tsx
// - Swipe left: ações Editar (azul) / Excluir (vermelho)
//   via react-native-gesture-handler + Reanimated
// - Tap: abre bottom sheet de detalhe
// - Layout: ícone categoria | descrição + subcategoria | valor + horário
```

### 6.6 KPI Card (Mobile)

```typescript
// Layout: ícone à esquerda | label + valor empilhados à direita
// Grid: 2 colunas (vs 4 no web)
// Padding: 16px (vs 20px no web)
// Indicador de variação: texto colorido (success/danger)
```

### 6.7 Period Selector Mobile

```typescript
// Scroll horizontal com snap
// Tabs como pills: bg-primary (ativo) / bg-card border-border (inativo)
// HorizontalScrollView com showsHorizontalScrollIndicator={false}
// snapToInterval para alinhamento
```

---

## 7. Telas — Escopo e Prioridade

### 7.1 Alta Prioridade (MVP — Fase 1)

#### Dashboard (`/`)
- Header: logo + avatar do usuário
- Period Selector (scroll horizontal)
- KPI Cards (grid 2×2): Saldo, Receita, Despesa, Variação
- Gráfico de linha: evolução do saldo (altura 200px)
- Resumo por categoria (scroll horizontal de chips)
- Lista de transações recentes (últimas 5) + "Ver todas"

#### Transações (`/transactions`)
- Search bar no topo
- Filtros: categoria (dropdown) + período (dropdown)
- Lista agrupada por data (Hoje, Ontem, data específica)
- Swipe para editar/excluir
- Pull-to-refresh
- Paginação infinita (FlatList + onEndReached)

#### Detalhe de Transação (Bottom Sheet ou `/transactions/[id]`)
- Todos os campos: data, descrição, categoria, valor, método, recorrente
- Botões Editar / Excluir em largura total

#### Adicionar/Editar Transação (Bottom Sheet)
- Toggle Receita / Despesa
- Campos: Valor, Descrição, Categoria (picker), Método, Data, Recorrente (toggle)
- Validação em tempo real via Zod + React Hook Form
- Botão salvar em largura total, fixo no bottom

#### Autenticação
- Login: email + senha + "lembrar de mim"
- Register: nome + email + senha
- Mesma lógica de validação do web

### 7.2 Média Prioridade (Fase 2)

- **Metas e Orçamentos** (`/budgets`): cards por categoria com barra de progresso
- **Transações Recorrentes** (`/more/recurring`): lista + formulário
- **Gráfico por categoria** (Donut Chart — 160×160px)
- **Exportação de dados** (CSV via Share API do Expo)

### 7.3 Baixa Prioridade (Fase 3)

- Investimentos
- Cartões
- Configurações (perfil, senha, preferências)
- Notificações push (alertas de orçamento)

---

## 8. Integração com a API

### 8.1 Reutilização dos Services

Os arquivos em `packages/core/services/` (atualmente `web/src/services/`) devem ser extraídos para o monorepo e consumidos por ambas as plataformas sem modificação:

```typescript
// packages/core/services/transactions.ts
import { apiClient } from './client'; // axios instance

export const transactionsService = {
  getAll: (params: TransactionFilters) => apiClient.get('/transactions', { params }),
  create: (data: CreateTransactionDTO) => apiClient.post('/transactions', data),
  update: (id: string, data: UpdateTransactionDTO) => apiClient.put(`/transactions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/transactions/${id}`),
};
```

### 8.2 Autenticação com Secure Store

```typescript
// No web: localStorage para token JWT
// No mobile: expo-secure-store (keychain no iOS, keystore no Android)

import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  get: () => SecureStore.getItemAsync('auth_token'),
  set: (token: string) => SecureStore.setItemAsync('auth_token', token),
  delete: () => SecureStore.deleteItemAsync('auth_token'),
};
```

O interceptor do axios deve usar `tokenStorage` em vez de `localStorage`:

```typescript
// packages/core/services/client.ts
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get(); // isomórfico via injeção de dependência
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 8.3 React Query (reutilizado do web)

```typescript
// packages/core/hooks/useTransactions.ts
// Mesmos hooks do web — zero alteração necessária
export const useTransactions = (filters: TransactionFilters) =>
  useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 min
  });
```

### 8.4 Tratamento de Erros de Rede

Mobile exige tratamento especial para conectividade:

```typescript
import NetInfo from '@react-native-community/netinfo';

// Pausar queries quando offline
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst', // usa cache quando sem internet
      retry: (failureCount, error) => {
        if (error.status === 401) return false; // não tentar re-autenticar
        return failureCount < 3;
      },
    },
  },
});
```

---

## 9. Gestos e Interações

### 9.1 Gestos Implementados

| Gesto | Contexto | Ação | Implementação |
|---|---|---|---|
| Tap | Item de lista | Abrir Bottom Sheet de detalhe | TouchableOpacity / Pressable |
| Swipe Left | Item de transação | Revelar ações Editar/Excluir | Reanimated + Gesture Handler |
| Pull Down | Listas / ScrollView | Refresh dos dados | RefreshControl |
| Swipe Down | Bottom Sheet | Fechar sheet | @gorhom/bottom-sheet built-in |
| Long Press | KPI Cards | Menu de contexto | LongPress gesture |
| Tap no "+" | Bottom Nav | Abrir Add Transaction Sheet | Expo Router modal |

### 9.2 Animações

```typescript
// Page transitions: Expo Router built-in (slide from right)
// Bottom Sheet: spring animation (tension: 500, friction: 35)
// List items: FadeIn com stagger via Reanimated
// Botão press: scale(0.97) com spring
// Feedback de sucesso: checkmark + haptic (Expo Haptics)
// Feedback de erro: shake animation + haptic de erro
```

### 9.3 Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// Ação destrutiva (deletar)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Sucesso (salvar transação)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Tap simples
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

---

## 10. Performance e Cache

### 10.1 Estratégia de Cache

```typescript
// MMKV para cache persistente de alta performance
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'financeapp-cache' });

// React Query persisted cache
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
});

// Dados do dashboard ficam disponíveis offline
persistQueryClient({ queryClient, persister, maxAge: 1000 * 60 * 60 * 24 }); // 24h
```

### 10.2 Listas Otimizadas

```typescript
// FlatList com otimizações para grandes volumes
<FlatList
  data={transactions}
  keyExtractor={(item) => item.id}
  renderItem={renderTransactionItem}
  getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  onEndReached={fetchNextPage}
  onEndReachedThreshold={0.5}
  refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
/>
```

### 10.3 Imagens e Assets

- Ícones: Lucide React Native (SVG, sem bundle extra)
- Fontes: `expo-font` com `Inter` carregada no splash
- Splash screen: `expo-splash-screen` com `preventAutoHide` até dados carregarem

### 10.4 Bundle

```javascript
// app.json — otimizações de build
{
  "expo": {
    "experiments": { "tsconfigPaths": true },
    "jsEngine": "hermes",  // Hermes para melhor performance
    "android": { "enableProguardInReleaseBuilds": true }
  }
}
```

---

## 11. Testes

### 11.1 Unitários e de Componente

```bash
# Mesma configuração do web para hooks e utils
jest --config jest.config.ts

# Componentes
@testing-library/react-native
```

### 11.2 E2E com Detox

```typescript
// e2e/flows/add-transaction.test.ts
describe('Adicionar Transação', () => {
  it('deve adicionar uma despesa e exibir no dashboard', async () => {
    await element(by.id('fab-add')).tap();
    await element(by.id('input-value')).typeText('45.90');
    await element(by.id('input-description')).typeText('Almoço');
    // ...
    await element(by.id('btn-save')).tap();
    await expect(element(by.text('Almoço'))).toBeVisible();
  });
});
```

### 11.3 Dispositivos de Teste Mínimos

| Plataforma | Dispositivos |
|---|---|
| iOS | iPhone SE (4ª), iPhone 15, iPhone 15 Pro Max |
| Android | Pixel 6 (Android 12), Samsung Galaxy S23 (One UI 6), dispositivo Android 10 médio |

### 11.4 Critérios de Performance

- Cold start: < 2s em dispositivo mid-range
- TTI (Time to Interactive): < 3s no dashboard
- FPS durante scroll: ≥ 60fps
- Bundle size: < 15MB (release)

---

## 12. Roadmap de Implementação

### Fase 0 — Fundação (1–2 semanas)

- [ ] Setup do monorepo (Turborepo)
- [ ] Extrair `packages/core` do web (services, hooks, stores, types, utils, validators)
- [ ] Criar `packages/design-tokens` com os valores do `index.css`
- [ ] Inicializar projeto Expo com TypeScript + NativeWind + Expo Router
- [ ] Configurar EAS Build (iOS + Android)
- [ ] Configurar Detox para E2E

### Fase 1 — MVP (3–4 semanas)

- [ ] Tela de Login e Registro
- [ ] Autenticação com SecureStore + interceptors axios
- [ ] Bottom Tab Navigator (5 tabs)
- [ ] Componentes base: Button, Input, Card, Badge, Skeleton, BottomSheet
- [ ] Dashboard (KPIs + Period Selector + gráfico de linha + transações recentes)
- [ ] Lista de Transações (com filtros, swipe actions, paginação infinita)
- [ ] Bottom Sheet de Adicionar/Editar Transação
- [ ] Detalhe e exclusão de transação

### Fase 2 — Funcionalidades Complementares (2–3 semanas)

- [ ] Tela de Metas e Orçamentos
- [ ] Gráfico Donut por categoria
- [ ] Transações recorrentes
- [ ] Exportação CSV (Expo Share API)
- [ ] Menu "Mais" com navegação full

### Fase 3 — Polimento e Extras (2 semanas)

- [ ] Notificações push (alertas de limite de orçamento)
- [ ] Tela de Configurações (perfil, senha)
- [ ] Testes E2E cobrindo fluxos críticos
- [ ] Submissão App Store + Google Play

---

## 13. Decisões e Trade-offs

### Por que React Native + Expo e não Capacitor/Ionic?

O Capacitor simplesmente empacota a web existente para mobile, o que resolveria o problema imediato mas entregaria uma experiência inferior (gestos, animações, performance de listas longas, integração com APIs nativas). Como o objetivo é um app de qualidade nativa, React Native é a escolha certa dado que o time já conhece React e TypeScript.

### Por que NativeWind em vez de StyleSheet puro?

NativeWind permite usar a mesma sintaxe Tailwind do web, reduzindo a curva de aprendizado para o time. O trade-off é uma camada de compilação adicional, mas a DX e a velocidade de desenvolvimento compensam.

### Por que @gorhom/bottom-sheet em vez de Modal nativo?

O Modal nativo do React Native não suporta drag-to-dismiss, snap points nem gestos encadeados. Para a experiência de app financeiro moderno, o Bottom Sheet com gestos fluidos é essencial, especialmente na adição de transações (fluxo mais frequente).

### Monorepo vs Repositório Separado?

Monorepo é recomendado pois o código compartilhado (services, hooks, stores, types) é substancial. Sem monorepo, qualquer mudança de API ou tipo precisaria ser replicada manualmente. O Turborepo com workspaces npm resolve isso com overhead mínimo.

### Segurança de Tokens JWT

`localStorage` não existe em React Native. A alternativa segura é `expo-secure-store` que usa o Keychain do iOS e o EncryptedSharedPreferences do Android — ambos adequados para tokens de autenticação.

---

*Documento gerado com base em `SYSTEM_DESIGN_ATUAL.md` e `SYSTEM_DESIGN_MOBILE.md`.*  
*Próximo passo: validar stack com o time e iniciar Fase 0.*
