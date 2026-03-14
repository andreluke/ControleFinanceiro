import type { FastifyInstance } from "fastify";
import DashboardSeedController from "./dashboard.seed.controller";

export async function registerSeedDashboardRoutes(app: FastifyInstance) {
	app.post(
		"/seed/dashboard/import",
		DashboardSeedController.importFromExcel.bind(DashboardSeedController),
	);
	app.get(
		"/seed/dashboard/export/excel",
		DashboardSeedController.exportExcel.bind(DashboardSeedController),
	);
	app.get(
		"/seed/dashboard/export/pdf",
		DashboardSeedController.exportPdf.bind(DashboardSeedController),
	);
}
