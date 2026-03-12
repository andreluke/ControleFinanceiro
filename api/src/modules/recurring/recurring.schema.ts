import { z } from "zod";

export const createRecurringTransactionSchema = z.object({
	description: z.string().min(1, "Descrição é obrigatória").max(120),
	subDescription: z.string().max(120).optional(),
	amount: z.number().positive("O valor deve ser positivo"),
	type: z.enum(["income", "expense"], {
		errorMap: () => ({ message: "O tipo deve ser income ou expense" }),
	}),
	categoryId: z.string().uuid("ID de categoria inválido").optional(),
	paymentMethodId: z
		.string()
		.uuid("ID de método de pagamento inválido")
		.optional(),
	frequency: z.enum(["daily", "weekly", "monthly", "yearly"], {
		errorMap: () => ({ message: "Frequência inválida" }),
	}),
	dayOfMonth: z
		.number()
		.min(1, "Dia do mês deve ser entre 1 e 31")
		.max(31, "Dia do mês deve ser entre 1 e 31"),
	dayOfWeek: z.number().min(0).max(6).optional(),
	startDate: z
		.string()
		.datetime({ message: "Data inicial deve ser ISO 8601 válida" }),
	endDate: z
		.string()
		.datetime({ message: "Data final deve ser ISO 8601 válida" })
		.optional(),
});

export const updateRecurringTransactionSchema =
	createRecurringTransactionSchema.partial();

export const listRecurringTransactionsSchema = z.object({
	isActive: z.boolean().optional(),
	type: z.enum(["income", "expense"]).optional(),
});

export type CreateRecurringTransactionInput = z.infer<
	typeof createRecurringTransactionSchema
>;
export type UpdateRecurringTransactionInput = z.infer<
	typeof updateRecurringTransactionSchema
>;
export type ListRecurringTransactionsInput = z.infer<
	typeof listRecurringTransactionsSchema
>;
export type FrequencyType = "daily" | "weekly" | "monthly" | "yearly";
