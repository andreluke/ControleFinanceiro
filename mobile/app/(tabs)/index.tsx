import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  Card,
  CardContent,
} from '../../src/components/ui'
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../src/theme/tokens'
import { summaryService, transactionService, type Summary, type Transaction, type MonthlySummary, type CategorySummary } from '../../src/services'
import { useAuthStore } from '../../src/stores'
import { Icons } from '../../src/components/icons'
import { PieChart, BarChart, LineChart } from '../../src/components/charts'

const TAB_BAR_HEIGHT = 60

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([])
  const [categoryExpenses, setCategoryExpenses] = useState<CategorySummary[]>([])
  const [categoryIncome, setCategoryIncome] = useState<CategorySummary[]>([])
  const insets = useSafeAreaInsets()
  const { user, checkAuth } = useAuthStore()

  const loadData = async () => {
    try {
      await checkAuth()
      const [summaryData, transactionsData, monthlyDataResult, expensesData, incomeData] = await Promise.all([
        summaryService.get(),
        transactionService.list({ limit: 5 }),
        summaryService.getMonthly(6),
        summaryService.getByCategory(undefined, 'expense'),
        summaryService.getByCategory(undefined, 'income'),
      ])
      setSummary(summaryData)
      setTransactions(transactionsData.data)
      setMonthlyData(monthlyDataResult)
      setCategoryExpenses(expensesData)
      setCategoryIncome(incomeData)
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {user?.name || 'Usuário'}</Text>
          <Text style={styles.date}>{capitalizeFirst(currentMonth)}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.kpiScroll}
          contentContainerStyle={styles.kpiContent}
        >
          <Card style={styles.kpiCard}>
            <CardContent style={styles.kpiContentInner}>
              <View style={styles.kpiIconContainer}>
                <Icons.Wallet size={20} color={colors.primary} />
              </View>
              <Text style={styles.kpiLabel}>Saldo Total</Text>
              <Text style={[styles.kpiValue, { color: summary && summary.totalBalance >= 0 ? colors.success : colors.danger }]}>
                {summary ? formatCurrency(summary.totalBalance) : '...'}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.kpiCard}>
            <CardContent style={styles.kpiContentInner}>
              <View style={[styles.kpiIconContainer, { backgroundColor: colors.success + '20' }]}>
                <Icons.ArrowUpRight size={20} color={colors.success} />
              </View>
              <Text style={styles.kpiLabel}>Receitas</Text>
              <Text style={[styles.kpiValue, { color: colors.success }]}>
                {summary ? formatCurrency(summary.monthlyIncome) : '...'}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.kpiCard}>
            <CardContent style={styles.kpiContentInner}>
              <View style={[styles.kpiIconContainer, { backgroundColor: colors.danger + '20' }]}>
                <Icons.ArrowDownLeft size={20} color={colors.danger} />
              </View>
              <Text style={styles.kpiLabel}>Despesas</Text>
              <Text style={[styles.kpiValue, { color: colors.danger }]}>
                {summary ? formatCurrency(summary.monthlyExpense) : '...'}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.kpiCard}>
            <CardContent style={styles.kpiContentInner}>
              <View style={[styles.kpiIconContainer, { backgroundColor: colors.warning + '20' }]}>
                <Icons.TrendingUp size={20} color={colors.warning} />
              </View>
              <Text style={styles.kpiLabel}>Variação</Text>
              <Text
                style={[
                  styles.kpiValue,
                  {
                    color:
                      summary && summary.monthlyChange < 0
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                {summary ? `${summary.monthlyChange}%` : '...'}
              </Text>
            </CardContent>
          </Card>
        </ScrollView>

        {monthlyData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Receitas vs Despesas</Text>
            </View>
            <BarChart data={monthlyData} />
          </View>
        )}

        {categoryExpenses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
            </View>
            <PieChart data={categoryExpenses} />
          </View>
        )}

        {categoryIncome.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Receitas por Categoria</Text>
            </View>
            <PieChart data={categoryIncome} innerRadius={50} />
          </View>
        )}

        {monthlyData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Evolução do Saldo</Text>
            </View>
            <LineChart
              data={monthlyData.map((m) => ({
                x: m.month,
                y: m.income - m.expense,
              }))}
              color={summary && summary.totalBalance >= 0 ? colors.success : colors.danger}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
          </View>

          {transactions.length > 0 ? (
            <Card style={styles.transactionsCard}>
              <CardContent style={styles.transactionsList}>
                {transactions.map((transaction, index) => (
                  <View
                    key={transaction.id}
                    style={[
                      styles.transactionItem,
                      index === transactions.length - 1 && styles.transactionItemLast,
                    ]}
                  >
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              transaction.type === 'income'
                                ? colors.success + '20'
                                : colors.danger + '20',
                          },
                        ]}
                      >
                        {transaction.type === 'income' ? (
                          <Icons.ArrowUpRight size={18} color={colors.success} />
                        ) : (
                          <Icons.ArrowDownLeft size={18} color={colors.danger} />
                        )}
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription} numberOfLines={1}>
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionCategory}>
                            {transaction.category?.name || 'Sem categoria'}
                          </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color:
                              transaction.type === 'income'
                                ? colors.success
                                : colors.danger,
                          },
                        ]}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <CardContent style={styles.emptyContent}>
                <View style={styles.emptyIconContainer}>
                  <Icons.Receipt size={32} color={colors.muted} />
                </View>
                <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
                <Text style={styles.emptySubtext}>Suas transações aparecerão aqui</Text>
              </CardContent>
            </Card>
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
  scrollContent: {
    paddingTop: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  date: {
    fontSize: fontSize.md,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  kpiScroll: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  kpiContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  kpiCard: {
    minWidth: 180,
    flex: 1,
  },
  kpiContentInner: {
    alignItems: 'flex-start',
  },
  kpiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  kpiLabel: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
    textAlign: 'center'
  },
  transactionsCard: {
    overflow: 'hidden',
  },
  transactionsList: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionItemLast: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
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
  emptyCard: {
    paddingVertical: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.muted + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
})
