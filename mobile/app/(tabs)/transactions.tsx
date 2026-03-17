import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback, useMemo } from 'react'
import { useFocusEffect } from 'expo-router'
import { Input, Card, CardContent, Button, Modal } from '../../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { transactionService, categoryService, type Transaction, type Category } from '../../src/services'
import { Icons, FilterIcon } from '../../src/components/icons'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
type FilterType = 'all' | 'expense' | 'income'

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('date_desc')
  const [showFilters, setShowFilters] = useState(false)
  
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const [transData, catData] = await Promise.all([
        transactionService.list(),
        categoryService.list(),
      ])
      setTransactions(transData.data)
      setCategories(catData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.category?.name.toLowerCase().includes(searchLower)
      )
    }

    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType)
    }

    if (filterCategory) {
      result = result.filter((t) => t.categoryId === filterCategory)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'amount_desc':
          return b.amount - a.amount
        case 'amount_asc':
          return a.amount - b.amount
        default:
          return 0
      }
    })

    return result
  }, [transactions, search, filterType, filterCategory, sortBy])

  const openCreateModal = () => {
    setEditingTransaction(null)
    setType('expense')
    setAmount('')
    setDescription('')
    setSelectedCategory('')
    setTransactionDate(new Date().toISOString().split('T')[0])
    setLoadingCategories(false)
    setShowModal(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setType(transaction.type)
    setAmount(transaction.amount.toString())
    setDescription(transaction.description)
    setSelectedCategory(transaction.categoryId)
    setTransactionDate(new Date(transaction.date).toISOString().split('T')[0])
    setLoadingCategories(false)
    setShowModal(true)
  }

  const openDetailsModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTransaction(null)
  }

  const handleSubmit = async () => {
    if (!amount || !description || !selectedCategory) return

    setIsSubmitting(true)
    try {
      const data = {
        description,
        amount: parseFloat(amount.replace(',', '.')),
        type,
        categoryId: selectedCategory,
        date: new Date(transactionDate).toISOString(),
      }

      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data)
      } else {
        await transactionService.create(data)
      }
      closeModal()
      loadData()
    } catch (err) {
      console.error('Error saving transaction:', err)
      Alert.alert('Erro', 'Não foi possível salvar a transação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'Excluir Transação',
      `Tem certeza que deseja excluir "${transaction.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.delete(transaction.id)
              setShowDetailsModal(false)
              loadData()
            } catch (err) {
              console.error('Error deleting transaction:', err)
              Alert.alert('Erro', 'Não foi possível excluir a transação')
            }
          },
        },
      ]
    )
  }

  const clearFilters = () => {
    setFilterType('all')
    setFilterCategory('')
    setSortBy('date_desc')
  }

  const hasActiveFilters = filterType !== 'all' || filterCategory !== '' || sortBy !== 'date_desc'

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity onPress={() => openDetailsModal(item)}>
      <Card style={styles.transactionCard}>
        <CardContent style={styles.transactionContent}>
          <View style={styles.transactionLeft}>
            <View
              style={[
                styles.transactionIcon,
                { backgroundColor: item.type === 'income' ? colors.success + '20' : colors.danger + '20' },
              ]}
            >
              {item.type === 'income' ? (
                <Icons.ArrowUpRight size={18} color={colors.success} />
              ) : (
                <Icons.ArrowDownLeft size={18} color={colors.danger} />
              )}
            </View>
            <View>
              <Text style={styles.transactionDescription}>{item.description}</Text>
              <Text style={styles.transactionCategory}>{item.category?.name || 'Sem categoria'}</Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === 'income' ? colors.success : colors.danger },
              ]}
            >
              {item.type === 'income' ? '+' : '-'}
              {formatCurrency(item.amount)}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transações</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Icons.Plus size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar transação..."
          value={search}
          onChangeText={setSearch}
          leftElement={<Icons.Search size={18} />}
          rightElement={
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <FilterIcon size={18} color={hasActiveFilters ? colors.primary : colors.secondary} />
            </TouchableOpacity>
          }
        />
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Tipo:</Text>
            <View style={styles.filterOptions}>
              {(['all', 'expense', 'income'] as FilterType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterChip, filterType === t && styles.filterChipActive]}
                  onPress={() => setFilterType(t)}
                >
                  <Text style={[styles.filterChipText, filterType === t && styles.filterChipTextActive]}>
                    {t === 'all' ? 'Todos' : t === 'expense' ? 'Despesa' : 'Receita'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Ordenar:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'date_desc' && styles.filterChipActive]}
                onPress={() => setSortBy('date_desc')}
              >
                <Text style={[styles.filterChipText, sortBy === 'date_desc' && styles.filterChipTextActive]}>Mais recentes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'date_asc' && styles.filterChipActive]}
                onPress={() => setSortBy('date_asc')}
              >
                <Text style={[styles.filterChipText, sortBy === 'date_asc' && styles.filterChipTextActive]}>Mais antigas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'amount_desc' && styles.filterChipActive]}
                onPress={() => setSortBy('amount_desc')}
              >
                <Text style={[styles.filterChipText, sortBy === 'amount_desc' && styles.filterChipTextActive]}>Maior valor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'amount_asc' && styles.filterChipActive]}
                onPress={() => setSortBy('amount_asc')}
              >
                <Text style={[styles.filterChipText, sortBy === 'amount_asc' && styles.filterChipTextActive]}>Menor valor</Text>
              </TouchableOpacity>
            </View>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFilters}>
              <Text style={styles.clearFiltersText}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filteredAndSortedTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Carregando...' : 'Nenhuma transação encontrada'}
          </Text>
        }
      />

      <Modal visible={showModal} onClose={closeModal} title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}>
        <View style={styles.modalContent}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: colors.danger + '20', borderColor: colors.danger },
              ]}
              onPress={() => {
                setType('expense')
                setSelectedCategory('')
              }}
            >
              <Text style={[styles.typeButtonText, type === 'expense' && { color: colors.danger }]}>
                Despesa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && { backgroundColor: colors.success + '20', borderColor: colors.success },
              ]}
              onPress={() => {
                setType('income')
                setSelectedCategory('')
              }}
            >
              <Text style={[styles.typeButtonText, type === 'income' && { color: colors.success }]}>
                Receita
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Valor"
            placeholder="0,00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Input
            label="Descrição"
            placeholder="O que você comprou?"
            value={description}
            onChangeText={setDescription}
          />

          <Input
            label="Data"
            placeholder="YYYY-MM-DD"
            value={transactionDate}
            onChangeText={setTransactionDate}
          />

          <Text style={styles.label}>Categoria</Text>
          {loadingCategories ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && {
                      borderColor: category.color,
                      backgroundColor: category.color + '20',
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategory === category.id && { color: category.color },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Button
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={!amount || !description || !selectedCategory}
            style={styles.createButton}
          >
            {editingTransaction ? 'Salvar' : 'Salvar Transação'}
          </Button>
        </View>
      </Modal>

      <Modal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Detalhes da Transação">
        {selectedTransaction && (
          <View style={styles.detailsContent}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Tipo</Text>
              <View style={[styles.typeBadge, { backgroundColor: selectedTransaction.type === 'income' ? colors.success + '20' : colors.danger + '20' }]}>
                <Text style={[styles.typeBadgeText, { color: selectedTransaction.type === 'income' ? colors.success : colors.danger }]}>
                  {selectedTransaction.type === 'income' ? 'Receita' : 'Despesa'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Descrição</Text>
              <Text style={styles.detailsValue}>{selectedTransaction.description}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Valor</Text>
              <Text style={[styles.detailsAmount, { color: selectedTransaction.type === 'income' ? colors.success : colors.danger }]}>
                {selectedTransaction.type === 'income' ? '+' : '-'}
                {formatCurrency(selectedTransaction.amount)}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Data</Text>
              <Text style={styles.detailsValue}>{formatDate(selectedTransaction.date)}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Categoria</Text>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: selectedTransaction.category?.color || colors.primary }]} />
                <Text style={styles.detailsValue}>{selectedTransaction.category?.name || 'Sem categoria'}</Text>
              </View>
            </View>

            <View style={styles.detailsActions}>
              <Button onPress={() => { setShowDetailsModal(false); openEditModal(selectedTransaction); }} style={styles.editButton}>
                Editar
              </Button>
              <Button onPress={() => handleDelete(selectedTransaction)} variant="danger">
                Excluir
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  filterRow: {
    marginBottom: spacing.sm,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.muted,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.secondary,
  },
  filterChipTextActive: {
    color: colors.foreground,
  },
  clearFilters: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  clearFiltersText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  transactionCard: {
    marginBottom: spacing.sm,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDescription: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  transactionCategory: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  transactionDate: {
    fontSize: fontSize.xs,
    color: colors.secondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondary,
    paddingVertical: spacing.xl,
  },
  modalContent: {
    gap: spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.secondary,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '500',
  },
  loadingText: {
    color: colors.secondary,
    paddingVertical: spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  createButton: {
    marginTop: spacing.md,
  },
  detailsContent: {
    gap: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  detailsValue: {
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  detailsAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  editButton: {
    flex: 1,
  },
})
