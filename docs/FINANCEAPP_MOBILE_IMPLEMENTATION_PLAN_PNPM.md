# FinanceApp Mobile --- Plano de Implementação (Expo + PNPM)

Data: 2026-03-16

Este documento define como implementar a versão **mobile do FinanceApp**
utilizando **React Native + Expo + TypeScript**.

A arquitetura prioriza **simplicidade, DX e rapidez de setup**.

Princípios:

-   Todo o código dentro do próprio projeto Expo
-   Nenhum monorepo
-   Nenhum workspace
-   Nenhum package compartilhado externo
-   Execução simples usando **pnpm**

------------------------------------------------------------------------

# 1. Criação do Projeto

O projeto **deve ser inicializado obrigatoriamente com Expo e
TypeScript**.

``` bash
npx create-expo-app mobile -t expo-template-blank-typescript
```

Após criar o projeto:

``` bash
cd mobile
pnpm install
pnpm start
```

Ou:

``` bash
pnpm expo start
```

------------------------------------------------------------------------

# 2. Stack Tecnológica

## Core

-   Expo SDK 52+
-   React Native
-   TypeScript

## Navegação

-   expo-router

## Estilização

-   nativewind
-   tailwindcss

## Data & State

-   @tanstack/react-query
-   zustand
-   react-hook-form
-   zod
-   date-fns

## UX Mobile

-   @gorhom/bottom-sheet
-   react-native-reanimated
-   react-native-gesture-handler
-   react-native-safe-area-context

## Armazenamento

-   expo-secure-store
-   react-native-mmkv

## Gráficos

-   victory-native
-   react-native-svg

------------------------------------------------------------------------

# 3. Instalação das Dependências

Todas as dependências devem ser instaladas com **pnpm**.

Exemplo:

``` bash
pnpm add expo-router nativewind tailwindcss
pnpm add @tanstack/react-query zustand react-hook-form zod date-fns
pnpm add react-native-reanimated react-native-gesture-handler
pnpm add @gorhom/bottom-sheet
pnpm add expo-secure-store react-native-mmkv
pnpm add victory-native react-native-svg
```

------------------------------------------------------------------------

# 4. Estrutura do Projeto

    financeapp-mobile/

    app/                 # rotas Expo Router

    src/
      components/
      hooks/
      services/
      stores/
      theme/
      types/
      utils/
      validators/

    assets/

    app.json
    babel.config.js
    tailwind.config.js
    tsconfig.json
    package.json

Todo o código da aplicação deve viver dentro de **src/**.

------------------------------------------------------------------------

# 5. Design System

Tokens devem existir em:

    src/theme/tokens.ts

Exemplo:

``` ts
export const colors = {
  background: '#0F1117',
  card: '#1A2035',
  primary: '#2563EB',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
}
```

Tipografia:

-   fonte: **Inter**
-   foco em **legibilidade mobile**
-   botões mínimo **44px de altura**

------------------------------------------------------------------------

# 6. Navegação

Utilizar **Expo Router**.

Estrutura:

    app/

    (auth)/
      login.tsx
      register.tsx

    (tabs)/
      index.tsx
      transactions.tsx
      budgets.tsx
      more.tsx

    transactions/
      [id].tsx

------------------------------------------------------------------------

# 7. Componentes Base

Criar componentes reutilizáveis em:

    src/components/ui

Componentes obrigatórios:

-   Button
-   Input
-   Card
-   Badge
-   Skeleton
-   BottomSheet
-   ScreenHeader

Todos devem seguir o design system.

------------------------------------------------------------------------

# 8. Prompts para Gerar Telas com IA

Os prompts abaixo podem ser usados em **Cursor, Copilot, Claude Code ou
Stitch**.

Cada prompt enfatiza:

-   UI
-   UX mobile
-   consistência visual

------------------------------------------------------------------------

# Prompt --- Tela de Login

Crie uma tela de login em React Native usando Expo.

Requisitos:

-   usar TypeScript
-   usar NativeWind para estilização
-   seguir design system do projeto
-   layout mobile moderno
-   inputs com altura mínima 44px
-   botão principal grande
-   fundo escuro (#0F1117)
-   card central (#1A2035)

UI:

-   logo no topo
-   input email
-   input senha
-   botão "Entrar"
-   link "Criar conta"

UX:

-   feedback visual ao focar input
-   loading no botão
-   validação com Zod

------------------------------------------------------------------------

# Prompt --- Tela Dashboard

Crie a tela Dashboard de um app de controle financeiro.

UI:

-   header com avatar do usuário
-   seletor de período horizontal
-   grid com 4 KPI cards

KPIs:

-   saldo
-   receitas
-   despesas
-   variação

Cada card deve ter:

-   ícone
-   label
-   valor grande

Abaixo:

-   gráfico de linha de saldo
-   lista das últimas transações

UX:

-   scroll vertical
-   animações suaves
-   skeleton loading

------------------------------------------------------------------------

# Prompt --- Lista de Transações

Crie uma tela de lista de transações.

UI:

-   search bar no topo
-   filtros
-   lista agrupada por data

Cada item:

-   ícone de categoria
-   descrição
-   valor

UX:

-   swipe para editar
-   swipe para deletar
-   animação suave

Usar FlatList.

------------------------------------------------------------------------

# Prompt --- Nova Transação

Criar um Bottom Sheet para adicionar transação.

Campos:

-   tipo (receita/despesa)
-   valor
-   descrição
-   categoria
-   data

UI:

-   design moderno
-   inputs grandes
-   botão salvar fixo no bottom

UX:

-   validação em tempo real
-   animação ao abrir

------------------------------------------------------------------------

# Prompt --- Tela de Metas

Criar tela de metas financeiras.

UI:

-   lista de cards
-   cada card representa uma categoria

Conteúdo:

-   nome da categoria
-   limite
-   valor gasto
-   barra de progresso

Cores:

-   verde abaixo do limite
-   vermelho acima

UX:

-   animação da barra
-   toque abre detalhes

------------------------------------------------------------------------

# 9. Performance

Boas práticas:

-   usar FlatList
-   usar React Query
-   usar MMKV para cache
-   usar Hermes JS engine

------------------------------------------------------------------------

# 10. Roadmap

## Fase 0 --- Setup

-   criar projeto Expo
-   instalar dependências com pnpm
-   configurar Expo Router
-   configurar NativeWind
-   criar estrutura src

## Fase 1 --- MVP

-   login
-   dashboard
-   lista de transações
-   adicionar transação

## Fase 2

-   metas
-   recorrentes
-   gráficos

## Fase 3

-   notificações
-   exportação de dados
-   configurações

------------------------------------------------------------------------

# Execução

Rodar:

``` bash
pnpm install
pnpm start
```

ou

``` bash
pnpm expo start
```

Isso abrirá o Expo DevTools.

Aplicativo poderá rodar em:

-   Android Emulator
-   iOS Simulator
-   Expo Go
