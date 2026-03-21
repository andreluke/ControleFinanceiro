import { notificationModel, notificationSettingsModel } from "../modules/notifications/notifications.model";

export type NotificationType = "budget_warning" | "budget_exceeded" | "goal_milestone";

interface BudgetNotificationParams {
	userId: string;
	budgetId: string;
	categoryName: string;
	usedAmount: number;
	budgetAmount: number;
}

export async function triggerBudgetNotification(params: BudgetNotificationParams) {
	const { userId, budgetId, categoryName, usedAmount, budgetAmount } = params;

	const settings = await notificationSettingsModel.findByUserId(userId);
	if (settings && !settings.budgetExceeded) return;

	const percentage = (usedAmount / budgetAmount) * 100;

	if (percentage < 100) {
		const warningPct = settings?.budgetWarningPct ?? 80;
		if (percentage < warningPct) return;
	}

	const type: NotificationType = percentage >= 100 ? "budget_exceeded" : "budget_warning";

	const alreadyNotified = await notificationModel.checkRecentNotification(userId, type, budgetId);
	if (alreadyNotified) return;

	const title =
		type === "budget_exceeded"
			? `Orçamento de ${categoryName} excedido`
			: `Orçamento de ${categoryName} em ${percentage.toFixed(0)}%`;

	const body =
		type === "budget_exceeded"
			? `Você usou R$ ${usedAmount.toFixed(2)} de R$ ${budgetAmount.toFixed(2)}`
			: `Restam R$ ${(budgetAmount - usedAmount).toFixed(2)} do orçamento`;

	await notificationModel.create({
		userId,
		type,
		title,
		body,
		entityType: "budget",
		entityId: budgetId,
		isRead: false,
	});
}

interface GoalMilestoneParams {
	userId: string;
	goalId: string;
	goalName: string;
	currentAmount: number;
	targetAmount: number;
}

export async function triggerGoalMilestoneNotification(params: GoalMilestoneParams) {
	const { userId, goalId, goalName, currentAmount, targetAmount } = params;

	const settings = await notificationSettingsModel.findByUserId(userId);
	if (settings && !settings.goalMilestones) return;

	const percentage = (currentAmount / targetAmount) * 100;

	let milestone: 50 | 75 | 100;
	if (percentage >= 100) {
		milestone = 100;
	} else if (percentage >= 75) {
		milestone = 75;
	} else {
		milestone = 50;
	}

	const alreadyNotified = await notificationModel.checkRecentNotification(userId, "goal_milestone", goalId);
	if (alreadyNotified) return;

	const title =
		milestone === 100
			? `Meta "${goalName}" atingida!`
			: `Meta "${goalName}" em ${milestone}%`;

	const body =
		milestone === 100
			? `Parabéns! Você alcançou R$ ${currentAmount.toFixed(2)}`
			: `Você já juntou R$ ${currentAmount.toFixed(2)} de R$ ${targetAmount.toFixed(2)}`;

	await notificationModel.create({
		userId,
		type: "goal_milestone",
		title,
		body,
		entityType: "goal",
		entityId: goalId,
		isRead: false,
	});
}
