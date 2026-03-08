import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { categories, transactions } from "../../drizzle/schema";

export class SummaryModel {
	async getSummary(userId: string, month?: string) {
		const currentMonth = month || new Date().toISOString().slice(0, 7);
		const [prevYear, prevMonth] = currentMonth.split("-").map(Number);
		const previousMonth =
			prevMonth === 1
				? `${prevYear - 1}-12`
				: `${prevYear}-${String(prevMonth - 1).padStart(2, "0")}`;

		const monthFilter = sql`to_char(${transactions.date}, 'YYYY-MM') = ${currentMonth}`;
		const previousMonthFilter = sql`to_char(${transactions.date}, 'YYYY-MM') = ${previousMonth}`;

		// Pega o total de todas as transações (saldo atual até o final do mês selecionado ou global)
		// Se quiser o saldo exato do fim daquele mês: date <= fim do mês
		// Para simplificar, faremos o saldo global (todas transações)
		const [balanceResult] = await db
			.select({
				total: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
			})
			.from(transactions)
			.where(eq(transactions.userId, userId));

		const [currentMonthTotals] = await db
			.select({
				income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
				expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
			})
			.from(transactions)
			.where(and(eq(transactions.userId, userId), monthFilter));

		const [previousMonthTotals] = await db
			.select({
				expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
			})
			.from(transactions)
			.where(and(eq(transactions.userId, userId), previousMonthFilter));

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
		// Últimos 6 meses
		const result = await db
			.select({
				month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
				income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
				expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.userId, userId),
					sql`${transactions.date} >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'`,
				),
			)
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

	async getByCategorySummary(userId: string) {
		const expenses = await db
			.select({
				categoryId: transactions.categoryId,
				categoryName: categories.name,
				color: categories.color,
				total: sql<number>`SUM(${transactions.amount})`,
			})
			.from(transactions)
			.leftJoin(categories, eq(transactions.categoryId, categories.id))
			.where(
				and(
					eq(transactions.userId, userId),
					eq(transactions.type, "expense"),
					sql`${transactions.date} >= DATE_TRUNC('month', CURRENT_DATE)`,
				),
			)
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
