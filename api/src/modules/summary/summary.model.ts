import { and, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { categories, transactions } from "../../drizzle/schema";
import { RecurringTransactionModel } from "../recurring/recurring.model";
import type { SummaryPeriod } from "./summary.schema";

interface SummaryFilters {
	month?: string;
	period?: SummaryPeriod;
	type?: "income" | "expense";
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
		const transactionType = filters.type || "expense";
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

	private getNextOccurrences(
		recurring: {
			frequency: string;
			dayOfMonth: string;
			dayOfWeek: string;
			startDate: Date;
			endDate: Date | null;
			amount: string;
			description: string;
			type: string;
		},
		startDate: Date,
		endDate: Date,
	): Date[] {
		const occurrences: Date[] = [];
		const frequency = recurring.frequency;

		const currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			let shouldAdd = false;

			switch (frequency) {
				case "daily":
					shouldAdd = true;
					currentDate.setDate(currentDate.getDate() + 1);
					break;

				case "weekly": {
					const dayOfWeek = Number(recurring.dayOfWeek);
					if (currentDate.getDay() === dayOfWeek) {
						shouldAdd = true;
					}
					currentDate.setDate(currentDate.getDate() + 1);
					break;
				}

				case "monthly": {
					const dayOfMonth = Number(recurring.dayOfMonth);
					const lastDayOfMonth = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth() + 1,
						0,
					).getDate();
					const targetDay = Math.min(dayOfMonth, lastDayOfMonth);

					if (currentDate.getDate() === targetDay) {
						shouldAdd = true;
					}
					currentDate.setMonth(currentDate.getMonth() + 1);
					currentDate.setDate(1);
					break;
				}

				case "yearly": {
					const dayOfMonth = Number(recurring.dayOfMonth);
					if (
						currentDate.getMonth() === 0 &&
						currentDate.getDate() === dayOfMonth
					) {
						shouldAdd = true;
					}
					currentDate.setFullYear(currentDate.getFullYear() + 1);
					break;
				}

				case "custom": {
					shouldAdd = true;
					const interval = Number(recurring.dayOfWeek) || 1;
					currentDate.setDate(currentDate.getDate() + interval);
					break;
				}

				default:
					currentDate.setDate(currentDate.getDate() + 1);
			}

			if (shouldAdd && currentDate <= endDate) {
				if (recurring.startDate && currentDate < recurring.startDate) continue;
				if (recurring.endDate && currentDate > recurring.endDate) break;
				occurrences.push(new Date(currentDate));
			}
		}

		return occurrences;
	}

	async getForecast(userId: string, month?: number, year?: number) {
		const now = new Date();
		const targetMonth = month ?? now.getMonth() + 1;
		const targetYear = year ?? now.getFullYear();

		const monthStart = new Date(targetYear, targetMonth - 1, 1);
		const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const metaCategoryId = await this.getMetaCategoryId(userId);

		const currentConditions = and(
			eq(transactions.userId, userId),
			gte(transactions.date, monthStart),
			lt(transactions.date, monthEnd),
		);

		const currentConditionsWithFilter = metaCategoryId
			? and(currentConditions, ne(transactions.categoryId, metaCategoryId))
			: currentConditions;

		const [currentTotals] = await db
			.select({
				income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
				expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
			})
			.from(transactions)
			.where(currentConditionsWithFilter);

		const currentIncome = Number(currentTotals.income);
		const currentExpense = Number(currentTotals.expense);

		const recurringModel = new RecurringTransactionModel();
		const activeRecurring = await recurringModel.findAll(userId, {
			isActive: true,
		});

		const upcomingRecurring: {
			description: string;
			amount: number;
			type: "income" | "expense";
			expectedDate: string;
		}[] = [];

		let projectedIncome = currentIncome;
		let projectedExpense = currentExpense;

		for (const recurring of activeRecurring) {
			const occurrences = this.getNextOccurrences(
				recurring as {
					frequency: string;
					dayOfMonth: string;
					dayOfWeek: string;
					startDate: Date;
					endDate: Date | null;
					amount: string;
					description: string;
					type: string;
				},
				today,
				monthEnd,
			);

			for (const occurrence of occurrences) {
				const amount = Number(recurring.amount);
				if (recurring.type === "income") {
					projectedIncome += amount;
				} else {
					projectedExpense += amount;
				}

				upcomingRecurring.push({
					description: recurring.description,
					amount,
					type: recurring.type as "income" | "expense",
					expectedDate: occurrence.toISOString().split("T")[0],
				});
			}
		}

		const historicalMonths = await this.getHistoricalAverage(userId, 3);
		const hasEnoughHistory = historicalMonths >= 3;
		const confidence: "high" | "low" = hasEnoughHistory ? "high" : "low";

		return {
			currentIncome,
			currentExpense,
			projectedIncome,
			projectedExpense,
			projectedBalance: projectedIncome - projectedExpense,
			recurringUpcoming: upcomingRecurring.sort((a, b) =>
				a.expectedDate.localeCompare(b.expectedDate),
			),
			confidence,
		};
	}

	private async getHistoricalAverage(
		userId: string,
		months: number,
	): Promise<number> {
		const now = new Date();
		let historicalCount = 0;

		for (let i = 1; i <= months; i++) {
			const checkDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthStart = new Date(
				checkDate.getFullYear(),
				checkDate.getMonth(),
				1,
			);
			const monthEnd = new Date(
				checkDate.getFullYear(),
				checkDate.getMonth() + 1,
				0,
			);

			const metaCategoryId = await this.getMetaCategoryId(userId);
			const conditions = and(
				eq(transactions.userId, userId),
				gte(transactions.date, monthStart),
				lt(transactions.date, monthEnd),
			);

			const conditionsWithFilter = metaCategoryId
				? and(conditions, ne(transactions.categoryId, metaCategoryId))
				: conditions;

			const [result] = await db
				.select({
					count: sql<number>`COUNT(DISTINCT DATE(${transactions.date}))`,
				})
				.from(transactions)
				.where(conditionsWithFilter);

			if (Number(result.count) > 0) {
				historicalCount++;
			}
		}

		return historicalCount;
	}
}
