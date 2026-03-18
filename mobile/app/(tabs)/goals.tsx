import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { Card, CardContent, Progress, Button, Input, Modal, DatePickerInput } from '../../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { goalService, type Goal, type GoalContribution } from '../../src/services'
import { Icons } from '../../src/components/icons'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const COLORS = [
  '#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316',
]

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'deposit' | 'withdraw' | 'history'>('create')
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [loadingContributions, setLoadingContributions] = useState(false)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadGoals = async () => {
    try {
      const data = await goalService.list()
      if (Array.isArray(data)) {
        setGoals(data)
      }
    } catch (err) {
      console.error('Error loading goals:', err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGoals()
    }, [])
  )

  const openCreateModal = () => {
    setModalMode('create')
    setName('')
    setDescription('')
    setTargetAmount('')
    setDeadline('')
    setSelectedColor(COLORS[0])
    setShowModal(true)
  }

  const openEditModal = (goal: Goal) => {
    setModalMode('edit')
    setEditingGoal(goal)
    setName(goal.name)
    setDescription(goal.description || '')
    setTargetAmount(goal.targetAmount.toString())
    setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '')
    setSelectedColor(goal.color || COLORS[0])
    setShowModal(true)
  }

  const openDepositModal = (goal: Goal) => {
    setModalMode('deposit')
    setEditingGoal(goal)
    setAmount('')
    setShowModal(true)
  }

  const openWithdrawModal = (goal: Goal) => {
    setModalMode('withdraw')
    setEditingGoal(goal)
    setAmount('')
    setShowModal(true)
  }

  const openHistoryModal = async (goal: Goal) => {
    setModalMode('history')
    setEditingGoal(goal)
    setLoadingContributions(true)
    setShowModal(true)
    try {
      const data = await goalService.listContributions(goal.id)
      setContributions(data)
    } catch (err) {
      console.error('Error loading contributions:', err)
    } finally {
      setLoadingContributions(false)
    }
  }

  const removeContribution = (contribution: GoalContribution) => {
    const typeLabel = contribution.type === 'deposit' ? 'depósito' : 'saque'
    Alert.alert(
      'Remover Movimentação',
      `Tem certeza que deseja remover este ${typeLabel} de ${formatCurrency(contribution.amount)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalService.removeContribution(contribution.id)
              loadGoals()
              if (editingGoal) {
                const data = await goalService.listContributions(editingGoal.id)
                setContributions(data)
              }
            } catch (err) {
              console.error('Error removing contribution:', err)
            }
          },
        },
      ]
    )
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingGoal(null)
    setName('')
    setDescription('')
    setTargetAmount('')
    setDeadline('')
    setAmount('')
    setContributions([])
  }

  const handleCreate = async () => {
    if (!name || !targetAmount) return
    
    setIsSubmitting(true)
    try {
      await goalService.create({
        name,
        description: description || undefined,
        targetAmount: parseFloat(targetAmount.replace(',', '.')),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        color: selectedColor,
      })
      closeModal()
      loadGoals()
    } catch (err) {
      console.error('Error creating goal:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingGoal || !name || !targetAmount) return
    
    setIsSubmitting(true)
    try {
      await goalService.update(editingGoal.id, {
        name,
        description: description || undefined,
        targetAmount: parseFloat(targetAmount.replace(',', '.')),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        color: selectedColor,
      })
      closeModal()
      loadGoals()
    } catch (err) {
      console.error('Error updating goal:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeposit = async () => {
    if (!editingGoal || !amount) return
    
    setIsSubmitting(true)
    try {
      await goalService.contribute(editingGoal.id, parseFloat(amount.replace(',', '.')))
      closeModal()
      loadGoals()
    } catch (err) {
      console.error('Error depositing to goal:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!editingGoal || !amount) return
    
    setIsSubmitting(true)
    try {
      await goalService.withdraw(editingGoal.id, parseFloat(amount.replace(',', '.')))
      closeModal()
      loadGoals()
    } catch (err) {
      console.error('Error withdrawing from goal:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (goal: Goal) => {
    Alert.alert(
      'Excluir Meta',
      `Tem certeza que deseja excluir a meta "${goal.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalService.delete(goal.id)
              loadGoals()
            } catch (err) {
              console.error('Error deleting goal:', err)
            }
          },
        },
      ]
    )
  }

  const goalList = Array.isArray(goals) ? goals : []
  const totalSaved = goalList.reduce((sum, g) => sum + (g.currentAmount || 0), 0)
  const totalTarget = goalList.reduce((sum, g) => sum + (g.targetAmount || 0), 0)
  const totalRemaining = totalTarget - totalSaved
  const completedGoals = goalList.filter(g => g.currentAmount >= g.targetAmount && g.isActive).length
  const activeGoals = goalList.filter(g => g.isActive).length

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null
    const date = new Date(deadline)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Metas</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Icons.Plus size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ gap: spacing.sm }}>
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <CardContent>
              <Icons.Wallet size={20} color={colors.success} />
              <Text style={styles.kpiLabel}>Total Economizado</Text>
              <Text style={[styles.kpiValue, { color: colors.success }]}>
                {loading ? '...' : formatCurrency(totalSaved)}
              </Text>
            </CardContent>
          </Card>
          <Card style={styles.kpiCard}>
            <CardContent>
              <Icons.TrendingUp size={20} color={colors.primary} />
              <Text style={styles.kpiLabel}>Meta Total</Text>
              <Text style={styles.kpiValue}>
                {loading ? '...' : formatCurrency(totalTarget)}
              </Text>
            </CardContent>
          </Card>
        </View>

        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <CardContent>
              <Icons.Target size={20} color={colors.warning} />
              <Text style={styles.kpiLabel}>Faltante</Text>
              <Text style={[styles.kpiValue, { color: colors.warning }]}>
                {loading ? '...' : formatCurrency(totalRemaining)}
              </Text>
            </CardContent>
          </Card>
          <Card style={styles.kpiCard}>
            <CardContent>
              <Icons.CheckCircle size={20} color={colors.success} />
              <Text style={styles.kpiLabel}>Concluídas</Text>
              <Text style={styles.kpiValue}>
                {loading ? '...' : `${completedGoals}/${activeGoals}`}
              </Text>
            </CardContent>
          </Card>
        </View>

        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Minhas Metas</Text>

          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : goalList.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma meta criada</Text>
          ) : (
            goalList.map((goal) => {
              const percentage = goal.targetAmount > 0 
                ? (goal.currentAmount / goal.targetAmount) * 100 
                : 0
              const isCompleted = percentage >= 100
              const daysRemaining = getDaysRemaining(goal.deadline)
              const goalColor = goal.color || colors.primary

              return (
                <Card key={goal.id} style={[styles.goalCard, isCompleted && styles.goalCardCompleted]}>
                  <CardContent>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalTitleRow}>
                        <View style={[styles.goalIcon, { backgroundColor: goalColor + '20' }]}>
                          <Icons.Target size={18} color={goalColor} />
                        </View>
                        <View style={styles.goalInfo}>
                          <Text style={styles.goalName}>{goal.name}</Text>
                          {goal.description && (
                            <Text style={styles.goalDescription} numberOfLines={1}>
                              {goal.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.goalActions}>
                        <TouchableOpacity 
                          onPress={() => openDepositModal(goal)} 
                          style={styles.actionButton}
                        >
                          <Icons.ArrowUpRight size={18} color={colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => openWithdrawModal(goal)} 
                          style={styles.actionButton}
                        >
                          <Icons.ArrowDownLeft size={18} color={colors.warning} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => openHistoryModal(goal)} 
                          style={styles.actionButton}
                        >
                          <Icons.History size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => openEditModal(goal)} 
                          style={styles.actionButton}
                        >
                          <Icons.Pencil size={18} color={colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(goal)} 
                          style={styles.actionButton}
                        >
                          <Icons.Trash size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Progress
                      value={Math.min(percentage, 100)}
                      max={100}
                      color={isCompleted ? colors.success : goalColor}
                      style={styles.progressBar}
                    />

                    <View style={styles.goalFooter}>
                      <View>
                        <Text style={styles.goalCurrent}>
                          {formatCurrency(goal.currentAmount)}
                        </Text>
                        <Text style={styles.goalTarget}>
                          de {formatCurrency(goal.targetAmount)}
                        </Text>
                      </View>
                      <View style={styles.goalStats}>
                        <Text style={[styles.goalPercentage, isCompleted && { color: colors.success }]}>
                          {percentage.toFixed(0)}%
                        </Text>
                        {daysRemaining !== null && (
                          <Text style={[
                            styles.goalDays,
                            daysRemaining < 0 && { color: colors.danger },
                            daysRemaining >= 0 && daysRemaining <= 7 && { color: colors.warning },
                          ]}>
                            {daysRemaining < 0 
                              ? 'Prazo excedido'
                              : `${daysRemaining} dias`
                            }
                          </Text>
                        )}
                      </View>
                    </View>
                  </CardContent>
                </Card>
              )
            })
          )}
        </View>
      </ScrollView>

      <Modal 
        visible={showModal} 
        onClose={closeModal} 
        title={
          modalMode === 'create' ? 'Nova Meta' : 
          modalMode === 'edit' ? 'Editar Meta' :
          modalMode === 'history' ? `Histórico: ${editingGoal?.name}` :
          modalMode === 'deposit' ? `Depositar: ${editingGoal?.name}` :
          `Sacar: ${editingGoal?.name}`
        }
      >
        <View style={styles.modalContent}>
          {modalMode === 'history' ? (
            <View style={styles.historyContainer}>
              {loadingContributions ? (
                <Text style={styles.loadingText}>Carregando...</Text>
              ) : contributions.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma movimentação</Text>
              ) : (
                <ScrollView style={styles.historyList}>
                  {contributions.map((contribution) => {
                    const isDeposit = contribution.type === 'deposit'
                    return (
                      <View key={contribution.id} style={styles.historyItem}>
                        <View style={styles.historyItemInfo}>
                          <Text style={[styles.historyItemAmount, { color: isDeposit ? colors.success : colors.warning }]}>
                            {isDeposit ? '+' : '-'}{formatCurrency(contribution.amount)}
                          </Text>
                          <Text style={styles.historyItemDate}>
                            {isDeposit ? 'Depósito' : 'Saque'} • {new Date(contribution.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => removeContribution(contribution)}
                          style={styles.historyItemAction}
                        >
                          <Icons.Trash size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </ScrollView>
              )}
            </View>
          ) : modalMode === 'deposit' || modalMode === 'withdraw' ? (
            <>
              <View style={styles.contributeInfo}>
                <Text style={styles.contributeLabel}>Valor atual</Text>
                <Text style={styles.contributeCurrent}>
                  {formatCurrency(editingGoal?.currentAmount || 0)}
                </Text>
                <Text style={styles.contributeTarget}>
                  Meta: {formatCurrency(editingGoal?.targetAmount || 0)}
                </Text>
              </View>
              <Input
                label="Valor"
                placeholder="0,00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Button
                onPress={modalMode === 'deposit' ? handleDeposit : handleWithdraw}
                isLoading={isSubmitting}
                disabled={!amount}
                style={[styles.createButton, { backgroundColor: modalMode === 'deposit' ? colors.success : colors.warning }]}
              >
                {modalMode === 'deposit' ? 'Depositar' : 'Sacar'}
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Nome"
                placeholder="Ex: Reserva de emergência"
                value={name}
                onChangeText={setName}
              />
              <Input
                label="Descrição (opcional)"
                placeholder="Ex: Para viajei"
                value={description}
                onChangeText={setDescription}
              />
              <Input
                label="Valor alvo"
                placeholder="0,00"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
              />
              <DatePickerInput
                label="Prazo (opcional)"
                value={deadline}
                onChange={setDeadline}
                placeholder="Selecionar data"
              />
              
              <Text style={styles.label}>Cor</Text>
              <View style={styles.colorPicker}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <Button
                onPress={modalMode === 'create' ? handleCreate : handleUpdate}
                isLoading={isSubmitting}
                disabled={!name || !targetAmount}
                style={styles.createButton}
              >
                {modalMode === 'create' ? 'Criar Meta' : 'Salvar'}
              </Button>
            </>
          )}
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
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  kpiCard: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  kpiValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  goalsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  goalCard: {
    marginBottom: spacing.sm,
  },
  goalCardCompleted: {
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  goalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
  },
  goalDescription: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  goalActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  progressBar: {
    marginBottom: spacing.sm,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  goalCurrent: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  goalTarget: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  goalStats: {
    alignItems: 'flex-end',
  },
  goalPercentage: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  goalDays: {
    fontSize: fontSize.xs,
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
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.foreground,
  },
  createButton: {
    marginTop: spacing.md,
  },
  historyContainer: {
    maxHeight: 300,
  },
  historyList: {
    maxHeight: 280,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.success,
  },
  historyItemDate: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  historyItemAction: {
    padding: spacing.xs,
  },
  contributeInfo: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  contributeLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  contributeCurrent: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  contributeTarget: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
})
