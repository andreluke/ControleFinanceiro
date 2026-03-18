# FinanceApp Mobile - Funcionalidades

## ✅ Implementado

### Autenticação
- [x] Login com validação Zod
- [x] Registro com validação Zod
- [x] Logout com confirmação Alert
- [x] Token JWT persistido com SecureStore
- [x] UI melhorada com ícones e design moderno

### Dashboard
- [x] Resumo financeiro (saldo, receitas, despesas, variação)
- [x] Lista de últimas transações
- [x] Pull-to-refresh
- [x] Dados em tempo real da API
- [x] KPIs com ícones
- [x] Gráfico de rosca (donut) por categoria (despesas)
- [x] Gráfico de rosca por categoria (receitas)
- [x] Gráfico de barras (receitas vs despesas)
- [x] Gráfico de linha (evolução do saldo)
- [x] UI melhorada com seções eempty states

### Transações
- [x] Lista de transações com busca
- [x] Criar nova transação (despesa/receita)
- [x] Categorias da API
- [x] Pull-to-refresh
- [x] Filtros (por tipo, categoria, data)
- [x] Ordenação (data, valor)
- [x] Editar transação
- [x] Deletar transação
- [x] Detalhes da transação (modal)
- [x] Forma de pagamento na transação

### Transações Recorrentes
- [x] Lista de transações recorrentes
- [x] Criar transação recorrente
- [x] Editar transação recorrente
- [x] Deletar transação recorrente
- [x] Ativar/desativar recorrência
- [x] Processar transação agora
- [x] Forma de pagamento na recorrente

### Orçamentos
- [x] Lista de orçamentos por categoria
- [x] Progress bar de gastos
- [x] Total orçado/gasto/restante
- [x] Tela de criar orçamento com categorias
- [x] Editar orçamento
- [x] Deletar orçamento
- [x] Alertas de orçamento próximo ao limite
- [x] Badge de aviso nos cards
- [x] Banner de alerta quando há orçamentos excedidos

### Categorias
- [x] Lista de categorias
- [x] Criar categoria
- [x] Editar categoria
- [x] Deletar categoria
- [x] Seletor de cor
- [x] Tabs para categorias/subcategorias/formas de pagamento

### Subcategorias
- [x] Lista de subcategorias
- [x] Criar subcategoria
- [x] Editar subcategoria
- [x] Deletar subcategoria

### Métodos de Pagamento
- [x] Lista de métodos de pagamento
- [x] Criar método de pagamento
- [x] Editar método de pagamento
- [x] Deletar método de pagamento

### Perfil
- [x] Editar perfil
- [x] Alterar senha
- [x] Avatar/nome do usuário

### Exportação
- [x] Exportar dados (PDF/CSV/Excel)

### UI/UX
- [x] Ícones SVG (sem emojis)
- [x] Dark theme
- [x] SafeAreaView configurado
- [x] Tab bar com FAB para adicionar transação
- [x] Design system tokens
- [x] Componentes UI estilizados (Button, Input, Card, Modal, etc.)
- [x] Telas de auth com design moderno
- [x] Botões com estilo filled (pill shape)

### Offline
- [x] Cache local com MMKV
- [x] Cache automático em todas as requisições
- [x] Invalidação de cache em mutações (create, update, delete)
- [x] Dados disponíveis offline

---

## 🚧 Em Desenvolvimento

- [ ] (none)

---

## 📋 Funcionalidades Faltantes

### Orçamentos
- [x] Criar orçamento (tela completa)
- [x] Editar orçamento
- [x] Deletar orçamento
- [ ] Alertas de orçamento próximo ao limite
- [ ] Notificações quando ultrapassar orçamento

### Perfil
- [x] Editar perfil
- [x] Alterar senha
- [x] Avatar/nome do usuário
- [ ] Notificações (on/off) - implementação de push

### Exportação
- [x] Exportar dados (PDF/CSV/Excel)
- [ ] Backup automático

### Configurações
- [ ] Notificações (on/off)
- [ ] Tema (dark/light) - só dark por enquanto

### Offline
- [x] Cache local com MMKV
- [x] Cache automático em todas as requisições
- [x] Invalidação de cache em mutações (create, update, delete)
- [x] Dados disponíveis offline

---

## 🔧 Melhorias Técnicas

- [ ] Loading skeletons
- [ ] Infinite scroll/paginação
- [ ] Error boundaries
- [ ] Retry automático em falhas de rede
- [ ] Testes unitários
- [ ] Analytics
- [ ] Push notifications
- [ ] Deep links

---

## 📱 Plataformas Futuras

- [ ] Apple Watch companion app
- [ ] Widgets
- [ ] Apple Watch app
