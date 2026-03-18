import { z } from "zod";

export const createBudgetSchema = z.object({
	categoryId: z.string().uuid("ID da categoria inválido"),
	subcategoryId: z.string().uuid("ID da subcategoria inválido").optional(),
	amount: z.number().positive("Valor deve ser positivo"),
	baseAmount: z.number().optional(),
	month: z.number().int().min(1).max(12, "Mês inválido"),
	year: z.number().int().min(2020).max(2100, "Ano inválido"),
	isRecurring: z.boolean().optional().default(false),
});

export const updateBudgetSchema = z.object({
	amount: z.number().positive("Valor deve ser positivo").optional(),
	baseAmount: z.number().optional(),
	isActive: z.boolean().optional(),
	isRecurring: z.boolean().optional(),
});

export const toggleBudgetActiveSchema = z.object({
	isActive: z.boolean(),
});

export const budgetQuerySchema = z.object({
	month: z.coerce.number().int().min(1).max(12).optional(),
	year: z.coerce.number().int().min(2020).optional(),
});

export type CreateBudgetSchema = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetSchema = z.infer<typeof updateBudgetSchema>;
export type BudgetQuerySchema = z.infer<typeof budgetQuerySchema>;
