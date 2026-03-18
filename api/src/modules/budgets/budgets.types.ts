import type { budgets } from "../../drizzle/schema";

export type Budget = typeof budgets.$inferSelect;
export type CreateBudget = typeof budgets.$inferInsert;

export interface BudgetWithCategory {
	id: string;
	amount: number;
	baseAmount?: number | null;
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
	isRecurring: boolean;
	isActive: boolean;
	recurringGroupId?: string | null;
	createdAt: Date;
	subcategoriesTotal?: number;
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
	baseAmount?: number;
	month: number;
	year: number;
	isRecurring?: boolean;
}

export interface UpdateBudgetInput {
	amount?: number;
	baseAmount?: number;
	isActive?: boolean;
	isRecurring?: boolean;
}
