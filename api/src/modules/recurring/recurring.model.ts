import { and, asc, eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import {
	recurringTransactions,
	categories,
	paymentMethods,
} from "../../drizzle/schema";
import type {
	CreateRecurringTransactionInput,
	UpdateRecurringTransactionInput,
	ListRecurringTransactionsInput,
} from "./recurring.schema";

export class RecurringTransactionModel {
	async findAll(userId: string, filters?: ListRecurringTransactionsInput) {
		let conditions = eq(recurringTransactions.userId, userId);

		if (filters?.isActive !== undefined) {
			conditions = and(
				conditions,
				eq(recurringTransactions.isActive, filters.isActive),
			) as typeof conditions;
		}

		if (filters?.type) {
			conditions = and(
				conditions,
				eq(recurringTransactions.type, filters.type),
			) as typeof conditions;
		}

		return db
			.select({
				id: recurringTransactions.id,
				description: recurringTransactions.description,
				subDescription: recurringTransactions.subDescription,
				amount: recurringTransactions.amount,
				type: recurringTransactions.type,
				categoryId: recurringTransactions.categoryId,
				category: {
					id: categories.id,
					name: categories.name,
					color: categories.color,
					icon: categories.icon,
				},
				paymentMethodId: recurringTransactions.paymentMethodId,
				paymentMethod: {
					id: paymentMethods.id,
					name: paymentMethods.name,
				},
				frequency: recurringTransactions.frequency,
				dayOfMonth: recurringTransactions.dayOfMonth,
				dayOfWeek: recurringTransactions.dayOfWeek,
				startDate: recurringTransactions.startDate,
				endDate: recurringTransactions.endDate,
				isActive: recurringTransactions.isActive,
				lastGeneratedAt: recurringTransactions.lastGeneratedAt,
				createdAt: recurringTransactions.createdAt,
			})
			.from(recurringTransactions)
			.leftJoin(categories, eq(recurringTransactions.categoryId, categories.id))
			.leftJoin(
				paymentMethods,
				eq(recurringTransactions.paymentMethodId, paymentMethods.id),
			)
			.where(conditions)
			.orderBy(asc(recurringTransactions.createdAt));
	}

	async findById(id: string, userId: string) {
		const [recurring] = await db
			.select({
				id: recurringTransactions.id,
				description: recurringTransactions.description,
				subDescription: recurringTransactions.subDescription,
				amount: recurringTransactions.amount,
				type: recurringTransactions.type,
				categoryId: recurringTransactions.categoryId,
				category: {
					id: categories.id,
					name: categories.name,
					color: categories.color,
					icon: categories.icon,
				},
				paymentMethodId: recurringTransactions.paymentMethodId,
				paymentMethod: {
					id: paymentMethods.id,
					name: paymentMethods.name,
				},
				frequency: recurringTransactions.frequency,
				dayOfMonth: recurringTransactions.dayOfMonth,
				dayOfWeek: recurringTransactions.dayOfWeek,
				startDate: recurringTransactions.startDate,
				endDate: recurringTransactions.endDate,
				isActive: recurringTransactions.isActive,
				lastGeneratedAt: recurringTransactions.lastGeneratedAt,
				createdAt: recurringTransactions.createdAt,
			})
			.from(recurringTransactions)
			.leftJoin(categories, eq(recurringTransactions.categoryId, categories.id))
			.leftJoin(
				paymentMethods,
				eq(recurringTransactions.paymentMethodId, paymentMethods.id),
			)
			.where(
				and(
					eq(recurringTransactions.id, id),
					eq(recurringTransactions.userId, userId),
				),
			)
			.limit(1);
		return recurring;
	}

	async createRecurringTransaction(
		userId: string,
		data: CreateRecurringTransactionInput,
	) {
		const [recurring] = await db
			.insert(recurringTransactions)
			.values({
				userId,
				description: data.description,
				subDescription: data.subDescription,
				amount: data.amount.toString(),
				type: data.type,
				categoryId: data.categoryId,
				paymentMethodId: data.paymentMethodId,
				frequency: data.frequency,
				dayOfMonth: data.dayOfMonth.toString(),
				dayOfWeek: data.dayOfWeek?.toString(),
				startDate: new Date(data.startDate),
				endDate: data.endDate ? new Date(data.endDate) : null,
				isActive: true,
			})
			.returning();
		return recurring;
	}

	async updateRecurringTransaction(
		id: string,
		userId: string,
		data: UpdateRecurringTransactionInput,
	) {
		const updateData: Record<string, unknown> = { ...data };

		if (data.amount !== undefined) {
			updateData.amount = data.amount.toString();
		}

		if (data.dayOfMonth !== undefined) {
			updateData.dayOfMonth = data.dayOfMonth.toString();
		}

		if (data.dayOfWeek !== undefined) {
			updateData.dayOfWeek = data.dayOfWeek.toString();
		}

		if (data.startDate !== undefined) {
			updateData.startDate = new Date(data.startDate);
		}

		if (data.endDate !== undefined) {
			updateData.endDate = new Date(data.endDate);
		}

		updateData.updatedAt = new Date();

		const [updated] = await db
			.update(recurringTransactions)
			.set(updateData)
			.where(
				and(
					eq(recurringTransactions.id, id),
					eq(recurringTransactions.userId, userId),
				),
			)
			.returning();
		return updated;
	}

	async toggleActive(id: string, userId: string) {
		const existing = await this.findById(id, userId);
		if (!existing) return null;

		const [updated] = await db
			.update(recurringTransactions)
			.set({ isActive: !existing.isActive, updatedAt: new Date() })
			.where(
				and(
					eq(recurringTransactions.id, id),
					eq(recurringTransactions.userId, userId),
				),
			)
			.returning();
		return updated;
	}

	async softDelete(id: string, userId: string) {
		const [deleted] = await db
			.update(recurringTransactions)
			.set({ isActive: false, updatedAt: new Date() })
			.where(
				and(
					eq(recurringTransactions.id, id),
					eq(recurringTransactions.userId, userId),
				),
			)
			.returning();
		return deleted;
	}
}
