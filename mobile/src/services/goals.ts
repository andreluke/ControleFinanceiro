import { api } from './api'
import { CACHE_KEYS } from './cache'
import { withCache, cacheUtils } from './cacheUtils'

export interface Goal {
  id: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  icon?: string
  color?: string
  isActive: boolean
  categoryId?: string
  createdAt: string
  updatedAt: string
}

interface GoalRaw {
  id: string
  name: string
  description?: string
  targetAmount: string
  currentAmount: string
  deadline?: string
  icon?: string
  color?: string
  isActive: boolean
  categoryId?: string
  createdAt: string
  updatedAt: string
}

const parseGoal = (goal: GoalRaw): Goal => ({
  ...goal,
  targetAmount: Number(goal.targetAmount) || 0,
  currentAmount: Number(goal.currentAmount) || 0,
})

export interface CreateGoalRequest {
  name: string
  description?: string
  targetAmount: number
  deadline?: string
  icon?: string
  color?: string
  isActive?: boolean
}

export interface UpdateGoalRequest {
  name: string
  description?: string
  targetAmount: number
  deadline?: string
  icon?: string
  color?: string
  isActive?: boolean
}

export interface ContributeGoalRequest {
  amount: number
}

export interface GoalContribution {
  id: string
  goalId: string
  transactionId: string
  amount: number
  type: 'deposit' | 'withdrawal'
  createdAt: string
}

export interface GoalResponse {
  goal: Goal
}

export interface GoalsResponse {
  goals: Goal[]
}

export interface ContributionsResponse {
  contributions: GoalContribution[]
}

export const goalService = {
  async list(useCache = true): Promise<Goal[]> {
    if (useCache) {
      return withCache(
        () => api.get<GoalsResponse>('/goals'),
        { cacheKey: CACHE_KEYS.GOALS, cacheTime: 5 * 60 * 1000 }
      ).then(res => res.goals.map(parseGoal))
    }
    
    return api.get<GoalsResponse>('/goals').then(res => res.goals.map(parseGoal))
  },

  async get(id: string): Promise<Goal> {
    return api.get<GoalResponse>(`/goals/${id}`).then(res => parseGoal(res.goal))
  },

  async create(data: CreateGoalRequest): Promise<Goal> {
    const result = await api.post<GoalResponse>('/goals', data)
    goalService.invalidate()
    return parseGoal(result.goal)
  },

  async update(id: string, data: UpdateGoalRequest): Promise<Goal> {
    const result = await api.put<GoalResponse>(`/goals/${id}`, data)
    goalService.invalidate()
    return parseGoal(result.goal)
  },

  async contribute(id: string, amount: number): Promise<Goal> {
    const result = await api.post<GoalResponse>(`/goals/${id}/contribute`, { amount })
    goalService.invalidate()
    return parseGoal(result.goal)
  },

  async withdraw(id: string, amount: number): Promise<Goal> {
    const result = await api.post<GoalResponse>(`/goals/${id}/withdraw`, { amount })
    goalService.invalidate()
    return parseGoal(result.goal)
  },

  async listContributions(goalId: string): Promise<GoalContribution[]> {
    const res = await api.get<ContributionsResponse>(`/goals/${goalId}/contributions`)
    return res.contributions.map(c => ({
      ...c,
      amount: Number(c.amount) || 0,
    }))
  },

  async removeContribution(contributionId: string): Promise<Goal> {
    const result = await api.delete<GoalResponse>(`/goals/contributions/${contributionId}`)
    goalService.invalidate()
    return parseGoal(result.goal)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`)
    goalService.invalidate()
  },

  invalidate: async () => {
    await cacheUtils.invalidateGoals()
  },
}
