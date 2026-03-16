import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { Card, CardContent, Progress } from '../../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { budgetService, type Budget } from '../../src/services'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const loadBudgets = async () => {
    try {
      const data = await budgetService.list()
      setBudgets(data)
    } catch (err) {
      console.error('Error loading budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadBudgets()
    }, [])
  )

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)
  const totalRemaining = totalBudgeted - totalSpent

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Orçamentos</Text>
        <Text style={styles.subtitle}>{currentMonth}</Text>
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
          ) : budgets.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum orçamento criado</Text>
          ) : (
            budgets.map((budget) => {
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
                      <Text style={styles.budgetSpent}>
                        {formatCurrency(budget.spent || 0)}
                      </Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
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
  budgetProgress: {
    marginBottom: spacing.sm,
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
})
