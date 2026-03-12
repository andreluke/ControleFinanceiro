import { z } from "zod";

export const createTransactionSchema = z.object({
	description: z.string().min(1, "Descrição é obrigatória").max(120),
	subDescription: z.string().max(120).optional(),
	amount: z.number().positive("O valor deve ser positivo"),
	type: z.enum(["income", "expense"], {
		errorMap: () => ({ message: "O tipo deve ser income ou expense" }),
	}),
	date: z.string().datetime({ message: "A data deve ser ISO 8601 válida" }),
	categoryId: z.string().uuid("ID de categoria inválido").optional(),
	paymentMethodId: z
		.string()
		.uuid("ID de método de pagamento inválido")
		.optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsSchema = z.object({
	month: z
		.string()
		.regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (esperado: YYYY-MM)")
		.optional(),
	type: z.enum(["income", "expense"]).optional(),
	categoryId: z.string().uuid().optional(),
	paymentMethodId: z.string().uuid().optional(),
	startDate: z
		.string()
		.datetime({ message: "startDate deve ser ISO 8601 válida" })
		.optional(),
	endDate: z
		.string()
		.datetime({ message: "endDate deve ser ISO 8601 válida" })
		.optional(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
