import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { notifications, notificationSettings } from "../../drizzle/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

type Notification = InferSelectModel<typeof notifications>;
type NewNotification = InferInsertModel<typeof notifications>;
type NewNotificationSetting = InferInsertModel<typeof notificationSettings>;

export class NotificationModel {
	async findAll(userId: string, options?: { isRead?: boolean; limit?: number; offset?: number }) {
		const { isRead, limit = 20, offset = 0 } = options || {};

		const conditions = [eq(notifications.userId, userId)];
		if (isRead !== undefined) {
			conditions.push(eq(notifications.isRead, isRead));
		}

		const results = await db
			.select()
			.from(notifications)
			.where(and(...conditions))
			.orderBy(desc(notifications.createdAt))
			.limit(limit)
			.offset(offset);

		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(notifications)
			.where(eq(notifications.userId, userId));

		return { data: results, total: count };
	}

	async findById(id: string, userId: string) {
		const [notification] = await db
			.select()
			.from(notifications)
			.where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
			.limit(1);
		return notification;
	}

	async countUnread(userId: string) {
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(notifications)
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
		return count;
	}

	async create(data: NewNotification) {
		const [notification] = await db.insert(notifications).values(data).returning();
		return notification;
	}

	async markAsRead(id: string, userId: string) {
		const [updated] = await db
			.update(notifications)
			.set({ isRead: true })
			.where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
			.returning();
		return updated;
	}

	async markAllAsRead(userId: string) {
		await db
			.update(notifications)
			.set({ isRead: true })
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
	}

	async delete(id: string, userId: string) {
		const [deleted] = await db
			.delete(notifications)
			.where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
			.returning();
		return deleted;
	}

	async checkRecentNotification(
		userId: string,
		type: string,
		entityId: string,
		hoursAgo = 24,
	) {
		const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
		const [existing] = await db
			.select()
			.from(notifications)
			.where(
				and(
					eq(notifications.userId, userId),
					eq(notifications.type, type as Notification["type"]),
					eq(notifications.entityId, entityId),
					gte(notifications.createdAt, cutoff),
				),
			)
			.limit(1);
		return !!existing;
	}
}

export class NotificationSettingsModel {
	async findByUserId(userId: string) {
		const [settings] = await db
			.select()
			.from(notificationSettings)
			.where(eq(notificationSettings.userId, userId))
			.limit(1);
		return settings;
	}

	async createOrUpdate(userId: string, data: Partial<NewNotificationSetting>) {
		const existing = await this.findByUserId(userId);

		if (existing) {
			const [updated] = await db
				.update(notificationSettings)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(notificationSettings.userId, userId))
				.returning();
			return updated;
		}

		const [created] = await db
			.insert(notificationSettings)
			.values({ userId, ...data })
			.returning();
		return created;
	}
}

export const notificationModel = new NotificationModel();
export const notificationSettingsModel = new NotificationSettingsModel();
