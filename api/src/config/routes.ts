import type { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "../modules/auth/auth.routes";
import { registerCategoriesRoutes } from "../modules/categories/categories.routes";
import { registerNotificationRoutes } from "../modules/notifications/notifications.routes";
import { registerPaymentMethodsRoutes } from "../modules/payment-methods/payment-methods.routes";
import { registerRecurringRoutes } from "../modules/recurring/recurring.routes";
import { registerSummaryRoutes } from "../modules/summary/summary.routes";
import { registerTransactionsRoutes } from "../modules/transactions/transactions.routes";

export async function registerRoutes(app: FastifyInstance) {
	app.get("/health", async () => ({
		status: "ok",
		timestamp: new Date().toISOString(),
	}));
	await app.register(registerAuthRoutes);
	await app.register(registerCategoriesRoutes);
	await app.register(registerNotificationRoutes);
	await app.register(registerPaymentMethodsRoutes);
	await app.register(registerRecurringRoutes);
	await app.register(registerTransactionsRoutes);
	await app.register(registerSummaryRoutes);
}
