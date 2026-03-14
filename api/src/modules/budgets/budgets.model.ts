import { and, desc, eq, gte, lte, sum } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { budgets, categories, transactions } from "../../drizzle/schema";
import type { Budget, BudgetWithCategory, BudgetSummary } from "./budgets.types";

function toNumber(value: unknown): number {
	if (typeof value === "number") return value;
	if (typeof value === "string") return Number(value);
	if (value === null || value === undefined) return 0;
	return 0;
}

export class BudgetsModel {
	async create(data: {
		userId: string;
		categoryId: string;
		amount: number;
		month: number;
		year: number;
	}): Promise<Budget> {
		const [created] = await db
			.insert(budgets)
			.values({
				userId: data.userId,
				categoryId: data.categoryId,
				amount: String(data.amount),
				month: String(data.month),
				year: String(data.year),
			})
			.returning();
		return created;
	}

	async findById(id: string): Promise<Budget | undefined> {
		const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
		return budget;
	}

	async findByUserAndPeriod(
		userId: string,
		month: number,
		year: number,
	): Promise<Budget[]> {
		return db
			.select()
			.from(budgets)
			.where(
				and(
					eq(budgets.userId, userId),
					eq(budgets.month, String(month)),
					eq(budgets.year, String(year)),
				),
			)
			.orderBy(desc(budgets.createdAt));
	}

	async findByUser(userId: string): Promise<Budget[]> {
		return db
			.select()
			.from(budgets)
			.where(eq(budgets.userId, userId))
			.orderBy(desc(budgets.year), desc(budgets.month));
	}

	async getWithCategory(
		userId: string,
		month: number,
		year: number,
	): Promise<BudgetWithCategory[]> {
		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0, 23, 59, 59);

		const userBudgets = await db
			.select({
				id: budgets.id,
				amount: budgets.amount,
				month: budgets.month,
				year: budgets.year,
				categoryId: budgets.categoryId,
				categoryName: categories.name,
				categoryColor: categories.color,
				createdAt: budgets.createdAt,
			})
			.from(budgets)
			.leftJoin(categories, eq(budgets.categoryId, categories.id))
			.where(
				and(
					eq(budgets.userId, userId),
					eq(budgets.month, String(month)),
					eq(budgets.year, String(year)),
				),
			);

		const budgetsWithSpent: BudgetWithCategory[] = await Promise.all(
			userBudgets.map(async (budget) => {
				const amountNum = toNumber(budget.amount);

				const [result] = await db
					.select({ total: sum(transactions.amount) })
					.from(transactions)
					.where(
						and(
							eq(transactions.userId, userId),
							eq(transactions.categoryId, budget.categoryId),
							eq(transactions.type, "expense" as const),
							gte(transactions.date, startDate),
							lte(transactions.date, endDate),
						),
					);

				const spent = toNumber(result?.total);
				const percentage = amountNum > 0 ? (spent / amountNum) * 100 : 0;

				return {
					id: budget.id,
					amount: amountNum,
					month: toNumber(budget.month),
					year: toNumber(budget.year),
					categoryId: budget.categoryId,
					categoryName: budget.categoryName || "Sem categoria",
					categoryColor: budget.categoryColor || "#6B7280",
					spent,
					percentage,
					remaining: amountNum - spent,
					isOverBudget: spent > amountNum,
					createdAt: budget.createdAt || new Date(),
				};
			}),
		);

		return budgetsWithSpent;
	}

	async getSummary(userId: string, month: number, year: number): Promise<BudgetSummary> {
		const budgetsWithCategory = await this.getWithCategory(userId, month, year);

		const totalBudgeted = budgetsWithCategory.reduce((sum, b) => sum + b.amount, 0);
		const totalSpent = budgetsWithCategory.reduce((sum, b) => sum + b.spent, 0);
		const totalRemaining = totalBudgeted - totalSpent;
		const overBudgetCount = budgetsWithCategory.filter((b) => b.isOverBudget).length;
		const nearLimitCount = budgetsWithCategory.filter(
			(b) => b.percentage >= 80 && b.percentage <= 100,
		).length;

		return {
			totalBudgeted,
			totalSpent,
			totalRemaining,
			overBudgetCount,
			nearLimitCount,
			budgets: budgetsWithCategory,
		};
	}

	async update(
		id: string,
		data: { amount?: number },
	): Promise<Budget | undefined> {
		const updateData: { amount?: string; updatedAt: Date } = {
			updatedAt: new Date(),
		};
		if (data.amount !== undefined) {
			updateData.amount = String(data.amount);
		}

		const [updated] = await db
			.update(budgets)
			.set(updateData)
			.where(eq(budgets.id, id))
			.returning();
		return updated;
	}

	async delete(id: string): Promise<boolean> {
		const result = await db.delete(budgets).where(eq(budgets.id, id));
		const rowCount = (result as { rowCount?: number }).rowCount;
		return rowCount !== undefined && rowCount > 0;
	}
}

export default new BudgetsModel();
