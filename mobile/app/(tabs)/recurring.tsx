import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { Input, Card, CardContent, Button, Modal } from '../../src/components/ui'
import { DatePickerInput } from '../../src/components/ui/DatePicker'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { recurringService, categoryService, paymentMethodService, type RecurringTransaction, type Category, type PaymentMethod } from '../../src/services'
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

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
  custom: 'Personalizado',
}

export default function RecurringScreen() {
  const router = useRouter()
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null)

  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const [recData, catData, payData] = await Promise.all([
        recurringService.list(),
        categoryService.list(),
        paymentMethodService.list(),
      ])
      setRecurring(recData)
      setCategories(catData)
      setPaymentMethods(payData)
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

  const openModal = (item?: RecurringTransaction) => {
    if (item) {
      setEditingItem(item)
      setType(item.type)
      setAmount(item.amount.toString())
      setDescription(item.description)
      setSelectedCategory(item.categoryId || '')
      setSelectedPaymentMethod(item.paymentMethodId || '')
      setFrequency(item.frequency)
      setStartDate(new Date(item.date).toISOString().split('T')[0])
    } else {
      setEditingItem(null)
      setType('expense')
      setAmount('')
      setDescription('')
      setSelectedCategory('')
      setSelectedPaymentMethod('')
      setFrequency('monthly')
      setStartDate(new Date().toISOString().split('T')[0])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const handleSubmit = async () => {
    if (!amount || !description) return

    setIsSubmitting(true)
    try {
      const data = {
        description,
        amount: parseFloat(amount.replace(',', '.')),
        type,
        categoryId: selectedCategory || undefined,
        paymentMethodId: selectedPaymentMethod || undefined,
        date: new Date(startDate).toISOString(),
        frequency,
      }

      if (editingItem) {
        await recurringService.update(editingItem.id, data)
      } else {
        await recurringService.create(data)
      }
      closeModal()
      loadData()
    } catch (err) {
      console.error('Error saving:', err)
      Alert.alert('Erro', 'Não foi possível salvar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (item: RecurringTransaction) => {
    try {
      await recurringService.toggle(item.id)
      loadData()
    } catch (err) {
      console.error('Error toggling:', err)
    }
  }

  const handleDelete = (item: RecurringTransaction) => {
    Alert.alert(
      'Excluir',
      `Tem certeza que deseja excluir "${item.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await recurringService.delete(item.id)
              loadData()
            } catch (err) {
              console.error('Error deleting:', err)
              Alert.alert('Erro', 'Não foi possível excluir')
            }
          },
        },
      ]
    )
  }

  const handleProcess = async (item: RecurringTransaction) => {
    try {
      await recurringService.process(item.id)
      Alert.alert('Sucesso', 'Transação processada com sucesso!')
      loadData()
    } catch (err) {
      console.error('Error processing:', err)
      Alert.alert('Erro', 'Não foi possível processar')
    }
  }

  const renderItem = ({ item }: { item: RecurringTransaction }) => (
    <Card style={[styles.card, !item.isActive && styles.cardInactive]}>
      <CardContent>
        <View style={styles.row}>
          <View style={styles.info}>
            <View
              style={[
                styles.icon,
                { backgroundColor: item.type === 'income' ? colors.success + '20' : colors.danger + '20' },
              ]}
            >
              {item.type === 'income' ? (
                <Icons.ArrowUpRight size={18} color={colors.success} />
              ) : (
                <Icons.ArrowDownLeft size={18} color={colors.danger} />
              )}
            </View>
            <View style={styles.details}>
              <Text style={[styles.name, !item.isActive && styles.textInactive]}>{item.description}</Text>
              <Text style={styles.frequency}>
                {frequencyLabels[item.frequency]}
                {(item as any).paymentMethod?.name && ` • ${(item as any).paymentMethod.name}`}
                {(item as any).category?.name && ` • ${(item as any).category.name}`}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleProcess(item)} style={styles.actionButton}>
              <Icons.Repeat size={18} color={colors.primary} />
            </TouchableOpacity>
            <Switch
              value={item.isActive}
              onValueChange={() => handleToggle(item)}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.danger }]}>
            {item.type === 'income' ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
              <Icons.Pencil size={16} color={colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
              <Icons.Trash size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </CardContent>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icons.ChevronRight size={24} color={colors.foreground} />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Recorrentes</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Icons.Plus size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recurring}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Carregando...' : 'Nenhuma transação recorrente'}
          </Text>
        }
      />

      <Modal visible={showModal} onClose={closeModal} title={editingItem ? 'Editar Recorrente' : 'Nova Recorrente'}>
        <View style={styles.modalContent}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: colors.danger + '20', borderColor: colors.danger },
              ]}
              onPress={() => setType('expense')}
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
              onPress={() => setType('income')}
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
            placeholder="Descrição"
            value={description}
            onChangeText={setDescription}
          />

          <DatePickerInput
            label="Data de início"
            value={startDate}
            onChange={setStartDate}
            placeholder="Selecionar data"
          />

          <Text style={styles.label}>Frequência</Text>
          <View style={styles.frequencyGrid}>
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.frequencyButton, frequency === f && styles.frequencyButtonActive]}
                onPress={() => setFrequency(f)}
              >
                <Text style={[styles.frequencyText, frequency === f && styles.frequencyTextActive]}>
                  {frequencyLabels[f]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Categoria (opcional)</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && {
                    borderColor: cat.color,
                    backgroundColor: cat.color + '20',
                  },
                ]}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              >
                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === cat.id && { color: cat.color },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Forma de Pagamento (opcional)</Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedPaymentMethod && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedPaymentMethod('')}
            >
              <Text style={[styles.categoryName, !selectedPaymentMethod && styles.categoryNameActive]}>
                Nenhuma
              </Text>
            </TouchableOpacity>
            {paymentMethods.map((pm) => (
              <TouchableOpacity
                key={pm.id}
                style={[
                  styles.categoryButton,
                  selectedPaymentMethod === pm.id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedPaymentMethod(pm.id)}
              >
                <Text
                  style={[
                    styles.categoryName,
                    selectedPaymentMethod === pm.id && styles.categoryNameActive,
                  ]}
                >
                  {pm.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={!amount || !description}
            style={styles.submitButton}
          >
            {editingItem ? 'Salvar' : 'Criar'}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardInactive: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  textInactive: {
    textDecorationLine: 'line-through',
  },
  frequency: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  frequencyButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.muted,
  },
  frequencyButtonActive: {
    backgroundColor: colors.primary,
  },
  frequencyText: {
    fontSize: fontSize.xs,
    color: colors.secondary,
  },
  frequencyTextActive: {
    color: colors.foreground,
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
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
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
  categoryNameActive: {
    color: colors.primary,
  },
  submitButton: {
    marginTop: spacing.md,
  },
})
