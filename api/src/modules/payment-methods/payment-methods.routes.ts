import type { FastifyInstance } from "fastify";
import { PaymentMethodsController } from "./payment-methods.controller";

export async function registerPaymentMethodsRoutes(app: FastifyInstance) {
	const paymentMethodsController = new PaymentMethodsController();

	const PUBLIC_ROUTES = ["/health", "/docs"];

	app.addHook("onRequest", async (request, reply) => {
		const path = request.url.split("?")[0];
		const isPublicRoute = PUBLIC_ROUTES.some(
			(route) => path === route || path.startsWith(`${route}/`),
		);
		if (isPublicRoute) return;

		// Only apply JWT verification to /payment-methods routes
		if (!path.startsWith("/payment-methods")) return;

		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get(
		"/payment-methods",
		{
			schema: {
				description: "Lista todos os métodos de pagamento do usuário",
				tags: ["Payment Methods"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						includeDeleted: { type: "boolean" },
					},
				},
			},
		},
		paymentMethodsController.listPaymentMethods,
	);

	app.post(
		"/payment-methods",
		{
			schema: {
				description: "Cria um novo método de pagamento",
				tags: ["Payment Methods"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					required: ["name"],
					properties: {
						name: { type: "string" },
					},
				},
			},
		},
		paymentMethodsController.createPaymentMethod,
	);

	app.put(
		"/payment-methods/:id",
		{
			schema: {
				description: "Atualiza um método de pagamento",
				tags: ["Payment Methods"],
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
						name: { type: "string" },
					},
				},
			},
		},
		paymentMethodsController.updatePaymentMethod,
	);

	app.delete(
		"/payment-methods/:id",
		{
			schema: {
				description: "Soft delete de um método de pagamento",
				tags: ["Payment Methods"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		paymentMethodsController.deletePaymentMethod,
	);

	app.patch(
		"/payment-methods/:id/restore",
		{
			schema: {
				description: "Restaura um método de pagamento deletado",
				tags: ["Payment Methods"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		paymentMethodsController.restorePaymentMethod,
	);
}
