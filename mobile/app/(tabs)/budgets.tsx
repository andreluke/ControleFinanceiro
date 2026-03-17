import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback, useEffect } from 'react'
import { useFocusEffect } from 'expo-router'
import { Card, CardContent, Progress, Button, Input, Modal } from '../../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { budgetService, categoryService, type Budget, type Category } from '../../src/services'
import { Icons } from '../../src/components/icons'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const loadBudgets = async () => {
    try {
      const data = await budgetService.list()
      if (Array.isArray(data)) {
        setBudgets(data)
      }
    } catch (err) {
      console.error('Error loading budgets:', err)
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
      loadBudgets()
    }, [])
  )

  const openModal = () => {
    loadCategories()
    setShowModal(true)
  }

  const handleModalSubmit = () => {
    if (editingBudget) {
      handleUpdateBudget()
    } else {
      handleCreateBudget()
    }
  }

  const handleCreateBudget = async () => {
    if (!selectedCategory || !amount) return
    
    setIsSubmitting(true)
    try {
      const currentDate = new Date()
      await budgetService.create({
        categoryId: selectedCategory,
        amount: parseFloat(amount.replace(',', '.')),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      })
      setShowModal(false)
      setSelectedCategory('')
      setAmount('')
      loadBudgets()
    } catch (err) {
      console.error('Error creating budget:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget)
    setSelectedCategory(budget.categoryId)
    setAmount(budget.amount.toString())
    setShowModal(true)
  }

  const handleUpdateBudget = async () => {
    if (!editingBudget || !amount) return
    
    setIsSubmitting(true)
    try {
      await budgetService.update(editingBudget.id, parseFloat(amount.replace(',', '.')))
      setShowModal(false)
      setEditingBudget(null)
      setSelectedCategory('')
      setAmount('')
      loadBudgets()
    } catch (err) {
      console.error('Error updating budget:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Excluir Orçamento',
      `Tem certeza que deseja excluir o orçamento de "${budget.category?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await budgetService.delete(budget.id)
              loadBudgets()
            } catch (err) {
              console.error('Error deleting budget:', err)
            }
          },
        },
      ]
    )
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBudget(null)
    setSelectedCategory('')
    setAmount('')
  }

  const budgetList = Array.isArray(budgets) ? budgets : []
  const totalBudgeted = budgetList.reduce((sum, b) => sum + (b?.amount || 0), 0)
  const totalSpent = budgetList.reduce((sum, b) => sum + (b?.spent || 0), 0)
  const totalRemaining = totalBudgeted - totalSpent

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orçamentos</Text>
          <Text style={styles.subtitle}>{currentMonth}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Icons.Plus size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <CardContent>
              <Text style={styles.summaryLabel}>Total Orçado</Text>
              <Text style={styles.summaryValue}>{loading ? '...' : formatCurrency(totalBudgeted)}</Text>
            </CardContent>
          </Card>
          <Card style={styles.summaryCard}>
            <CardContent>
              <Text style={styles.summaryLabel}>Total Gasto</Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                {loading ? '...' : formatCurrency(totalSpent)}
              </Text>
            </CardContent>
          </Card>
        </View>

        <Card style={styles.remainingCard}>
          <CardContent>
            <Text style={styles.remainingLabel}>Restante</Text>
            <Text
              style={[
                styles.remainingValue,
                { color: totalRemaining >= 0 ? colors.success : colors.danger },
              ]}
            >
              {loading ? '...' : formatCurrency(totalRemaining)}
            </Text>
          </CardContent>
        </Card>

        <View style={styles.budgetsSection}>
          <Text style={styles.sectionTitle}>Por Categoria</Text>

          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : budgetList.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum orçamento criado</Text>
          ) : (
            budgetList.map((budget) => {
              const percentage = totalBudgeted > 0 ? (budget.spent / budget.amount) * 100 : 0
              const isOverBudget = percentage > 100
              const isNearLimit = percentage >= 80 && percentage <= 100
              const categoryColor = budget.category?.color || colors.primary

              return (
                <Card key={budget.id} style={styles.budgetCard}>
                  <CardContent>
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetCategory}>
                        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                        <Text style={styles.budgetCategoryName}>{budget.category?.name || 'Sem categoria'}</Text>
                      </View>
                      <View style={styles.budgetActions}>
                        <TouchableOpacity onPress={() => openEditModal(budget)} style={styles.actionButton}>
                          <Icons.Pencil size={18} color={colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteBudget(budget)} style={styles.actionButton}>
                          <Icons.Trash size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Progress
                      value={Math.min(percentage, 100)}
                      max={100}
                      color={isOverBudget ? colors.danger : isNearLimit ? '#F59E0B' : categoryColor}
                      style={styles.progressBar}
                    />

                    <View style={styles.budgetFooter}>
                      <Text style={styles.budgetPercentage}>
                        {percentage.toFixed(0)}%
                      </Text>
                      <Text style={styles.budgetTotal}>
                        de {formatCurrency(budget.amount)}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              )
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={showModal} onClose={closeModal} title={editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}>
        <View style={styles.modalContent}>
          {!editingBudget && (
            <>
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
            </>
          )}

          <Input
            label="Valor"
            placeholder="0,00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Button
            onPress={handleModalSubmit}
            isLoading={isSubmitting}
            disabled={!amount}
            style={styles.createButton}
          >
            {editingBudget ? 'Salvar' : 'Criar Orçamento'}
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
    paddingBottom: spacing.md,
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
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  remainingCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  remainingLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  remainingValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  budgetsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  budgetCard: {
    marginBottom: spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budgetActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  budgetCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  budgetCategoryName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  progressBar: {
    marginBottom: spacing.sm,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetPercentage: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  budgetSpent: {
    fontSize: fontSize.sm,
    color: colors.foreground,
  },
  budgetTotal: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.secondary,
    paddingVertical: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondary,
    paddingVertical: spacing.lg,
  },
  modalContent: {
    gap: spacing.md,
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
  categoryName: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  createButton: {
    marginTop: spacing.md,
  },
})
