import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().default(8080),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(32),
	CORS_ORIGIN: z.string().default("*"),
});

export const env = envSchema.parse(process.env);
