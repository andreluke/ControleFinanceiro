# FinanceApp Mobile --- AUTONOMOUS AI GENERATION SPEC (V2)

Version: 2.0 Date: 2026-03-16

This document merges:

-   Implementation Plan (Expo + PNPM)
-   ULTRA AI Spec
-   System Design Mobile
-   System Design Mobile Summary

Goal: Enable **Autonomous AI Development** where AI generates most of
the mobile app sequentially with minimal supervision.

------------------------------------------------------------------------

# 1. Autonomous Development Philosophy

AI must operate as a **structured execution engine**.

Principles:

-   Adapt existing web design (NOT redesign)
-   Mobile-first execution
-   Architecture before UI
-   Reuse design tokens
-   Consistency across Web and Mobile

AI MUST prioritize reuse over creation.

------------------------------------------------------------------------

# 2. Global Architecture Contract

Directory structure:

src/ components/ ui/ charts/ lists/ forms/ hooks/ services/ stores/
theme/ types/ utils/ validators/

Rules:

1.  Screens NEVER call APIs.
2.  Services own networking.
3.  Hooks wrap services.
4.  UI is stateless whenever possible.
5.  Zustand → UI state only.
6.  React Query → server state.

------------------------------------------------------------------------

# 3. Navigation Contract (System Design Integrated)

Navigation MUST follow Bottom Tabs:

Tabs:

-   Dashboard
-   Transactions
-   Add (+ modal)
-   Budgets
-   More

Specifications:

-   Tab height: 56px
-   Icons: 24x24
-   Central FAB: 48x48 elevated button
-   Touch targets ≥ 44px

Expo Router Structure:

app/ (auth)/ (tabs)/ modal/

------------------------------------------------------------------------

# 4. Design System Synchronization

Design tokens MUST match Web:

Primary: #2563EB Background: #0F1117 Card: #1A2035 Success: #22C55E
Danger: #EF4444 Warning: #F59E0B

Mobile adjustments:

-   Reduce opacity usage
-   Increase contrast
-   Touch-first spacing

Tokens file:

src/theme/tokens.ts

------------------------------------------------------------------------

# 5. Mobile Layout Contract

Header:

-   Height: 44px + status bar
-   Avatar action right
-   Back button touch-safe

Spacing:

-   Page padding: 16px
-   Card padding: 16px
-   Section gap: 20px

Charts:

-   Height: 200px
-   Tooltip on touch
-   Compact legends

------------------------------------------------------------------------

# 6. Component Generation Protocol

Required Components:

Button Input Card Badge Skeleton BottomSheet ScreenHeader
TransactionItem KpiCard PeriodSelector FloatingActionButton

Rules:

-   NativeWind only
-   No inline styles
-   forwardRef required
-   Accessible props mandatory

------------------------------------------------------------------------

# 7. Services + Hooks Autonomous Pattern

Generation order:

1.  services/\*
2.  hooks/\*
3.  stores/\*
4.  screens/\*

Example rule:

services/transactions.service.ts hooks/useTransactions.ts

Hooks MUST:

-   expose loading/error
-   optimistic updates
-   pagination ready

------------------------------------------------------------------------

# 8. Screens Mapping (from System Design)

AI MUST generate:

DashboardScreen TransactionsScreen TransactionDetailSheet
AddTransactionSheet BudgetsScreen RecurringScreen LoginScreen
SignupScreen MoreDrawer

Each screen must follow mobile layout constraints.

------------------------------------------------------------------------

# 9. Interaction & Gesture Rules

Supported gestures:

-   Tap → open detail
-   Swipe left/right → edit/delete
-   Pull-to-refresh
-   BottomSheet drag close
-   Long press → context actions

Animations:

-   Page push: slide-right
-   Modal: fade + slide-up
-   Button press: scale(0.98)

------------------------------------------------------------------------

# 10. Charts Protocol

Charts required:

BalanceLineChart CategoryDonutChart ExpenseTrendChart

Requirements:

-   victory-native
-   animated
-   dark theme
-   touch tooltip
-   currency formatting

------------------------------------------------------------------------

# 11. Anti‑Hallucination Enforcement

AI MUST NOT:

-   invent folders
-   create new color palettes
-   bypass services
-   duplicate UI components
-   introduce new navigation paradigms

If unsure → reuse existing implementation.

------------------------------------------------------------------------

# 12. Autonomous Generation Pipeline

AI must execute sequentially:

STEP 1 --- Generate tokens STEP 2 --- Generate UI primitives STEP 3 ---
Generate navigation STEP 4 --- Generate services STEP 5 --- Generate
hooks STEP 6 --- Generate charts STEP 7 --- Generate screens STEP 8 ---
Generate gestures & animations STEP 9 --- Self-review architecture

Screens MUST NEVER be first.

------------------------------------------------------------------------

# 13. Self‑Review Prompt (AI must run internally)

""" Validate:

-   tokens usage only
-   no inline styles
-   services layer respected
-   navigation structure correct
-   reusable components used """

If validation fails → regenerate affected files.

------------------------------------------------------------------------

# 14. MASTER AUTONOMOUS PROMPT

Use this to bootstrap the app:

""" You are a senior React Native architect.

Generate the FinanceApp mobile application following: - Autonomous AI
Spec - Mobile System Design - Expo Router structure - NativeWind
styling - React Query + Zustand architecture

Execution order: tokens → components → navigation → services → hooks →
charts → screens.

Never skip steps. Never invent architecture. Generate production-ready
code only. """

------------------------------------------------------------------------

# 15. Expected Autonomous Coverage

UI Components: 95% Screens: 90% Hooks: 85% Services: 85% Navigation: 95%
Charts: 90%

Overall automation ≈ 85%.

------------------------------------------------------------------------

# END --- AUTONOMOUS SPEC V2
