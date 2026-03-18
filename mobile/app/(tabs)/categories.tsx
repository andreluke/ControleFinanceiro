import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback, useRef } from 'react'
import { useFocusEffect } from 'expo-router'
import { Card, CardContent, Button, Input, Modal } from '../../src/components/ui'
import { ColorPicker } from '../../src/components/ui/ColorPicker'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { categoryService, type Category } from '../../src/services/categories'
import { subcategoryService, type Subcategory } from '../../src/services/subcategories'
import { paymentMethodService, type PaymentMethod } from '../../src/services/paymentMethods'
import { Icons, CardIcon } from '../../src/components/icons'

const { width } = Dimensions.get('window')

type TabType = 'categories' | 'subcategories' | 'paymentMethods'

export default function CategoriesTabsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('categories')
  const scrollViewRef = useRef<ScrollView>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const [cats, subs, pays] = await Promise.all([
        categoryService.list(),
        subcategoryService.list(),
        paymentMethodService.list(),
      ])
      setCategories(cats)
      setSubcategories(subs)
      setPaymentMethods(pays)
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

  const switchTab = (tab: TabType) => {
    setActiveTab(tab)
    const index = tab === 'categories' ? 0 : tab === 'subcategories' ? 1 : 2
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true })
  }

  const openCategoryModal = (category?: Category) => {
    setEditingCategory(category || null)
    setEditingSubcategory(null)
    setEditingPaymentMethod(null)
    setName(category?.name || '')
    setColor(category?.color || '#3B82F6')
    setCategoryId('')
    setShowModal(true)
  }

  const openSubcategoryModal = (subcategory?: Subcategory) => {
    setEditingSubcategory(subcategory || null)
    setEditingCategory(null)
    setEditingPaymentMethod(null)
    setName(subcategory?.name || '')
    setColor(subcategory?.color || '#3B82F6')
    setCategoryId(subcategory?.categoryId || categories[0]?.id || '')
    setShowModal(true)
  }

  const openPaymentMethodModal = (pm?: PaymentMethod) => {
    setEditingPaymentMethod(pm || null)
    setEditingCategory(null)
    setEditingSubcategory(null)
    setName(pm?.name || '')
    setColor('#3B82F6')
    setCategoryId('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setEditingSubcategory(null)
    setEditingPaymentMethod(null)
    setName('')
    setCategoryId('')
    setColor('#3B82F6')
  }

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, { name: name.trim(), color })
      } else if (editingSubcategory) {
        await subcategoryService.update(editingSubcategory.id, { name: name.trim(), categoryId, color })
      } else if (editingPaymentMethod) {
        await paymentMethodService.update(editingPaymentMethod.id, name.trim())
      } else if (activeTab === 'categories') {
        await categoryService.create({ name: name.trim(), color })
      } else if (activeTab === 'subcategories') {
        if (!categoryId) return
        await subcategoryService.create({ name: name.trim(), categoryId, color })
      } else {
        await paymentMethodService.create(name.trim())
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

  const handleDelete = async () => {
    if (!editingCategory && !editingSubcategory && !editingPaymentMethod) return

    const itemName = editingCategory?.name || editingSubcategory?.name || editingPaymentMethod?.name || ''
    Alert.alert(
      'Excluir',
      `Tem certeza que deseja excluir "${itemName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (editingCategory) {
                await categoryService.delete(editingCategory.id)
              } else if (editingSubcategory) {
                await subcategoryService.delete(editingSubcategory.id)
              } else if (editingPaymentMethod) {
                await paymentMethodService.delete(editingPaymentMethod.id)
              }
              closeModal()
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

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Sem categoria'
  }

  const getTabTitle = () => {
    if (editingCategory) return 'Editar Categoria'
    if (editingSubcategory) return 'Editar Subcategoria'
    if (editingPaymentMethod) return 'Editar Método'
    if (activeTab === 'categories') return 'Nova Categoria'
    if (activeTab === 'subcategories') return 'Nova Subcategoria'
    return 'Novo Método'
  }

  const renderCategoriesList = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <Text style={styles.emptyText}>Carregando...</Text>
      ) : categories.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma categoria criada</Text>
      ) : (
        categories.map((category) => (
          <Card key={category.id} style={styles.card}>
            <CardContent>
              <View style={styles.row}>
                <View style={styles.info}>
                  <View style={[styles.colorDot, { backgroundColor: category.color || '#3B82F6' }]} />
                  <Text style={styles.name}>{category.name}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openCategoryModal(category)} style={styles.actionButton}>
                    <Icons.Pencil size={18} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingCategory(category)
                      handleDelete()
                    }} 
                    style={styles.actionButton}
                  >
                    <Icons.Trash size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </CardContent>
          </Card>
        ))
      )}
    </View>
  )

  const renderSubcategoriesList = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <Text style={styles.emptyText}>Carregando...</Text>
      ) : subcategories.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma subcategoria criada</Text>
      ) : (
        subcategories.map((subcategory) => (
          <Card key={subcategory.id} style={styles.card}>
            <CardContent>
              <View style={styles.row}>
                <View style={styles.info}>
                  <View style={[styles.colorDot, { backgroundColor: subcategory.color || '#3B82F6' }]} />
                  <View>
                    <Text style={styles.name}>{subcategory.name}</Text>
                    <Text style={styles.categoryLabel}>{getCategoryName(subcategory.categoryId)}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openSubcategoryModal(subcategory)} style={styles.actionButton}>
                    <Icons.Pencil size={18} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingSubcategory(subcategory)
                      handleDelete()
                    }} 
                    style={styles.actionButton}
                  >
                    <Icons.Trash size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </CardContent>
          </Card>
        ))
      )}
    </View>
  )

  const renderPaymentMethodsList = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <Text style={styles.emptyText}>Carregando...</Text>
      ) : paymentMethods.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum método de pagamento</Text>
      ) : (
        paymentMethods.map((pm) => (
          <Card key={pm.id} style={styles.card}>
            <CardContent>
              <View style={styles.row}>
                <View style={styles.info}>
                  <View style={[styles.iconPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                    <CardIcon size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.name}>{pm.name}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openPaymentMethodModal(pm)} style={styles.actionButton}>
                    <Icons.Pencil size={18} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingPaymentMethod(pm)
                      handleDelete()
                    }} 
                    style={styles.actionButton}
                  >
                    <Icons.Trash size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </CardContent>
          </Card>
        ))
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            if (activeTab === 'categories') openCategoryModal()
            else if (activeTab === 'subcategories') openSubcategoryModal()
            else openPaymentMethodModal()
          }}
        >
          <Icons.Plus size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]} 
          onPress={() => switchTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Categorias
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'subcategories' && styles.activeTab]} 
          onPress={() => switchTab('subcategories')}
        >
          <Text style={[styles.tabText, activeTab === 'subcategories' && styles.activeTabText]}>
            Subcats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'paymentMethods' && styles.activeTab]} 
          onPress={() => switchTab('paymentMethods')}
        >
          <Text style={[styles.tabText, activeTab === 'paymentMethods' && styles.activeTabText]}>
            Métodos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          const tabs: TabType[] = ['categories', 'subcategories', 'paymentMethods']
          setActiveTab(tabs[index])
        }}
        scrollEventThrottle={16}
      >
        {renderCategoriesList()}
        {renderSubcategoriesList()}
        {renderPaymentMethodsList()}
      </ScrollView>

      <Modal
        visible={showModal}
        onClose={closeModal}
        title={getTabTitle()}
      >
        <View style={styles.modalContent}>
          <Input
            label="Nome"
            placeholder={
              activeTab === 'categories' ? 'Nome da categoria' : 
              activeTab === 'subcategories' ? 'Nome da subcategoria' : 'Nome do método'
            }
            value={name}
            onChangeText={setName}
          />

          {(activeTab === 'subcategories' || editingSubcategory) && (
            <>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      categoryId === cat.id && {
                        borderColor: cat.color,
                        backgroundColor: cat.color + '20',
                      },
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text
                      style={[
                        styles.categoryName,
                        categoryId === cat.id && { color: cat.color },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {(activeTab === 'categories' || activeTab === 'subcategories') && !editingPaymentMethod && (
            <>
              <Text style={styles.label}>Cor</Text>
              <ColorPicker value={color} onChange={setColor} />
            </>
          )}

          <Button
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={!name.trim() || (activeTab === 'subcategories' && !categoryId)}
            style={styles.submitButton}
          >
            {editingCategory || editingSubcategory || editingPaymentMethod ? 'Salvar' : 'Criar'}
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.secondary,
  },
  activeTabText: {
    color: colors.foreground,
  },
  tabContent: {
    width: width,
    paddingHorizontal: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
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
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: fontSize.md,
    color: colors.foreground,
    fontWeight: fontWeight.medium,
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondary,
    paddingVertical: spacing.xl,
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
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  submitButton: {
    marginTop: spacing.md,
  },
})
