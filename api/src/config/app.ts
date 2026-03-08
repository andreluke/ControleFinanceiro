import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { errorHandler } from "../errors/errorHandler";
import { env } from "../settings/env";
import { registerRoutes } from "./routes";

export async function buildApp() {
	const app = Fastify({ logger: true });

	await app.register(cors, { origin: env.CORS_ORIGIN });
	await app.register(jwt, { secret: env.JWT_SECRET });

	await app.register(swagger, {
		openapi: {
			info: { title: "FinanceApp API", version: "1.0.0" },
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
			},
			security: [{ bearerAuth: [] }],
		},
	});

	await app.register(swaggerUi, {
		routePrefix: "/docs",
	});

	await registerRoutes(app);
	app.setErrorHandler(errorHandler);

	return app;
}
