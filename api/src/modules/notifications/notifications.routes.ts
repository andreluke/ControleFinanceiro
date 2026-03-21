import type { FastifyInstance } from "fastify";
import { notificationController } from "./notifications.controller";

export async function registerNotificationRoutes(app: FastifyInstance) {
	app.addHook("onRequest", async (request, reply) => {
		const path = request.url.split("?")[0];
		if (!path.startsWith("/notifications")) return;

		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get("/notifications", notificationController.list.bind(notificationController));
	app.get("/notifications/unread-count", notificationController.getUnreadCount.bind(notificationController));
	app.patch("/notifications/:id/read", notificationController.markAsRead.bind(notificationController));
	app.patch("/notifications/read-all", notificationController.markAllAsRead.bind(notificationController));
	app.delete("/notifications/:id", notificationController.delete.bind(notificationController));
	app.get("/notifications/settings", notificationController.getSettings.bind(notificationController));
	app.put("/notifications/settings", notificationController.updateSettings.bind(notificationController));
}
