import type { FastifyInstance } from "fastify";
import { GoalsController } from "./goals.controller";

export async function registerGoalsRoutes(app: FastifyInstance) {
	const controller = new GoalsController();

	app.addHook("onRequest", async (request, reply) => {
		const path = request.url.split("?")[0];
		const isPublicRoute =
			path === "/health" || path === "/docs" || path.startsWith("/docs/");
		if (isPublicRoute) return;

		if (!path.startsWith("/goals")) return;

		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get(
		"/goals",
		{
			schema: {
				description: "Lista metas do usuário",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
			},
		},
		controller.list,
	);

	app.post(
		"/goals",
		{
			schema: {
				description: "Cria uma nova meta",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					required: ["name", "targetAmount"],
					properties: {
						name: { type: "string", minLength: 1, maxLength: 255 },
						description: { type: "string", maxLength: 500 },
						targetAmount: { type: "number", exclusiveMinimum: 0 },
						deadline: { type: "string", format: "date-time" },
						icon: { type: "string", maxLength: 50 },
						color: { type: "string", maxLength: 20 },
					},
				},
			},
		},
		controller.create,
	);

	app.get(
		"/goals/:id",
		{
			schema: {
				description: "Detalha uma meta",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.get,
	);

	app.put(
		"/goals/:id",
		{
			schema: {
				description: "Atualiza uma meta",
				tags: ["Goals"],
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
						name: { type: "string", minLength: 1, maxLength: 255 },
						description: { type: "string", maxLength: 500 },
						targetAmount: { type: "number", exclusiveMinimum: 0 },
						deadline: { type: "string", format: "date-time" },
						icon: { type: "string", maxLength: 50 },
						color: { type: "string", maxLength: 20 },
						isActive: { type: "boolean" },
					},
				},
			},
		},
		controller.update,
	);

	app.post(
		"/goals/:id/contribute",
		{
			schema: {
				description: "Adiciona valor a uma meta",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
				body: {
					type: "object",
					required: ["amount"],
					properties: {
						amount: { type: "number", exclusiveMinimum: 0 },
					},
				},
			},
		},
		controller.contribute,
	);

	app.post(
		"/goals/:id/withdraw",
		{
			schema: {
				description: "Saca valor de uma meta",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
				body: {
					type: "object",
					required: ["amount"],
					properties: {
						amount: { type: "number", exclusiveMinimum: 0 },
					},
				},
			},
		},
		controller.withdraw,
	);

	app.delete(
		"/goals/:id",
		{
			schema: {
				description: "Deleta uma meta",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.delete,
	);

	app.get(
		"/goals/:id/contributions",
		{
			schema: {
				description: "Lista contribuições de uma meta",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.listContributions,
	);

	app.delete(
		"/goals/contributions/:id",
		{
			schema: {
				description: "Remove uma contribuição",
				tags: ["Goals"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.removeContribution,
	);
}
