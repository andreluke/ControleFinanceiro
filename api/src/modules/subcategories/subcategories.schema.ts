import { z } from "zod";

export const createSubcategorySchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").max(100),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inválida")
		.optional(),
	icon: z.string().optional(),
	categoryId: z.string().uuid("ID da categoria inválido"),
});

export const subcategorySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, "Nome é obrigatório").max(100),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inválida")
		.optional(),
	icon: z.string().optional().nullable(),
	categoryId: z.string().uuid("ID da categoria inválido"),
});

export type Subcategory = z.infer<typeof subcategorySchema>;

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;

export const updateSubcategorySchema = createSubcategorySchema.partial();

export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
