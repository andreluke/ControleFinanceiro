# Design System - FinanceApp

Este documento define o design system do FinanceApp, baseado nas interfaces de referência (FinanceApp Dashboard e fintech Pro).

---

## 🎨 Paleta de Cores

### Cores Principais

| Nome | Hex | Uso |
|------|-----|-----|
| Background Global | `#0F1117` | Fundo principal da aplicação |
| Sidebar / Cards | `#1A2035` | Fundos de cards, sidebar, painéis |
| Sidebar Escuro | `#161B27` | Fundo da sidebar |
| Primária (Azul) | `#2563EB` | Buttons CTA, nav ativo, links |
| Primária Escuro | `#3B82F6` | Hover states, gráficos |
| Texto Principal | `#FFFFFF` | Títulos, valores, texto em destaque |
| Texto Secundário | `#8892A4` | Labels, subtítulos, placeholders |
| Texto Muted | `#8892A4` | Headers de tabela, descrições |

### Cores Semânticas

| Nome | Hex | Uso |
|------|-----|-----|
| Success / Positivo | `#22C55E` | Receitas, valores positivos, sucesso |
| Danger / Negativo | `#EF4444` | Despesas, valores negativos, erros |
| Warning | `#F59E0B` | Alertas, warnings |

### Cores de Categoria (Gráficos)

| Categoria | Hex |
|-----------|-----|
| Moradia | `#3B82F6` |
| Alimentação | `#22C55E` |
| Lazer | `#F59E0B` |
| Transporte | `#8B5CF6` |
| Saúde | `#EC4899` |
| Outros | `#6B7280` |

---

## 📐 Espaçamento

| Nome | Valor |
|------|-------|
| Sidebar largura | `220px` - `240px` |
| Body padding | `24px` - `32px` |
| Card padding | `20px` - `24px` |
| Card border-radius | `12px` |
| Button border-radius | `8px` - `10px` |
| Gap entre cards | `16px` |
| Gap entre seções | `24px` |
| Input border-radius | `8px` |

---

## 🔤 Tipografia

### Fontes

- **Família:** Inter (ou similar do sistema)
- **Pesos:** Regular (400), Semibold (600), Bold (700)

### Tamanhos

| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| Logo | `16px` | Bold | `#FFFFFF` |
| Logo subtítulo | `11px` | Regular | `#8892A4` |
| Título página | `24px` - `26px` | Bold | `#FFFFFF` |
| Subtítulo | `13px` | Regular | `#8892A4` |
| Labels KPI | `12px` | Regular | `#8892A4` |
| Valores KPI | `22px` | Bold | `#FFFFFF` |
| Percentual | `12px` | Semibold | `#22C55E` ou `#EF4444` |
| Nav items | `14px` | Regular/Semibold | `#FFFFFF` ou `#8892A4` |
| Headers tabela | `11px` | Semibold | `#8892A4` (uppercase) |
| Valores tabela | `14px` | Semibold | `#FFFFFF`, `#22C55E`, `#EF4444` |

---

## 🧩 Componentes

### Botão Primário (CTA)

```css
background: #2563EB;
color: #FFFFFF;
border-radius: 10px;
padding: 12px 20px;
font-weight: 600;
font-size: 14px;
box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
```

**Hover:** `box-shadow: 0 0 20px rgba(37, 99, 235, 0.5);`

### Botões de Período (Tabs)

```css
/* Ativo */
background: #2563EB;
color: #FFFFFF;
border-radius: 8px;
padding: 8px 16px;

/* Inativo */
background: #1E2A3B;
color: #8892A4;
border-radius: 8px;
padding: 8px 16px;
```

### Cards (KPI / Gráficos)

```css
background: #1A2035;
border-radius: 12px;
padding: 20px - 24px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
```

### Input de Busca

```css
background: #1A2035;
border: 1px solid #2A3550;
border-radius: 8px;
color: #FFFFFF;
padding: 10px 12px 10px 40px; /* espaço para ícone */
```

### Badge de Categoria

```css
background: #1E2A3B;
color: #CBD5E1;
border-radius: 4px - 6px;
padding: 4px 8px - 10px;
text-transform: uppercase;
font-size: 11px;
```

### Tabela

- Header: texto `#8892A4`, `11px`, uppercase, semibold
- Linhas: separador `border-bottom: 1px solid #1E2A40`
- Ícones: circular `36px` - `44px`, fundo colorido, ícone branco central

---

## 📊 Componentes de Gráfico

### Gráfico de Linha (Evolução)

- Background: `#1A2035`, border-radius `12px`
- Linha: `#3B82F6` com gradiente para baixo (transparente)
- Eixos: apenas labels em `#8892A4`

### Gráfico Donut (Gastos por Categoria)

- Background: `#1A2035`, border-radius `12px`
- Anel: espessura ~20px
- Centro: "R$ 3.1k / Total" em branco bold

---

## 🔄 Implementação no Tailwind

Adicionar ao `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#0F1117',
        card: '#1A2035',
        sidebar: '#161B27',
        primary: '#2563EB',
        'primary-hover': '#3B82F6',
        foreground: '#FFFFFF',
        secondary: '#8892A4',
        muted: '#8892A4',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        border: '#1E2A40',
        'border-light': '#2A3550',
        'input-bg': '#1A2035',
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '8px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.3)',
        'button-glow': '0 4px 14px rgba(37, 99, 235, 0.4)',
        'button-glow-hover': '0 0 20px rgba(37, 99, 235, 0.5)',
      },
      width: {
        sidebar: '220px',
      },
    },
  },
}
```

---

## ✅ Checklist de Implementação

- [ ] Atualizar `tailwind.config.js` com as cores
- [ ] Criar/atualizar arquivo de CSS base com variáveis
- [ ] Aplicar background global `#0F1117` no root
- [ ] Estilizar Sidebar com `#161B27`
- [ ] Atualizar Cards para `#1A2035`
- [ ] Ajustar tipografia (cores e tamanhos)
- [ ] Atualizar inputs e selects
- [ ] Atualizar tabela de transações
- [ ] Aplicar aos modais
- [ ] Testar contraste e acessibilidade

---

# Próximas Features - Planejamento

## 🔴 Alta Prioridade

### 1. Metas e Orçamentos

**Objetivo:** Controlar gastos por categoria.

**Funcionalidades:**
- Definir orçamento mensal por categoria
- Alertas quando próximo ao limite (80%, 100%)
- Visualizar gasto vs orçamento

---

### 2. Notificações por E-mail

**Objetivo:** Lembrar o usuário de transações recorrentes pendentes.

**Funcionalidades:**
- Enviar e-mail 1 dia antes do vencimento de transação recorrente
- Template HTML com detalhes da transação
- Configuração de preferências de notificação
- Queue para processamento assíncrono

**Tech:**
- Nodemailer ou Resend
- Bull/Redis para filas (opcional)
- Cron job para verificar transações do dia

---

## 🟠 Média Prioridade

### Filtro de Mês Customizado

**Objetivo:** Permitir filtrar transações por mês específico no formato "janeiro/2026".

**Funcionalidades:**
- Selector de mês/ano no header
- Navegação entre meses (próximo/anterior)
- Atalhos: "Este mês", "Mês anterior"
- URL atualizável com filtro (?month=2026-01)

---

### 3. Tags/Labels

**Objetivo:** Categorização manual de transações.

**Funcionalidades:**
- Criar tags personalizadas
- Filtrar transações por tags
- Múltiplas tags por transação
- Relatórios por tag

---

### 4. Dívidas e Parcelas

**Objetivo:** Controle de dívidas e compras parceladas.

**Funcionalidades:**
- Registrar dívida com número de parcelas
- Acompanhar parcelas pagas/restantes
- Juros e total pago
- Alertas de vencimento

---

### 5. Backup Criptografado

**Objetivo:** Preservar e restaurar dados com segurança.

**Funcionalidades:**
- Exportar todos os dados em JSON criptografado
- Senha para descriptografar na importação
- Backup manual

---

### 6. Login Social

**Objetivo:** Autenticação facilitada.

**Funcionalidades:**
- Login com Google
- Login com Apple
- Vincular conta social à conta existente

---

## 🟢 Baixa Prioridade

### 7. Contas Bancárias

**Objetivo:** Gerenciar múltiplas contas.

**Funcionalidades:**
- Cadastrar múltiplas contas/cartões
- Saldo consolidado de todas as contas
- Transferências entre contas

---

### 8. Investimentos

**Objetivo:** Controle de investimentos e patrimônio.

**Funcionalidades:**
- Cadastrar investimentos (RF, RV, FIs, etc.)
- Acompanhar evolução patrimonial
- Rentabilidade mensal

---

### 9. Planejamento Financeiro (Yotei)

**Objetivo:** Planejar metas financeiras futuras.

**Funcionalidades:**
- Definir objetivos (ex: emergência, viagem, carro)
- Definir prazo e valor mensal para poupar
- Acompanhar progresso

---

### 10. PWA - App Instalável

**Objetivo:** Melhor experiência mobile.

**Funcionalidades:**
- Installable (manifest.json)
- Offline mode básico
- Ícone na tela inicial

---

### 11. Tema Claro

**Objetivo:** Suporte a light mode.

**Funcionalidades:**
- Detectar preferência do sistema
- Toggle manual no header
- Inversão das cores do tema escuro

---

## 📊 Priorização

| # | Feature | Prioridade | Complexidade |
|---|---------|------------|--------------|
| 1 | Metas e Orçamentos | 🔴 Alta | Média |
| 2 | Notificações por E-mail | 🔴 Alta | Média |
| 3 | Tags/Labels | 🟠 Média | Baixa |
| 4 | Dívidas e Parcelas | 🟠 Média | Média |
| 5 | Backup Criptografado | 🟠 Média | Média |
| 6 | Login Social | 🟠 Média | Média |
| 7 | Contas Bancárias | 🟢 Baixa | Alta |
| 8 | Investimentos | 🟢 Baixa | Alta |
| 9 | Planejamento (Yotei) | 🟢 Baixa | Média |
| 10 | PWA | 🟢 Baixa | Baixa |
| 11 | Tema Claro | 🟢 Baixa | Baixa |

---

## 🚀 Como Contribuir

1. Escolha uma feature da lista
2. Crie uma branch: `feature/nome-da-feature`
3. Implemente e teste
4. Abra PR para review

---

*Última atualização: 2026-03-14*
