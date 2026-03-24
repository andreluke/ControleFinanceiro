import {
  notificationModel,
  notificationSettingsModel,
} from "../modules/notifications/notifications.model";
import { AuthModel } from "../modules/auth/auth.model";
import {
  shouldNotifyBudget,
  resolveBudgetNotificationType,
  resolveGoalMilestone,
} from "./notifications/notifications.guards";
import {
  getBudgetNotificationText,
  getGoalNotificationText,
} from "./notifications/notifications.helpers";
import {
  sendBudgetEmailIfEnabled,
  sendGoalEmailIfEnabled,
} from "./notifications/notifications.email";

const authModel = new AuthModel();

export type NotificationType =
  | "budget_warning"
  | "budget_exceeded"
  | "goal_milestone";

export interface BudgetNotificationParams {
  userId: string;
  budgetId: string;
  categoryName: string;
  usedAmount: number;
  budgetAmount: number;
}

export interface GoalMilestoneParams {
  userId: string;
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
}

export async function triggerBudgetNotification(
  params: BudgetNotificationParams,
): Promise<void> {
  const { userId, budgetId, categoryName, usedAmount, budgetAmount } = params;

  const settings = await notificationSettingsModel.findByUserId(userId);
  const percentage = (usedAmount / budgetAmount) * 100;

  if (!shouldNotifyBudget(settings, percentage)) return;

  const type = resolveBudgetNotificationType(percentage);

  const alreadyNotified = await notificationModel.checkRecentNotification(
    userId,
    type,
    budgetId,
  );
  if (alreadyNotified) return;

  const { title, body } = getBudgetNotificationText(
    type,
    categoryName,
    usedAmount,
    budgetAmount,
    percentage,
  );

  await notificationModel.create({
    userId,
    type,
    title,
    body,
    entityType: "budget",
    entityId: budgetId,
    isRead: false,
  });

  const user = await authModel.findById(userId);
  await sendBudgetEmailIfEnabled(settings, user, type, {
    categoryName,
    usedPct: percentage,
    usedAmount,
    budgetAmount,
  });
}

export async function triggerGoalMilestoneNotification(
  params: GoalMilestoneParams,
): Promise<void> {
  const { userId, goalId, goalName, currentAmount, targetAmount } = params;

  const settings = await notificationSettingsModel.findByUserId(userId);
  if (settings && !settings.goalMilestones) return;

  const percentage = (currentAmount / targetAmount) * 100;
  const milestone = resolveGoalMilestone(percentage);
  if (!milestone) return;

  const alreadyNotified = await notificationModel.checkRecentNotification(
    userId,
    "goal_milestone",
    goalId,
  );
  if (alreadyNotified) return;

  const { title, body } = getGoalNotificationText(
    goalName,
    milestone,
    currentAmount,
    targetAmount,
  );

  await notificationModel.create({
    userId,
    type: "goal_milestone",
    title,
    body,
    entityType: "goal",
    entityId: goalId,
    isRead: false,
  });

  const user = await authModel.findById(userId);
  await sendGoalEmailIfEnabled(settings, user, {
    goalName,
    milestone,
    currentAmount,
    targetAmount,
  });
}
