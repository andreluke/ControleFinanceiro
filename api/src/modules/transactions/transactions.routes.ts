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

	app.get(
		"/transactions",
		{
			schema: {
				description: "Lista todas as transações do usuário",
				tags: ["Transactions"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						type: { type: "string", enum: ["income", "expense"] },
						categoryId: { type: "string", format: "uuid" },
						page: { type: "integer" },
						limit: { type: "integer" },
					},
				},
			},
		},
		transactionsController.listTransactions,
	);

	app.get(
		"/transactions/:id",
		{
			schema: {
				description: "Retorna uma transação pelo ID",
				tags: ["Transactions"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		transactionsController.getTransaction,
	);

	app.post(
		"/transactions",
		{
			schema: {
				description: "Cria uma nova transação",
				tags: ["Transactions"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					required: ["description", "amount", "type", "date"],
					properties: {
						description: { type: "string" },
						amount: { type: "number" },
						type: { type: "string", enum: ["income", "expense"] },
						date: { type: "string", format: "date" },
						categoryId: { type: "string", format: "uuid" },
						paymentMethodId: { type: "string", format: "uuid" },
					},
				},
			},
		},
		transactionsController.createTransaction,
	);

	app.put(
		"/transactions/:id",
		{
			schema: {
				description: "Atualiza uma transação",
				tags: ["Transactions"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
				body: {
					type: "object",
					properties: {
						description: { type: "string" },
						amount: { type: "number" },
						type: { type: "string", enum: ["income", "expense"] },
						date: { type: "string", format: "date" },
						categoryId: { type: "string", format: "uuid" },
						paymentMethodId: { type: "string", format: "uuid" },
					},
				},
			},
		},
		transactionsController.updateTransaction,
	);

	app.delete(
		"/transactions/:id",
		{
			schema: {
				description: "Deleta uma transação",
				tags: ["Transactions"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		transactionsController.deleteTransaction,
	);
}
