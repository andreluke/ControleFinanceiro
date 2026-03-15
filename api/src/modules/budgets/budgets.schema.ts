import { z } from "zod";

export const createBudgetSchema = z.object({
	categoryId: z.string().uuid("ID da categoria inválido"),
	subcategoryId: z.string().uuid("ID da subcategoria inválido").optional(),
	amount: z.number().positive("Valor deve ser positivo"),
	month: z.number().int().min(1).max(12, "Mês inválido"),
	year: z.number().int().min(2020).max(2100, "Ano inválido"),
});

export const updateBudgetSchema = z.object({
	amount: z.number().positive("Valor deve ser positivo"),
});

export const budgetQuerySchema = z.object({
	month: z.coerce.number().int().min(1).max(12).optional(),
	year: z.coerce.number().int().min(2020).optional(),
});

export type CreateBudgetSchema = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetSchema = z.infer<typeof updateBudgetSchema>;
export type BudgetQuerySchema = z.infer<typeof budgetQuerySchema>;
