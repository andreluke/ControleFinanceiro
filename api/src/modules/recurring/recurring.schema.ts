import { z } from "zod";

const recurringTransactionBaseSchema = z.object({
	description: z.string().min(1, "Descrição é obrigatória").max(120),
	subDescription: z.string().max(120).optional(),
	amount: z.number().positive("O valor deve ser positivo"),
	type: z.enum(["income", "expense"], {
		errorMap: () => ({ message: "O tipo deve ser income ou expense" }),
	}),
	categoryId: z.string().optional().transform((val) => (val === "" || val === "none" ? undefined : val)),
	subcategoryId: z.string().optional().transform((val) => (val === "" || val === "none" ? undefined : val)),
	paymentMethodId: z.string().optional().transform((val) => (val === "" || val === "none" ? undefined : val)),
	frequency: z.enum(["daily", "weekly", "monthly", "yearly", "custom"], {
		errorMap: () => ({ message: "Frequência inválida" }),
	}),
	customIntervalDays: z
		.number()
		.min(1, "Intervalo deve ser pelo menos 1 dia")
		.max(365, "Intervalo máximo é 365 dias")
		.optional(),
	dayOfMonth: z
		.number()
		.min(1, "Dia do mês deve ser entre 1 e 31")
		.max(31, "Dia do mês deve ser entre 1 e 31"),
	dayOfWeek: z.number().min(0).max(6).optional(),
	startDate: z.string().datetime({
		message: "Data inicial deve ser ISO 8601 válida",
	}),
	endDate: z
		.string()
		.refine((val) => !val || !Number.isNaN(Date.parse(val)), {
			message: "Data final deve ser ISO 8601 válida",
		})
		.optional()
		.nullable()
		.transform((val) => {
			if (val === "" || val === null) return undefined;
			return val;
		}),
});

export const createRecurringTransactionSchema =
	recurringTransactionBaseSchema.refine(
		(data) => {
			if (data.frequency === "custom") {
				return (
					data.customIntervalDays !== undefined && data.customIntervalDays > 0
				);
			}
			return true;
		},
		{
			message: "Intervalo personalizado é obrigatório para frequência custom",
			path: ["customIntervalDays"],
		},
	);

export const updateRecurringTransactionSchema =
	recurringTransactionBaseSchema.partial();

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

export type FrequencyType =
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly"
	| "custom";
