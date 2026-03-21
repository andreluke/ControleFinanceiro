import { z } from "zod";

export const notificationTypeEnum = z.enum([
	"budget_warning",
	"budget_exceeded",
	"goal_milestone",
]);

export const notificationEntityTypeEnum = z.enum(["budget", "goal"]);

export const notificationResponseSchema = z.object({
	id: z.string().uuid(),
	type: notificationTypeEnum,
	title: z.string(),
	body: z.string().nullable(),
	entityType: notificationEntityTypeEnum.nullable(),
	entityId: z.string().uuid().nullable(),
	isRead: z.boolean(),
	createdAt: z.string(),
});

export const listNotificationsQuerySchema = z.object({
	isRead: z.enum(["true", "false"]).optional().transform((val) => {
		if (val === "true") return true;
		if (val === "false") return false;
		return undefined;
	}),
	limit: z.string().optional().transform(Number),
	offset: z.string().optional().transform(Number),
});

export const markAsReadSchema = z.object({
	id: z.string().uuid(),
});

export const markAllAsReadSchema = z.object({});

export const deleteNotificationSchema = z.object({
	id: z.string().uuid(),
});

export const notificationSettingsResponseSchema = z.object({
	id: z.string().uuid(),
	budgetWarningPct: z.number(),
	budgetExceeded: z.boolean(),
	goalMilestones: z.boolean(),
	emailEnabled: z.boolean(),
	emailAddress: z.string().nullable(),
});

export const updateNotificationSettingsSchema = z.object({
	budgetWarningPct: z.number().min(1).max(100).optional(),
	budgetExceeded: z.boolean().optional(),
	goalMilestones: z.boolean().optional(),
	emailEnabled: z.boolean().optional(),
	emailAddress: z.string().email().nullable().optional(),
});

export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type NotificationSettingsResponse = z.infer<typeof notificationSettingsResponseSchema>;
export type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>;
