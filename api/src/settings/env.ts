import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().default(8080),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(32),
	CORS_ORIGIN: z.string().default("*"),
	API_URL: z.string().url().default("http://localhost:3000"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

export const env = envSchema.parse(process.env);
