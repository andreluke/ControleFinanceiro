import type { FastifyRequest, FastifyReply } from "fastify";
import { notificationModel, notificationSettingsModel } from "./notifications.model";
import {
	listNotificationsQuerySchema,
	markAsReadSchema,
	deleteNotificationSchema,
	updateNotificationSettingsSchema,
} from "./notifications.schema";

export class NotificationController {
	async list(request: FastifyRequest, reply: FastifyReply) {
		const { sub: userId } = request.user as { sub: string };
		const query = listNotificationsQuerySchema.parse(request.query);

		const { data, total } = await notificationModel.findAll(userId, {
			isRead: query.isRead,
			limit: query.limit || 20,
			offset: query.offset || 0,
		});

		return reply.send({
			data,
			total,
			limit: query.limit || 20,
			offset: query.offset || 0,
		});
	}

	async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
		const { sub: userId } = request.user as { sub: string };
		const count = await notificationModel.countUnread(userId);
		return reply.send({ count });
	}

	async markAsRead(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		const { sub: userId } = request.user as { sub: string };
		const { id } = markAsReadSchema.parse(request.params);

		const notification = await notificationModel.markAsRead(id, userId);
		if (!notification) {
			return reply.status(404).send({ message: "Notificação não encontrada" });
		}

		return reply.send(notification);
	}

	async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
		const { sub: userId } = request.user as { sub: string };
		await notificationModel.markAllAsRead(userId);
		return reply.send({ message: "Todas as notificações marcadas como lidas" });
	}

	async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		const { sub: userId } = request.user as { sub: string };
		const { id } = deleteNotificationSchema.parse(request.params);

		const notification = await notificationModel.delete(id, userId);
		if (!notification) {
			return reply.status(404).send({ message: "Notificação não encontrada" });
		}

		return reply.send(notification);
	}

	async getSettings(request: FastifyRequest, reply: FastifyReply) {
		const { sub: userId } = request.user as { sub: string };
		let settings = await notificationSettingsModel.findByUserId(userId);

		if (!settings) {
			settings = await notificationSettingsModel.createOrUpdate(userId, {});
		}

		return reply.send(settings);
	}

	async updateSettings(request: FastifyRequest, reply: FastifyReply) {
		const { sub: userId } = request.user as { sub: string };
		const data = updateNotificationSettingsSchema.parse(request.body);

		const settings = await notificationSettingsModel.createOrUpdate(userId, data);
		return reply.send(settings);
	}
}

export const notificationController = new NotificationController();
