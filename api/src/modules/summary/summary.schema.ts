import { z } from "zod";

export const summaryPeriodSchema = z.enum(["7d", "30d", "month", "previous"]);
export type SummaryPeriod = z.infer<typeof summaryPeriodSchema>;

export const summaryQuerySchema = z.object({
	month: z
		.string()
		.regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (esperado: YYYY-MM)")
		.optional(),
	period: summaryPeriodSchema.optional(),
	type: z.enum(["income", "expense"]).optional(),
});

export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;

export const forecastQuerySchema = z.object({
	month: z.coerce.number().int().min(1).max(12).optional(),
	year: z.coerce.number().int().min(2020).optional(),
});

export type ForecastQueryInput = z.infer<typeof forecastQuerySchema>;
