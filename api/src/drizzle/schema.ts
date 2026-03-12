import {
	boolean,
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
	paymentMethodId: uuid("payment_method_id").references(
		() => paymentMethods.id,
	),
	frequency: frequencyEnum("frequency").notNull(),
	dayOfMonth: numeric("day_of_month").notNull(),
	dayOfWeek: numeric("day_of_week"),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	isActive: boolean("is_active").notNull().default(true),
	lastGeneratedAt: timestamp("last_generated_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
