import type { FastifyInstance } from "fastify";
import { TransactionsController } from "./transactions.controller";

export async function registerTransactionsRoutes(app: FastifyInstance) {
	const transactionsController = new TransactionsController();

	app.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get("/transactions", transactionsController.listTransactions);
	app.get("/transactions/:id", transactionsController.getTransaction);
	app.post("/transactions", transactionsController.createTransaction);
	app.put("/transactions/:id", transactionsController.updateTransaction);
	app.delete("/transactions/:id", transactionsController.deleteTransaction);
}
