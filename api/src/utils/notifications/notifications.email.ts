import * as emailService from "../../emails/email.service";
import type { NewNotificationSetting as NotificationSettings } from "../../modules/notifications/notifications.model";

interface EmailRecipient {
  name: string;
  email: string;
}

function canSendEmail(
  settings: NotificationSettings | null,
  user: { name: string } | null,
): settings is NotificationSettings & { emailAddress: string } {
  return !!(settings?.emailEnabled && settings.emailAddress && user);
}

function hasValidUser(user: { name: string } | null): user is { name: string } {
  return !!user;
}

export async function sendBudgetEmailIfEnabled(
  settings: NotificationSettings | null,
  user: { name: string } | null,
  type: "budget_exceeded" | "budget_warning",
  payload: {
    categoryName: string;
    usedPct: number;
    usedAmount: number;
    budgetAmount: number;
  },
): Promise<void> {
  if (!hasValidUser(user)) return;
  if (!canSendEmail(settings, user)) return;

  const recipient: EmailRecipient = {
    name: user.name,
    email: settings.emailAddress,
  };
  const exceededBy = payload.usedAmount - payload.budgetAmount;
  const fn =
    type === "budget_exceeded"
      ? emailService.sendBudgetExceededEmail
      : emailService.sendBudgetWarningEmail;

  await fn(recipient, { ...payload, exceededBy }).catch((err) =>
    console.error("[email] falha ao enviar notificação de orçamento:", err),
  );
}

export async function sendGoalEmailIfEnabled(
  settings: NotificationSettings | null,
  user: { name: string } | null,
  payload: {
    goalName: string;
    milestone: 50 | 75 | 100;
    currentAmount: number;
    targetAmount: number;
  },
): Promise<void> {
  if (!hasValidUser(user)) return;
  if (!canSendEmail(settings, user)) return;

  const recipient: EmailRecipient = {
    name: user.name,
    email: settings.emailAddress,
  };

  await emailService
    .sendGoalMilestoneEmail(recipient, payload)
    .catch((err) =>
      console.error("[email] falha ao enviar notificação de meta:", err),
    );
}
