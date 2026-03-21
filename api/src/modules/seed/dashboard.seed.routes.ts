import type { FastifyInstance } from "fastify";
import DashboardSeedController from "./dashboard.seed.controller";

export async function registerSeedDashboardRoutes(app: FastifyInstance) {
	app.post(
		"/seed/dashboard/import",
		{
			schema: {
				description: "Importa transações a partir de um arquivo Excel",
				tags: ["Seed"],
			},
		},
		DashboardSeedController.importFromExcel.bind(DashboardSeedController),
	);

	app.get(
		"/seed/dashboard/export/excel",
		{
			schema: {
				description: "Exporta relatório financeiro em formato Excel (.xlsx)",
				tags: ["Export"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						startDate: {
							type: "string",
							description: "Data inicial (YYYY-MM-DD)",
						},
						endDate: { type: "string", description: "Data final (YYYY-MM-DD)" },
					},
				},
			},
		},
		DashboardSeedController.exportExcel.bind(DashboardSeedController),
	);

	app.get(
		"/seed/dashboard/export/pdf",
		{
			schema: {
				description: "Exporta relatório financeiro em formato PDF",
				tags: ["Export"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						startDate: {
							type: "string",
							description: "Data inicial (YYYY-MM-DD)",
						},
						endDate: { type: "string", description: "Data final (YYYY-MM-DD)" },
					},
				},
			},
		},
		DashboardSeedController.exportPdf.bind(DashboardSeedController),
	);

	app.get(
		"/seed/dashboard/export/csv",
		{
			schema: {
				description: "Exporta transações em formato CSV",
				tags: ["Export"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						startDate: {
							type: "string",
							description: "Data inicial (YYYY-MM-DD)",
						},
						endDate: { type: "string", description: "Data final (YYYY-MM-DD)" },
					},
				},
			},
		},
		DashboardSeedController.exportCsv.bind(DashboardSeedController),
	);
}
