import type { FastifyInstance } from "fastify";
import { RecurringTransactionController } from "./recurring.controller";

export async function registerRecurringRoutes(app: FastifyInstance) {
	const controller = new RecurringTransactionController();

	app.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get("/recurring", controller.listRecurringTransactions);
	app.get("/recurring/:id", controller.getRecurringTransaction);
	app.post("/recurring", controller.createRecurringTransaction);
	app.put("/recurring/:id", controller.updateRecurringTransaction);
	app.patch("/recurring/:id/toggle", controller.toggleRecurringTransaction);
	app.delete("/recurring/:id", controller.deleteRecurringTransaction);
	app.post("/recurring/:id/process", controller.processRecurringTransaction);
}
