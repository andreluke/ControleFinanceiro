import type { FastifyInstance } from "fastify";
import { SummaryController } from "./summary.controller";

export async function registerSummaryRoutes(app: FastifyInstance) {
	const summaryController = new SummaryController();

	app.addHook("onRequest", async (request, reply) => {
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
}
