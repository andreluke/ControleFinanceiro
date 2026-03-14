import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const exportFilterSchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	type: transactionTypeSchema.optional(),
	categoryId: z.string().optional(),
});

export type ExportFilter = z.infer<typeof exportFilterSchema>;

export const transactionRowSchema = z.object({
	date: z.string(),
	description: z.string(),
	category: z.string(),
	categoryColor: z.string(),
	paymentMethod: z.string(),
	type: transactionTypeSchema,
	amount: z.number(),
});

export type TransactionRow = z.infer<typeof transactionRowSchema>;

export const categorySummarySchema = z.object({
	category: z.string(),
	categoryColor: z.string(),
	total: z.number(),
	percentage: z.number(),
});

export type CategorySummary = z.infer<typeof categorySummarySchema>;

export const monthlySummarySchema = z.object({
	month: z.string(),
	income: z.number(),
	expense: z.number(),
	balance: z.number(),
});

export type MonthlySummary = z.infer<typeof monthlySummarySchema>;

export const dashboardSummarySchema = z.object({
	totalIncome: z.number(),
	totalExpense: z.number(),
	balance: z.number(),
	byCategory: z.array(categorySummarySchema),
	byMonth: z.array(monthlySummarySchema),
	transactionCount: z.number(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
