import { and, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { categories, transactions } from "../../drizzle/schema";
import type { SummaryPeriod } from "./summary.schema";

interface SummaryFilters {
	month?: string;
	period?: SummaryPeriod;
	type?: 'income' | 'expense';
}

interface DateRange {
	start: Date;
	endExclusive: Date;
	previousStart: Date;
	previousEndExclusive: Date;
}

function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function parseMonthRange(month: string) {
	const [year, monthIndex] = month.split("-").map(Number);
	const start = new Date(year, monthIndex - 1, 1);
	const endExclusive = new Date(year, monthIndex, 1);
	return { start, endExclusive };
}

function resolveRange(filters: SummaryFilters): DateRange {
	if (filters.month) {
		const current = parseMonthRange(filters.month);
		const previousStart = new Date(
			current.start.getFullYear(),
			current.start.getMonth() - 1,
			1,
		);
		const previousEndExclusive = new Date(
			current.start.getFullYear(),
			current.start.getMonth(),
			1,
		);

		return {
			start: current.start,
			endExclusive: current.endExclusive,
			previousStart,
			previousEndExclusive,
		};
	}

	if (filters.period === "7d" || filters.period === "30d") {
		const days = filters.period === "7d" ? 7 : 30;
		const todayStart = startOfDay(new Date());
		const start = addDays(todayStart, -(days - 1));
		const endExclusive = addDays(todayStart, 1);
		const previousStart = addDays(start, -days);
		const previousEndExclusive = start;

		return { start, endExclusive, previousStart, previousEndExclusive };
	}

	const baseDate = new Date();
	if (filters.period === "previous") {
		baseDate.setMonth(baseDate.getMonth() - 1);
	}

	const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
	const endExclusive = new Date(
		baseDate.getFullYear(),
		baseDate.getMonth() + 1,
		1,
	);
	const previousStart = new Date(
		baseDate.getFullYear(),
		baseDate.getMonth() - 1,
		1,
	);
	const previousEndExclusive = start;

	return { start, endExclusive, previousStart, previousEndExclusive };
}

export class SummaryModel {
	private async getMetaCategoryId(userId: string): Promise<string | null> {
		const [metaCategory] = await db
			.select({ id: categories.id })
			.from(categories)
			.where(and(eq(categories.userId, userId), eq(categories.name, "Meta")))
			.limit(1);
		return metaCategory?.id ?? null;
	}

	async getSummary(userId: string, filters: SummaryFilters = {}) {
		const range = resolveRange(filters);
		const metaCategoryId = await this.getMetaCategoryId(userId);

		const balanceConditions = and(
			eq(transactions.userId, userId),
			gte(transactions.date, range.start),
			lt(transactions.date, range.endExclusive),
		);

		const balanceConditionsWithFilter = metaCategoryId
			? and(balanceConditions, ne(transactions.categoryId, metaCategoryId))
			: balanceConditions;

		const [balanceResult] = await db
			.select({
				total: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
			})
			.from(transactions)
			.where(balanceConditionsWithFilter);

		const currentConditions = and(
			eq(transactions.userId, userId),
			gte(transactions.date, range.start),
			lt(transactions.date, range.endExclusive),
		);

		const currentConditionsWithFilter = metaCategoryId
			? and(currentConditions, ne(transactions.categoryId, metaCategoryId))
			: currentConditions;

		const [currentMonthTotals] = await db
			.select({
				income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
				expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
			})
			.from(transactions)
			.where(currentConditionsWithFilter);

		const previousConditions = and(
			eq(transactions.userId, userId),
			gte(transactions.date, range.previousStart),
			lt(transactions.date, range.previousEndExclusive),
		);

		const previousConditionsWithFilter = metaCategoryId
			? and(previousConditions, ne(transactions.categoryId, metaCategoryId))
			: previousConditions;

		const [previousMonthTotals] = await db
			.select({
				expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
			})
			.from(transactions)
			.where(previousConditionsWithFilter);

		const expenseChange =
			previousMonthTotals.expense > 0
				? ((currentMonthTotals.expense - previousMonthTotals.expense) /
						previousMonthTotals.expense) *
					100
				: 0;

		return {
			totalBalance: Number(balanceResult.total),
			monthlyIncome: Number(currentMonthTotals.income),
			monthlyExpense: Number(currentMonthTotals.expense),
			monthlyChange: Number(expenseChange.toFixed(2)),
		};
	}

	async getMonthlySummary(userId: string) {
		const metaCategoryId = await this.getMetaCategoryId(userId);

		const conditions = and(
			eq(transactions.userId, userId),
			sql`${transactions.date} >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'`,
		);

		const conditionsWithFilter = metaCategoryId
			? and(conditions, ne(transactions.categoryId, metaCategoryId))
			: conditions;

		const result = await db
			.select({
				month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
				income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
				expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
			})
			.from(transactions)
			.where(conditionsWithFilter)
			.groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`)
			.orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`);

		// Calcular o balanço por mês
		return result.map((r) => ({
			month: r.month,
			income: Number(r.income),
			expense: Number(r.expense),
			balance: Number(r.income) - Number(r.expense),
		}));
	}

	async getByCategorySummary(userId: string, filters: SummaryFilters = {}) {
		const range = resolveRange(filters);
		const transactionType = filters.type || 'expense';
		const metaCategoryId = await this.getMetaCategoryId(userId);

		const conditions = and(
			eq(transactions.userId, userId),
			eq(transactions.type, transactionType),
			gte(transactions.date, range.start),
			lt(transactions.date, range.endExclusive),
		);

		const conditionsWithFilter = metaCategoryId
			? and(conditions, ne(transactions.categoryId, metaCategoryId))
			: conditions;

		const expenses = await db
			.select({
				categoryId: transactions.categoryId,
				categoryName: categories.name,
				color: categories.color,
				total: sql<number>`SUM(${transactions.amount})`,
			})
			.from(transactions)
			.leftJoin(categories, eq(transactions.categoryId, categories.id))
			.where(conditionsWithFilter)
			.groupBy(transactions.categoryId, categories.name, categories.color)
			.orderBy(desc(sql`SUM(${transactions.amount})`));

		const totalExpense = expenses.reduce(
			(acc, curr) => acc + Number(curr.total),
			0,
		);

		return expenses.map((e) => ({
			categoryId: e.categoryId || "others",
			categoryName: e.categoryName || "Outros",
			color: e.color || "#8892A4",
			total: Number(e.total),
			percentage:
				totalExpense > 0
					? Number(((Number(e.total) / totalExpense) * 100).toFixed(1))
					: 0,
		}));
	}
}
