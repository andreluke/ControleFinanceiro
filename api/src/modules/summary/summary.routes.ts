import type { FastifyInstance } from "fastify";
import { SummaryController } from "./summary.controller";

export async function registerSummaryRoutes(app: FastifyInstance) {
	const summaryController = new SummaryController();

	const PUBLIC_ROUTES = ["/health", "/docs"];

	app.addHook("onRequest", async (request, reply) => {
		const path = request.url.split("?")[0];
		const isPublicRoute = PUBLIC_ROUTES.some(
			(route) => path === route || path.startsWith(`${route}/`),
		);
		if (isPublicRoute) return;

		// Only apply JWT verification to /summary routes
		if (!path.startsWith("/summary")) return;

		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get(
		"/summary",
		{
			schema: {
				description: "Retorna o resumo geral das finanças",
				tags: ["Summary"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						month: { type: "string", description: "Mês específico (YYYY-MM)" },
					},
				},
			},
		},
		summaryController.getSummary,
	);

	app.get(
		"/summary/monthly",
		{
			schema: {
				description: "Retorna o resumo mensal das finanças",
				tags: ["Summary"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						months: { type: "integer", description: "Quantidade de meses" },
					},
				},
			},
		},
		summaryController.getMonthlySummary,
	);

	app.get(
		"/summary/by-category",
		{
			schema: {
				description: "Retorna o resumo por categoria",
				tags: ["Summary"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						month: { type: "string", description: "Mês específico (YYYY-MM)" },
						type: { type: "string", enum: ["income", "expense"] },
					},
				},
			},
		},
		summaryController.getByCategorySummary,
	);

	app.get(
		"/summary/forecast",
		{
			schema: {
				description: "Retorna a previsão de fechamento do mês",
				tags: ["Summary"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						month: {
							type: "integer",
							minimum: 1,
							maximum: 12,
							description: "Mês (1-12)",
						},
						year: { type: "integer", minimum: 2020, description: "Ano" },
					},
				},
			},
		},
		summaryController.getForecast,
	);
}
