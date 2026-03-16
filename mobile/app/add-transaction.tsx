import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { Button, Input, Card, CardContent } from '../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../src/theme/tokens'
import { transactionSchema, type TransactionInput } from '../src/validators'
import { transactionService, categoryService, type Category } from '../src/services'

export default function AddTransactionScreen() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString(),
    },
  })

  const type = watch('type')
  const selectedCategory = watch('category')

  useEffect(() => {
    loadCategories()
  }, [])

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

  const onSubmit = async (data: TransactionInput) => {
    try {
      setError('')
      const amount = parseFloat(data.amount.replace(',', '.'))
      await transactionService.create({
        description: data.description,
        amount,
        type: data.type,
        date: data.date,
        categoryId: data.category,
      })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação')
    }
  }

  const filteredCategories = categories.filter(c => c.type === type)

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nova Transação</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && { backgroundColor: colors.danger + '20', borderColor: colors.danger },
            ]}
            onPress={() => {
              setValue('type', 'expense')
              setValue('category', '')
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'expense' && { color: colors.danger },
              ]}
            >
              Despesa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && { backgroundColor: colors.success + '20', borderColor: colors.success },
            ]}
            onPress={() => {
              setValue('type', 'income')
              setValue('category', '')
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'income' && { color: colors.success },
              ]}
            >
              Receita
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.amountCard}>
          <CardContent style={styles.amountContent}>
            <Text style={styles.currencySymbol}>R$</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="0,00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  placeholderTextColor={colors.muted}
                  error={errors.amount?.message}
                />
              )}
            />
          </CardContent>
        </Card>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Descrição"
                placeholder="O que você comprou?"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
              />
            )}
          />

          <Text style={styles.label}>Categoria</Text>
          {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
          
          {loadingCategories ? (
            <ActivityIndicator color={colors.primary} />
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
                  onPress={() => setValue('category', category.id)}
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

          <Controller
            control={control}
            name="date"
            render={({ field: { value } }) => (
              <Input
                label="Data"
                placeholder="Selecione a data"
                value={new Date(value).toLocaleDateString('pt-BR')}
                editable={false}
                error={errors.date?.message}
              />
            )}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          onPress={handleSubmit(onSubmit)} 
          style={styles.saveButton}
          isLoading={isSubmitting}
          size="lg"
        >
          Salvar Transação
        </Button>
      </View>
    </KeyboardAvoidingView>
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
  cancelButton: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  amountCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  amountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  currencySymbol: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.secondary,
  },
  amountInput: {
    flex: 0,
    fontSize: 48,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    minWidth: 200,
    height: 60,
  },
  form: {
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  errorContainer: {
    backgroundColor: colors.danger + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  saveButton: {
    width: '100%',
  },
})
