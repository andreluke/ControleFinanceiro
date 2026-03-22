import { api } from './api'
import { CACHE_KEYS, cacheService } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

export interface Notification {
  id: string
  type: 'budget_warning' | 'budget_exceeded' | 'goal_milestone'
  title: string
  body?: string
  entityType?: 'budget' | 'goal'
  entityId?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationSettings {
  budgetWarningPct: number
  budgetExceeded: boolean
  goalMilestones: boolean
  emailEnabled: boolean
  emailAddress?: string
}

export interface NotificationListResponse {
  data: Notification[]
  total: number
  page: number
  limit: number
}

export const notificationService = {
  async list(page = 1, limit = 20, type?: string): Promise<NotificationListResponse> {
    return withCache(
      () => api.get<NotificationListResponse>('/notifications', { page: page.toString(), limit: limit.toString(), ...(type && { type }) }),
      { cacheKey: `notifications_${page}_${limit}_${type}`, cacheTime: 60 * 1000 }
    )
  },

  async getUnreadCount(): Promise<number> {
    return withCache(
      () => api.get<{ count: number }>('/notifications/unread-count').then(r => r.count),
      { cacheKey: 'notifications_unread_count', cacheTime: 30 * 1000 }
    )
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
    await notificationService.invalidate()
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all')
    await notificationService.invalidate()
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
    await notificationService.invalidate()
  },

  async getSettings(): Promise<NotificationSettings> {
    const data = await api.get<{
      budget_warning_pct: number
      budget_exceeded: boolean
      goal_milestones: boolean
      email_enabled: boolean
      email_address?: string
    }>('/notifications/settings')

    return {
      budgetWarningPct: data.budget_warning_pct,
      budgetExceeded: data.budget_exceeded,
      goalMilestones: data.goal_milestones,
      emailEnabled: data.email_enabled,
      emailAddress: data.email_address,
    }
  },

  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const data = await api.put<{
      budget_warning_pct: number
      budget_exceeded: boolean
      goal_milestones: boolean
      email_enabled: boolean
      email_address?: string
    }>('/notifications/settings', {
      budget_warning_pct: settings.budgetWarningPct,
      budget_exceeded: settings.budgetExceeded,
      goal_milestones: settings.goalMilestones,
      email_enabled: settings.emailEnabled,
      email_address: settings.emailAddress,
    })

    return {
      budgetWarningPct: data.budget_warning_pct,
      budgetExceeded: data.budget_exceeded,
      goalMilestones: data.goal_milestones,
      emailEnabled: data.email_enabled,
      emailAddress: data.email_address,
    }
  },

  invalidate: async () => {
    await cacheService.delete('notifications_1_20_')
    await cacheService.delete('notifications_unread_count')
  },
}