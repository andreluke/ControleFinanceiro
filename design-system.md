# Design System — FinanceApp / Fintech Pro

## 1. Visão Geral

Interface web desktop voltada para dashboard financeiro. Layout em paisagem com sidebar fixa à esquerda e corpo principal dinâmico.

---

## 2. Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-global` | `#0F1117` | Background geral |
| `--bg-sidebar` | `#161B27` | Sidebar |
| `--bg-card` | `#1A2035` | Cards, painéis, tabelas |
| `--bg-card-alt` | `#1E2A3B` | Separadores, bordas sutis |
| `--primary` | `#2563EB` | Nav ativo, botão CTA, paginação ativa |
| `--primary-light` | `#3B82F6` | Gráfico de linha, destaque donut Moradia |
| `--text-primary` | `#FFFFFF` | Texto principal |
| `--text-secondary` | `#8892A4` | Labels, subtítulos, cabeçalhos de tabela |
| `--text-badge` | `#CBD5E1` | Texto de badges de categoria |
| `--success` | `#22C55E` | Valores positivos, donut Alimentação |
| `--danger` | `#EF4444` | Valores negativos, ícones de despesa |
| `--warning` | `#F59E0B` | Donut Lazer / Âmbar |

---

## 3. Tipografia

> Fonte recomendada: **Inter** (ou similar sem serifa)

| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| Logo nome | 16–18px | Bold (700) | `--text-primary` |
| Logo subtítulo | 11px | Regular (400) | `--text-secondary` |
| Título principal (h1) | 24–26px | Bold (700) | `--text-primary` |
| Subtítulo de tela | 13px | Regular (400) | `--text-secondary` |
| Label de KPI | 12px | Regular (400) | `--text-secondary` |
| Valor de KPI | 22px | Bold (700) | `--text-primary` |
| Percentual positivo | 12px | SemiBold (600) | `--success` |
| Percentual negativo | 12px | SemiBold (600) | `--danger` |
| Nav item ativo | 14px | SemiBold (600) | `--text-primary` |
| Nav item inativo | 14px | Regular (400) | `--text-secondary` |
| Cabeçalho de tabela | 11px | SemiBold (600) | `--text-secondary` (uppercase) |
| Valor positivo tabela | 14–15px | SemiBold (600) | `--success` |
| Valor negativo tabela | 14–15px | SemiBold (600) | `--danger` ou `--text-primary` |
| Descrição de transação | 15px | SemiBold (600) | `--text-primary` |
| Sub-descrição | 12px | Regular (400) | `--text-secondary` |
| Botão CTA | 14px | SemiBold (600) | `--text-primary` |
| Contador de paginação | 12px | Regular (400) | `--text-secondary` |

---

## 4. Espaçamento

| Token | Valor | Uso |
|-------|-------|-----|
| `spacing-xs` | 4px | Padding badge |
| `spacing-sm` | 8px | Padding botão período |
| `spacing-md` | 16px | Gap entre cards KPI |
| `spacing-lg` | 24px | Padding body, gap entre seções |
| `spacing-xl` | 32px | Padding body máximo |

---

## 5. Dimensões de Layout

| Elemento | Valor |
|----------|-------|
| Sidebar | 220–240px |
| Padding do body | 24–32px |
| Gap entre cards KPI | 16px |
| Altura cards KPI | ~120px |
| Altura dos gráficos | ~300px |
| Altura das linhas da tabela | ~72px |

---

## 6. Componentes

### 6.1 Sidebar

- Background: `--bg-sidebar`
- Largura fixa: 220–240px
- Nav item **ativo**: background `--primary`, border-radius 8px, ícone + texto `--text-primary`
- Nav item **inativo**: ícone + texto `--text-secondary`
- Itens bloqueados: ícone de cadeado à direita
- Perfil na base: avatar circular ~40px, nome + email

### 6.2 Botões de Período (Tabs)

```
border-radius: 8px
padding: 8px 16px
ativo:   background #2563EB, color #FFFFFF
inativo: background #1E2A3B | #2A3550, color #8892A4
```

### 6.3 Cards de KPI

```
background:    #1A2035
border-radius: 12px
padding:       20–24px
box-shadow:    0 4px 20px rgba(0,0,0,0.3)
```

- Ícone colorido no canto superior esquerdo (~32px)
- Percentual no canto superior direito
- Label e valor empilhados verticalmente

### 6.4 Gráfico de Linha — Evolução do Saldo

- Background: `--bg-card`, border-radius 12px
- Linha: `#3B82F6`
- Área: gradiente `#3B82F6` → transparente
- Eixo X: labels de meses (JAN–JUN), cor `--text-secondary`
- Legenda com bolinha + "Saldo" no canto superior direito

### 6.5 Gráfico Donut — Gastos por Categoria

- Background: `--bg-card`, border-radius 12px
- 3 arcos: Moradia `#3B82F6` | Alimentação `#22C55E` | Lazer `#F59E0B`
- Texto central: valor bold branco + "Total"
- Espessura do anel: ~20px
- Legenda embaixo: bolinha + nome + percentual

### 6.6 Tabela de Transações

```
container:     background #1A2035, border-radius 12px, padding 24px
separadores:   border-bottom 1px solid #1E2A40
header:        font-size 11px, uppercase, color #8892A4, font-weight 600
```

- Ícone circular: ~36–44px, fundo colorido, ícone branco centralizado
- Badge de categoria: background `#1E2A3B`, color `#CBD5E1`, border-radius 4–6px, padding 4px 8–10px, uppercase

### 6.7 Botão CTA — Nova Transferência

```
background:  #2563EB
color:       #FFFFFF
border-radius: 10px
padding:     12px 20px
box-shadow:  0 4px 14px rgba(37,99,235,0.4)
```

### 6.8 Barra de Filtros

- Input de busca: ícone de lupa, background `#1A2035`, border `1px solid #2A3550`, border-radius 8px
- Dropdowns: fundo escuro, seta chevron, borda 1px
- Botão Filtros: ícone + texto, fundo escuro com borda

### 6.9 Paginação

```
botão:        36×36px, border-radius 6px
ativo:        background #2563EB, color #FFFFFF
inativo:      background #1A2035, color #8892A4
prev/next:    ícone chevron, mesma estrutura
```

---

## 7. Efeitos Visuais

| Efeito | Valor |
|--------|-------|
| `box-shadow` padrão | `0 4px 20px rgba(0,0,0,0.3)` |
| `box-shadow` CTA | `0 4px 14px rgba(37,99,235,0.4)` |
| `border-radius` cards | `12px` |
| Borda card sutil | `1px solid #1E2A40` (opcional) |
| Gradiente gráfico | `#3B82F6` → `transparent` (vertical) |

---

## 8. Comparativo entre Telas

| Aspecto | Dashboard (FinanceApp) | Transferências (Fintech Pro) |
|---------|----------------------|------------------------------|
| Complexidade | Alta (KPIs + gráficos + tabela) | Média (filtros + tabela) |
| CTA principal | Não presente | "Nova Transferência" |
| Nav ativo | Pill azul (#2563EB) | Texto branco |
| Sidebar largura | ~220px | ~240px |
| Grid body | 4 cols (KPI) + 70/30 (gráficos) | 1 coluna (full-width) |
