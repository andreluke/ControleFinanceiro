import type { NewNotificationSetting as NotificationSettings } from "../../modules/notifications/notifications.model";

export function shouldNotifyBudget(
  settings: NotificationSettings | null,
  percentage: number
): boolean {
  if (settings && !settings.budgetExceeded) return false;

  if (percentage >= 100) return true;

  const warningThreshold = settings?.budgetWarningPct ?? 80;
  return percentage >= warningThreshold;
}

export function resolveBudgetNotificationType(
  percentage: number
): "budget_exceeded" | "budget_warning" {
  return percentage >= 100 ? "budget_exceeded" : "budget_warning";
}

export function resolveGoalMilestone(
  percentage: number
): 50 | 75 | 100 | null {
  if (percentage >= 100) return 100;
  if (percentage >= 75) return 75;
  if (percentage >= 50) return 50;
  return null;
}