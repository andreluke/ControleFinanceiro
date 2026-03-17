import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback, useEffect } from 'react'
import { useFocusEffect } from 'expo-router'
import { Input, Card, CardContent, Button, Modal } from '../../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { transactionService, categoryService, type Transaction, type Category } from '../../src/services'
import { Icons } from '../../src/components/icons'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

export default function TransactionsScreen() {
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTransactions = async () => {
    try {
      const data = await transactionService.list()
      setTransactions(data.data)
    } catch (err) {
      console.error('Error loading transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoryService.list()
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadTransactions()
    }, [])
  )

  const openModal = () => {
    loadCategories()
    setShowModal(true)
  }

  const handleCreateTransaction = async () => {
    if (!amount || !description || !selectedCategory) return
    
    setIsSubmitting(true)
    try {
      await transactionService.create({
        description,
        amount: parseFloat(amount.replace(',', '.')),
        type,
        categoryId: selectedCategory,
        date: new Date().toISOString(),
      })
      setShowModal(false)
      setType('expense')
      setAmount('')
      setDescription('')
      setSelectedCategory('')
      loadTransactions()
    } catch (err) {
      console.error('Error creating transaction:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCategories = categories

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity>
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
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Icons.Plus size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar transação..."
          value={search}
          onChangeText={setSearch}
          leftElement={<Icons.Search size={18} />}
        />
      </View>

      <FlatList
        data={filteredTransactions}
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

      <Modal visible={showModal} onClose={() => setShowModal(false)} title="Nova Transação">
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

          <Text style={styles.label}>Categoria</Text>
          {loadingCategories ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            <View style={styles.categoriesGrid}>
              {filteredCategories.map((category) => (
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
            onPress={handleCreateTransaction}
            isLoading={isSubmitting}
            disabled={!amount || !description || !selectedCategory}
            style={styles.createButton}
          >
            Salvar Transação
          </Button>
        </View>
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
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  transactionCard: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
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
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDescription: {
    fontSize: fontSize.md,
    color: colors.foreground,
    fontWeight: fontWeight.medium,
  },
  transactionCategory: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  transactionDate: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondary,
    paddingVertical: spacing.xxl,
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
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.secondary,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '500',
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  loadingText: {
    color: colors.secondary,
  },
  createButton: {
    marginTop: spacing.md,
  },
})
