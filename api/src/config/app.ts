import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { errorHandler } from "../errors/errorHandler";
import { registerBudgetsRoutes } from "../modules/budgets/budgets.routes";
import { registerGoalsRoutes } from "../modules/goals/goals.routes";
import { registerSeedDashboardRoutes } from "../modules/seed/dashboard.seed.routes";
import { registerSubcategoriesRoutes } from "../modules/subcategories/subcategories.routes";
import { env } from "../settings/env";
import { registerRoutes } from "./routes";

export async function buildApp() {
	const isTest = process.env.NODE_ENV === "test";

	const app = Fastify({
		logger: isTest
			? false
			: {
					transport: {
						target: "pino-pretty",
						options: {
							translateTime: "HH:MM:ss",
							ignore: "pid,hostname",
							colorize: true,
						},
					},
				},
	});

	await app.register(cookie);
	await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
	await app.register(jwt, { secret: env.JWT_SECRET });

	await app.register(swagger, {
		openapi: {
			info: {
				title: "FinanceApp API",
				version: "1.0.0",
				description: "API para controle financeiro pessoal",
			},
			servers: [
				{ url: env.API_URL, description: "Servidor de produção" },
				{ url: "http://localhost:3000", description: "Servidor local" },
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
				schemas: {
					ExportFilter: {
						type: "object",
						properties: {
							startDate: {
								type: "string",
								format: "date",
								description: "Data inicial (YYYY-MM-DD)",
							},
							endDate: {
								type: "string",
								format: "date",
								description: "Data final (YYYY-MM-DD)",
							},
							type: {
								type: "string",
								enum: ["income", "expense"],
								description: "Tipo de transação",
							},
							categoryId: {
								type: "string",
								format: "uuid",
								description: "ID da categoria",
							},
						},
					},
					ErrorResponse: {
						type: "object",
						properties: {
							message: { type: "string" },
							statusCode: { type: "number" },
						},
					},
				},
			},
			security: [{ bearerAuth: [] }],
		},
	});

	await app.register(swaggerUi, {
		routePrefix: "/docs",
		uiConfig: {
			docExpansion: "list",
			deepLinking: false,
		},
	});

	await registerRoutes(app);
	// Budgets (Metas e Orçamentos)
	await registerBudgetsRoutes(app);
	// Goals (Metas de Economia)
	await registerGoalsRoutes(app);
	// Subcategories
	await registerSubcategoriesRoutes(app);
	// Seed dashboard routes (Excel/CSV import and sample)
	await registerSeedDashboardRoutes(app);
	app.setErrorHandler(errorHandler);

	return app;
}
