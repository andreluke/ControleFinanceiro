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
  Button,
} from '../../src/components/ui'
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../src/theme/tokens'
import { summaryService, transactionService, type Summary, type Transaction } from '../../src/services'
import { useAuthStore } from '../../src/stores'
import { Icons } from '../../src/components/icons'

const TAB_BAR_HEIGHT = 60

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()

  const loadData = async () => {
    try {
      const [summaryData, transactionsData] = await Promise.all([
        summaryService.get(),
        transactionService.list({ limit: 5 }),
      ])
      setSummary(summaryData)
      setTransactions(transactionsData.data)
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
          <Text style={styles.date}>{currentMonth}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.kpiScroll}
          contentContainerStyle={styles.kpiContent}
        >
          <Card style={styles.kpiCard}>
            <CardContent>
              <Text style={styles.kpiLabel}>Saldo Total</Text>
              <Text style={[styles.kpiValue, { color: colors.success }]}>
                {summary ? formatCurrency(summary.totalBalance) : '...'}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.kpiCard}>
            <CardContent>
              <Text style={styles.kpiLabel}>Receitas</Text>
              <Text style={[styles.kpiValue, { color: colors.success }]}>
                {summary ? formatCurrency(summary.monthlyIncome) : '...'}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.kpiCard}>
            <CardContent>
              <Text style={styles.kpiLabel}>Despesas</Text>
              <Text style={[styles.kpiValue, { color: colors.danger }]}>
                {summary ? formatCurrency(summary.monthlyExpense) : '...'}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.kpiCard}>
            <CardContent>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <Button variant="ghost" size="sm">Ver todas</Button>
          </View>

          <Card>
            <CardContent style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={styles.transactionItem}
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
                    <View>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionCategory}>
                        {transaction.category?.name || 'Sem categoria'}
                      </Text>
                    </View>
                  </View>
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
                </View>
              ))}
              {transactions.length === 0 && (
                <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
              )}
            </CardContent>
          </Card>
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
    paddingTop: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  kpiScroll: {
    paddingHorizontal: spacing.md,
  },
  kpiContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  kpiCard: {
    minWidth: 140,
  },
  kpiLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  kpiValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  section: {
    padding: spacing.md,
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
  },
  transactionsList: {
    paddingHorizontal: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
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
  transactionAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondary,
    paddingVertical: spacing.lg,
  },
})
