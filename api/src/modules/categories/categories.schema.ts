import { z } from "zod";

export const createCategorySchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").max(100),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inválida")
		.optional(),
	icon: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
