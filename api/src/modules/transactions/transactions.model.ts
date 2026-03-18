import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { categories, paymentMethods, subcategories, transactions } from "../../drizzle/schema";
import type {
	CreateTransactionInput,
	ListTransactionsInput,
	UpdateTransactionInput,
} from "./transactions.schema";

export class TransactionModel {
	async findAll(userId: string, filters: ListTransactionsInput) {
		const startDate = filters.startDate
			? new Date(filters.startDate)
			: undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

		const query = db
			.select({
				id: transactions.id,
				description: transactions.description,
				subDescription: transactions.subDescription,
				amount: transactions.amount,
				type: transactions.type,
				date: transactions.date,
				categoryId: transactions.categoryId,
				subcategoryId: transactions.subcategoryId,
				category: {
					id: categories.id,
					name: categories.name,
					color: categories.color,
					icon: categories.icon,
				},
				subcategory: {
					id: subcategories.id,
					name: subcategories.name,
					color: subcategories.color,
				},
				paymentMethodId: transactions.paymentMethodId,
				paymentMethod: {
					id: paymentMethods.id,
					name: paymentMethods.name,
				},
				createdAt: transactions.createdAt,
			})
			.from(transactions)
			.leftJoin(categories, eq(transactions.categoryId, categories.id))
			.leftJoin(subcategories, eq(transactions.subcategoryId, subcategories.id))
			.leftJoin(
				paymentMethods,
				eq(transactions.paymentMethodId, paymentMethods.id),
			)
			.where(
				and(
					eq(transactions.userId, userId),
					filters.type ? eq(transactions.type, filters.type) : undefined,
					filters.categoryId
						? eq(transactions.categoryId, filters.categoryId)
						: undefined,
					filters.paymentMethodId
						? eq(transactions.paymentMethodId, filters.paymentMethodId)
						: undefined,
					filters.month
						? sql`to_char(${transactions.date}, 'YYYY-MM') = ${filters.month}`
						: undefined,
					startDate ? gte(transactions.date, startDate) : undefined,
					endDate ? lte(transactions.date, endDate) : undefined,
				),
			)
			.orderBy(desc(transactions.date), desc(transactions.createdAt))
			.limit(filters.limit)
			.offset((filters.page - 1) * filters.limit);

		const countQuery = db
			.select({ count: count() })
			.from(transactions)
			.where(
				and(
					eq(transactions.userId, userId),
					filters.type ? eq(transactions.type, filters.type) : undefined,
					filters.categoryId
						? eq(transactions.categoryId, filters.categoryId)
						: undefined,
					filters.paymentMethodId
						? eq(transactions.paymentMethodId, filters.paymentMethodId)
						: undefined,
					filters.month
						? sql`to_char(${transactions.date}, 'YYYY-MM') = ${filters.month}`
						: undefined,
					startDate ? gte(transactions.date, startDate) : undefined,
					endDate ? lte(transactions.date, endDate) : undefined,
				),
			);

		const [data, [{ count: totalSize }]] = await Promise.all([
			query,
			countQuery,
		]);

		return {
			data,
			total: Number(totalSize),
		};
	}

	async findById(id: string, userId: string) {
		const [transaction] = await db
			.select({
				id: transactions.id,
				description: transactions.description,
				subDescription: transactions.subDescription,
				amount: transactions.amount,
				type: transactions.type,
				date: transactions.date,
				categoryId: transactions.categoryId,
				category: {
					id: categories.id,
					name: categories.name,
					color: categories.color,
					icon: categories.icon,
				},
				paymentMethodId: transactions.paymentMethodId,
				paymentMethod: {
					id: paymentMethods.id,
					name: paymentMethods.name,
				},
				createdAt: transactions.createdAt,
			})
			.from(transactions)
			.leftJoin(categories, eq(transactions.categoryId, categories.id))
			.leftJoin(
				paymentMethods,
				eq(transactions.paymentMethodId, paymentMethods.id),
			)
			.where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
			.limit(1);

		return transaction;
	}

	async createTransaction(userId: string, data: CreateTransactionInput) {
		const [transaction] = await db
			.insert(transactions)
			.values({
				userId,
				description: data.description,
				subDescription: data.subDescription,
				amount: data.amount.toString(),
				type: data.type,
				date: new Date(data.date),
				categoryId: data.categoryId,
				subcategoryId: data.subcategoryId,
				paymentMethodId: data.paymentMethodId,
			})
			.returning();
		return transaction;
	}

	async updateTransaction(
		id: string,
		userId: string,
		data: UpdateTransactionInput,
	) {
		const updateData: {
			description?: string;
			subDescription?: string;
			amount?: string;
			type?: "income" | "expense";
			date?: Date;
			categoryId?: string;
			subcategoryId?: string;
			paymentMethodId?: string;
		} = {};

		if (data.description !== undefined) updateData.description = data.description;
		if (data.subDescription !== undefined) updateData.subDescription = data.subDescription;
		if (data.amount !== undefined) updateData.amount = data.amount.toString();
		if (data.type !== undefined) updateData.type = data.type;
		if (data.date !== undefined) updateData.date = new Date(data.date);
		if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
		if (data.subcategoryId !== undefined) updateData.subcategoryId = data.subcategoryId;
		if (data.paymentMethodId !== undefined) updateData.paymentMethodId = data.paymentMethodId;

		const [updated] = await db
			.update(transactions)
			.set(updateData)
			.where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
			.returning();
		return updated;
	}

	async deleteTransaction(id: string, userId: string) {
		const [deleted] = await db
			.delete(transactions)
			.where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
			.returning();
		return deleted;
	}
}

export const transactionModel = new TransactionModel();
