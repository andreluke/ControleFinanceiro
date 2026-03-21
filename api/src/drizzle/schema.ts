import {
	boolean,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
	"income",
	"expense",
]);

export const frequencyEnum = pgEnum("frequency_type", [
	"daily",
	"weekly",
	"monthly",
	"yearly",
	"custom",
]);

export const budgetPeriodEnum = pgEnum("budget_period", ["monthly"]);

export const notificationTypeEnum = pgEnum("notification_type", [
	"budget_warning",
	"budget_exceeded",
	"goal_milestone",
]);

export const notificationEntityTypeEnum = pgEnum("notification_entity_type", [
	"budget",
	"goal",
]);

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	color: text("color").notNull().default("#3B82F6"),
	icon: text("icon"),
	deletedAt: timestamp("deleted_at"),
});

export const subcategories = pgTable("subcategories", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	categoryId: uuid("category_id")
		.references(() => categories.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	color: text("color").notNull().default("#3B82F6"),
	icon: text("icon"),
	deletedAt: timestamp("deleted_at"),
});

export const paymentMethods = pgTable("payment_methods", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	deletedAt: timestamp("deleted_at"),
});

export const transactions = pgTable("transactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	categoryId: uuid("category_id").references(() => categories.id),
	subcategoryId: uuid("subcategory_id").references(() => subcategories.id),
	paymentMethodId: uuid("payment_method_id").references(
		() => paymentMethods.id,
	),
	description: text("description").notNull(),
	subDescription: text("sub_description"),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	type: transactionTypeEnum("type").notNull(),
	date: timestamp("date").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const recurringTransactions = pgTable("recurring_transactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	description: text("description").notNull(),
	subDescription: text("sub_description"),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	type: transactionTypeEnum("type").notNull(),
	categoryId: uuid("category_id").references(() => categories.id),
	subcategoryId: uuid("subcategory_id").references(() => subcategories.id),
	paymentMethodId: uuid("payment_method_id").references(
		() => paymentMethods.id,
	),
	frequency: frequencyEnum("frequency").notNull(),
	customIntervalDays: numeric("custom_interval_days"),
	dayOfMonth: numeric("day_of_month").notNull(),
	dayOfWeek: numeric("day_of_week"),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	isActive: boolean("is_active").notNull().default(true),
	lastGeneratedAt: timestamp("last_generated_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	categoryId: uuid("category_id")
		.references(() => categories.id)
		.notNull(),
	subcategoryId: uuid("subcategory_id").references(() => subcategories.id),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	baseAmount: numeric("base_amount", { precision: 12, scale: 2 }),
	period: budgetPeriodEnum("period").notNull().default("monthly"),
	month: numeric("month", { precision: 2 }).notNull(),
	year: numeric("year", { precision: 4 }).notNull(),
	isRecurring: boolean("is_recurring").notNull().default(false),
	isActive: boolean("is_active").notNull().default(true),
	recurringGroupId: uuid("recurring_group_id"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	description: text("description"),
	targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
	currentAmount: numeric("current_amount", { precision: 12, scale: 2 })
		.notNull()
		.default("0"),
	deadline: timestamp("deadline"),
	icon: text("icon"),
	color: text("color").notNull().default("#3B82F6"),
	isActive: boolean("is_active").notNull().default(true),
	categoryId: uuid("category_id").references(() => categories.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const goalContributions = pgTable("goal_contributions", {
	id: uuid("id").primaryKey().defaultRandom(),
	goalId: uuid("goal_id")
		.references(() => goals.id, { onDelete: "cascade" })
		.notNull(),
	transactionId: uuid("transaction_id")
		.references(() => transactions.id, { onDelete: "cascade" })
		.notNull(),
	type: text("type").notNull().default("deposit"),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	type: notificationTypeEnum("type").notNull(),
	title: text("title").notNull(),
	body: text("body"),
	entityType: notificationEntityTypeEnum("entity_type"),
	entityId: uuid("entity_id"),
	isRead: boolean("is_read").notNull().default(false),
	createdAt: timestamp("created_at").defaultNow(),
});

export const notificationSettings = pgTable("notification_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull()
		.unique(),
	budgetWarningPct: integer("budget_warning_pct").notNull().default(80),
	budgetExceeded: boolean("budget_exceeded").notNull().default(true),
	goalMilestones: boolean("goal_milestones").notNull().default(true),
	emailEnabled: boolean("email_enabled").notNull().default(false),
	emailAddress: text("email_address"),
	updatedAt: timestamp("updated_at").defaultNow(),
});
