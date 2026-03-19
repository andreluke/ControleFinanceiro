# System Design Mobile - Resumo consolidado

Este documento sintetiza as partes principais do system-design já definidas para o FinanceApp, integrando aspectos do design atual da versão web e as propostas para a versão mobile. Descreve funcionalidades já implementadas (cards, gráficos, modais, tabelas, etc.), as páginas existentes e o mapeamento esperado para uma experiência móvel ótima.

---

## 1. Partes Principais do System-Design (consolidadas para Mobile)

- Plataforma: mobile-first, mantendo consistência com a identidade visual da versão web (paleta, tokens, tipografia).
- Navegação: Bottom Tab Navigation (Dashboard, Transações, Metas, Mais) para fácil alcance com polegar; ações centrais através de Floating Action Button (FAB) ou modais de criação.
- Estrutura de layout: tela única com header, conteúdo principal adaptado, e componentes reutilizáveis (cards, listas, charts) que reformatam para o espaço menor.
- Componentes reutilizáveis: Card, Button, Input, Select, Checkbox, Dialog, Drawer/Bottom Sheet, Avatar/Nav, Toaster para feedback.
- Tokens visuais: uso de design tokens (cores, radii, sombras) mantidos, com variações para fundo, cards, bordas, e estados de interatividade.
- Gráficos e dados: gráficos compactos adaptados (line chart, donut/circular chart) com legendas simplificadas; listas de transações com scroll vertical.
- Padrões de interação: tapping, long-press em itens de lista para ações contextuais, swipe para editar/excluir em transações (quando aplicável).

---

## 2. Funcionalidades Principais Implementadas (mobile)

- Dashboard (DashboardPage + DashboardHeader + DashboardKpiSection)
  - KPI Cards em grid single-column ou 2col/4col conforme espaço, com ícones e indicadores de variação.
  - Gráficos: BalanceLineChart para evolução mensal; CategoryDonutChart para gastos por categoria (compactos para mobile).
  - Resumo de transações recentes e exportação de dados (SeedExportPanel) disponível na tela.

- Transações (TransfersPage)
  - Cabeçalho com ações rápidas: Novo Transação, Nova Categoria/Subcategoria/Método.
  - CardFilters funcional: busca por descrição, filtros por tipo (receita/despesa) e período (este mês, mês anterior, período específico).
  - Tabela de transações com colunas Data, Descrição, Categoria, Método, Valor, Ações (Editar/Excluir).
  - Paginação simples para listas longas.
  - Modais: TransactionModal (criar/editar), CategoryModal, SubcategoryModal, PaymentMethodModal (com suporte a forms).

- Autenticação e Onboarding
  - Home/Login: telas de login com validação, feedbacks via toasts; redirecionamento para dashboard/login conforme token.
  - Signup: fluxo de registro disponível via rotas públicas (integração prevista).

- Páginas de Domínio
  - BudgetsPage e RecurringPage: gestão de metas, orçamentos e transações recorrentes, com Modals apropriados (BudgetModal, RecurringModal).
- Componentes UI Reutilizados
  - Card, Button, Input, Label, Select, Dialog, Drawer/BottomSheet, Toaster/Toast, Checkbox, Sidebar e Header adaptados para mobile.
- Arquitetura
  - Organização modular para facilitar compartilhamento entre web/mobile e futuras evoluções (design tokens, componentes base, layouts, hooks, services).

---

## 3. Páginas Mobile (Mapa de telas)

- DashboardScreen (Dashboard) – tela principal com KPIs, gráficos compactos e ações rápidas.
- TransfersScreen (Transações) – tela com filtros, lista de transações, botões de ação e modais de criação/edição.
- BudgetsScreen (Metas/Orçamentos) – gestão de metas com BudgetModal.
- RecurringScreen (Recorrentes) – gestão de transações recorrentes com RecurringModal.
- LoginScreen (Login) – formulário de autenticação com validação e feedbacks.
- SignupScreen (Cadastro) – tela de criação de conta.
- DetailsScreen (Transação) – modal/bottom sheet para detalhes da transação com opções de edição/exclusão.
- MoreDrawer (Menu) – Drawer com opções de navegação secundária, perfil, configurações e logout.

Observação: o mapeamento exato pode variar conforme a estratégia de implementação (React Native puro, Capacitor, ou outra solução). As referências de conteúdo aqui são baseadas no design atual (web) e nas propostas mobile já discutidas.

---

## 4. Observações de Implementação para Mobile

- Reuso de tokens: cores, radii e sombras devem ser extraídos para um pacote compartilhado entre Web e Mobile para manter consistência.
- Acessibilidade: alvos de toque (min 44x44) e contraste adequado para ambientes móveis.
- Performance: listas com lazy loading, gráficos simples, image loading pragmático.
- Animações: transições de paginação, abertura/fechamento de bottom sheets com movimentos suaves.
- Fluxo de autenticação: manter tokens e revalidação de sessão com React Query (ou equivalente) no mobile.

---

## 5. Perguntas rápidas (se houver need de ajuste)
- Confirma que Bottom Tab Navigation deve permanecer como padrão central para mobile?
- Deseja manter as mesmas telas de Gerenciamento (Budgets/Recurring) já descritas para web no mobile?
- Vamos consolidar Design Tokens em um repositório compartilhado para Web e Mobile?

Data de geração: 2026-03-15
