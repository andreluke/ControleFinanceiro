import type { budgets } from "../../drizzle/schema";

export type Budget = typeof budgets.$inferSelect;
export type CreateBudget = typeof budgets.$inferInsert;

export interface BudgetWithCategory {
	id: string;
	amount: number;
	month: number;
	year: number;
	categoryId: string;
	subcategoryId?: string | null;
	categoryName: string;
	categoryColor: string;
	subcategoryName?: string | null;
	subcategoryColor?: string | null;
	spent: number;
	percentage: number;
	remaining: number;
	isOverBudget: boolean;
	createdAt: Date;
}

export interface BudgetSummary {
	totalBudgeted: number;
	totalSpent: number;
	totalRemaining: number;
	overBudgetCount: number;
	nearLimitCount: number;
	budgets: BudgetWithCategory[];
}

export interface CreateBudgetInput {
	categoryId: string;
	subcategoryId?: string;
	amount: number;
	month: number;
	year: number;
}

export interface UpdateBudgetInput {
	amount: number;
}
