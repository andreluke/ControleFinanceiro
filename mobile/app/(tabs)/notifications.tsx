import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { notificationService, type Notification } from '../../src/services'
import { Icons } from '../../src/components/icons'

const typeLabels: Record<string, string> = {
  budget_warning: 'Alerta de Orçamento',
  budget_exceeded: 'Orçamento Excedido',
  goal_milestone: 'Meta',
}

const typeColors: Record<string, string> = {
  budget_warning: colors.warning,
  budget_exceeded: colors.danger,
  goal_milestone: colors.success,
}

export default function NotificationsScreen() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const data = await notificationService.list()
      setNotifications(data.data)
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir',
      'Tem certeza que deseja excluir esta notificação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.delete(id)
              setNotifications(prev => prev.filter(n => n.id !== id))
            } catch (err) {
              console.error('Error deleting notification:', err)
            }
          },
        },
      ]
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return `${days} dias atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, !item.isRead && styles.cardUnread]}
      onPress={() => !item.isRead && handleMarkAsRead(item.id)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: typeColors[item.type] + '20' }]}>
        {item.type === 'budget_warning' && <Icons.AlertCircle size={20} color={typeColors[item.type]} />}
        {item.type === 'budget_exceeded' && <Icons.AlertTriangle size={20} color={typeColors[item.type]} />}
        {item.type === 'goal_milestone' && <Icons.CheckCircle size={20} color={typeColors[item.type]} />}
      </View>
      <View style={styles.content}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, !item.isRead && styles.titleUnread]}>{item.title}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.body && <Text style={styles.body}>{item.body}</Text>}
        <View style={[styles.badge, { backgroundColor: typeColors[item.type] + '20' }]}>
          <Text style={[styles.badgeText, { color: typeColors[item.type] }]}>
            {typeLabels[item.type]}
          </Text>
        </View>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
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
          <Text style={styles.title}>Notificações</Text>
        </View>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllButton}>Marcar tudo como lido</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Carregando...' : 'Nenhuma notificação'}
          </Text>
        }
      />
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  markAllButton: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: colors.primary + '50',
    backgroundColor: colors.primary + '08',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    flex: 1,
    marginRight: spacing.sm,
  },
  titleUnread: {
    fontWeight: fontWeight.bold,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.secondary,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondary,
    paddingVertical: spacing.xl,
  },
})