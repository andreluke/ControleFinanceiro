import { z } from "zod";

export const summaryPeriodSchema = z.enum(["7d", "30d", "month", "previous"]);
export type SummaryPeriod = z.infer<typeof summaryPeriodSchema>;

export const summaryQuerySchema = z.object({
	month: z
		.string()
		.regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (esperado: YYYY-MM)")
		.optional(),
	period: summaryPeriodSchema.optional(),
});

export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;
