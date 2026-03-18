import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { paymentMethods } from "../../drizzle/schema";
import type {
	CreatePaymentMethodInput,
	UpdatePaymentMethodInput,
} from "./payment-methods.schema";

export class PaymentMethodModel {
	async findAll(userId: string) {
		return db
			.select({
				id: paymentMethods.id,
				name: paymentMethods.name,
			})
			.from(paymentMethods)
			.where(
				and(
					eq(paymentMethods.userId, userId),
					isNull(paymentMethods.deletedAt),
				),
			)
			.orderBy(asc(paymentMethods.name));
	}

	async findById(id: string, userId: string) {
		const [method] = await db
			.select()
			.from(paymentMethods)
			.where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
			.limit(1);
		return method;
	}

	async createMethod(userId: string, data: CreatePaymentMethodInput) {
		const [method] = await db
			.insert(paymentMethods)
			.values({
				userId,
				name: data.name,
			})
			.returning();
		return method;
	}

	async updateMethod(
		id: string,
		userId: string,
		data: UpdatePaymentMethodInput,
	) {
		const [updated] = await db
			.update(paymentMethods)
			.set(data)
			.where(
				and(
					eq(paymentMethods.id, id),
					eq(paymentMethods.userId, userId),
					isNull(paymentMethods.deletedAt),
				),
			)
			.returning();
		return updated;
	}

	async softDelete(id: string, userId: string) {
		const [deleted] = await db
			.update(paymentMethods)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(paymentMethods.id, id),
					eq(paymentMethods.userId, userId),
					isNull(paymentMethods.deletedAt),
				),
			)
			.returning();
		return deleted;
	}

	async restoreMethod(id: string, userId: string) {
		const [restored] = await db
			.update(paymentMethods)
			.set({ deletedAt: null })
			.where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
			.returning();
		return restored;
	}

	async findByName(name: string, userId: string) {
		const [method] = await db
			.select()
			.from(paymentMethods)
			.where(
				and(
					eq(paymentMethods.userId, userId),
					eq(paymentMethods.name, name),
					isNull(paymentMethods.deletedAt),
				),
			)
			.limit(1);
		return method;
	}
}
