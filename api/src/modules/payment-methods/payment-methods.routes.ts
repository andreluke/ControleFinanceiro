import type { FastifyInstance } from "fastify";
import { PaymentMethodsController } from "./payment-methods.controller";

export async function registerPaymentMethodsRoutes(app: FastifyInstance) {
	const paymentMethodsController = new PaymentMethodsController();

	app.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get("/payment-methods", paymentMethodsController.listPaymentMethods);
	app.post("/payment-methods", paymentMethodsController.createPaymentMethod);
	app.put("/payment-methods/:id", paymentMethodsController.updatePaymentMethod);
	app.delete(
		"/payment-methods/:id",
		paymentMethodsController.deletePaymentMethod,
	);
	app.patch(
		"/payment-methods/:id/restore",
		paymentMethodsController.restorePaymentMethod,
	);
}
