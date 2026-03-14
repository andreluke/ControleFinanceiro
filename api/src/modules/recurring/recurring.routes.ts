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

	app.get(
		"/recurring",
		{
			schema: {
				description: "Lista todas as transações recorrentes do usuário",
				tags: ["Recurring"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						includeInactive: { type: "boolean" },
					},
				},
			},
		},
		controller.listRecurringTransactions,
	);

	app.get(
		"/recurring/:id",
		{
			schema: {
				description: "Retorna uma transação recorrente pelo ID",
				tags: ["Recurring"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.getRecurringTransaction,
	);

	app.post(
		"/recurring",
		{
			schema: {
				description: "Cria uma nova transação recorrente",
				tags: ["Recurring"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					required: ["description", "amount", "type", "date", "frequency"],
					properties: {
						description: { type: "string" },
						amount: { type: "number" },
						type: { type: "string", enum: ["income", "expense"] },
						date: { type: "string", format: "date" },
						frequency: {
							type: "string",
							enum: ["daily", "weekly", "monthly", "yearly", "custom"],
						},
						customIntervalDays: { type: "integer" },
						categoryId: { type: "string", format: "uuid" },
						paymentMethodId: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.createRecurringTransaction,
	);

	app.put(
		"/recurring/:id",
		{
			schema: {
				description: "Atualiza uma transação recorrente",
				tags: ["Recurring"],
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
						frequency: {
							type: "string",
							enum: ["daily", "weekly", "monthly", "yearly", "custom"],
						},
						customIntervalDays: { type: "integer" },
						categoryId: { type: "string", format: "uuid" },
						paymentMethodId: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.updateRecurringTransaction,
	);

	app.patch(
		"/recurring/:id/toggle",
		{
			schema: {
				description: "Ativa ou desativa uma transação recorrente",
				tags: ["Recurring"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.toggleRecurringTransaction,
	);

	app.delete(
		"/recurring/:id",
		{
			schema: {
				description: "Deleta uma transação recorrente",
				tags: ["Recurring"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.deleteRecurringTransaction,
	);

	app.post(
		"/recurring/:id/process",
		{
			schema: {
				description: "Processa manualmente uma transação recorrente",
				tags: ["Recurring"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.processRecurringTransaction,
	);
}
