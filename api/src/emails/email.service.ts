import { render } from "@react-email/components";
import { resend } from "./resend.client";
import { env } from "../settings/env";
import { BudgetWarning } from "./templates/BudgetWarning";
import { BudgetExceeded } from "./templates/BudgetExceeded";
import { GoalMilestone } from "./templates/GoalMilestone";

interface EmailRecipient {
	name: string;
	email: string;
}

export async function sendBudgetWarningEmail(
	to: EmailRecipient,
	data: { categoryName: string; usedPct: number; usedAmount: number; budgetAmount: number }
) {
	if (!resend || !env.RESEND_FROM_EMAIL) return;
	const html = await render(BudgetWarning({ userName: to.name, appUrl: env.APP_URL ?? "", ...data }));
	return resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: `${to.name} <${to.email}>`,
		subject: `Atenção: orçamento de ${data.categoryName} em ${data.usedPct}%`,
		html,
	});
}

export async function sendBudgetExceededEmail(
	to: EmailRecipient,
	data: { categoryName: string; usedAmount: number; budgetAmount: number; exceededBy: number }
) {
	if (!resend || !env.RESEND_FROM_EMAIL) return;
	const html = await render(BudgetExceeded({ userName: to.name, appUrl: env.APP_URL ?? "", ...data }));
	return resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: `${to.name} <${to.email}>`,
		subject: `Orçamento de ${data.categoryName} ultrapassado`,
		html,
	});
}

export async function sendGoalMilestoneEmail(
	to: EmailRecipient,
	data: { goalName: string; milestone: 50 | 75 | 100; currentAmount: number; targetAmount: number }
) {
	if (!resend || !env.RESEND_FROM_EMAIL) return;
	const html = await render(GoalMilestone({ userName: to.name, appUrl: env.APP_URL ?? "", ...data }));
	return resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: `${to.name} <${to.email}>`,
		subject: `Meta "${data.goalName}" chegou a ${data.milestone}%!`,
		html,
	});
}