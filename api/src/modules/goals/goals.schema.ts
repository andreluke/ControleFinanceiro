import { z } from "zod";

export const createGoalSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").max(255),
	description: z.string().max(500).optional(),
	targetAmount: z.number().positive("Valor alvo deve ser positivo"),
	deadline: z.string().datetime().optional(),
	icon: z.string().max(50).optional(),
	color: z.string().max(20).optional(),
	isActive: z.boolean().optional(),
});

export const updateGoalSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").max(255),
	description: z.string().max(500).optional(),
	targetAmount: z.number().positive("Valor alvo deve ser positivo"),
	deadline: z.string().datetime().optional(),
	icon: z.string().max(50).optional(),
	color: z.string().max(20).optional(),
	isActive: z.boolean().optional(),
});

export const contributeGoalSchema = z.object({
	amount: z.number().positive("Valor deve ser positivo"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>;
