import { z } from "zod";

export const createPaymentMethodSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").max(100),
});

export type CreatePaymentMethodInput = z.infer<
	typeof createPaymentMethodSchema
>;

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial();

export type UpdatePaymentMethodInput = z.infer<
	typeof updatePaymentMethodSchema
>;
