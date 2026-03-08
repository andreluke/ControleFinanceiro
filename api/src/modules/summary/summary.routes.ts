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

	app.get("/summary", summaryController.getSummary);
	app.get("/summary/monthly", summaryController.getMonthlySummary);
	app.get("/summary/by-category", summaryController.getByCategorySummary);
}
