import { z } from "zod";

export const summaryQuerySchema = z.object({
	month: z
		.string()
		.regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (esperado: YYYY-MM)")
		.optional(),
});

export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;
