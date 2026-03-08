import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { categories } from "../../drizzle/schema";
import type {
	CreateCategoryInput,
	UpdateCategoryInput,
} from "./categories.schema";

export class CategoryModel {
	async findAll(userId: string) {
		return db
			.select({
				id: categories.id,
				name: categories.name,
				color: categories.color,
				icon: categories.icon,
			})
			.from(categories)
			.where(and(eq(categories.userId, userId), isNull(categories.deletedAt)))
			.orderBy(asc(categories.name));
	}

	async findById(id: string, userId: string) {
		const [category] = await db
			.select()
			.from(categories)
			.where(and(eq(categories.id, id), eq(categories.userId, userId)))
			.limit(1);
		return category;
	}

	async createCategory(userId: string, data: CreateCategoryInput) {
		const [category] = await db
			.insert(categories)
			.values({
				userId,
				name: data.name,
				color: data.color || "#3B82F6",
				icon: data.icon,
			})
			.returning();
		return category;
	}

	async updateCategory(id: string, userId: string, data: UpdateCategoryInput) {
		const [updated] = await db
			.update(categories)
			.set(data)
			.where(
				and(
					eq(categories.id, id),
					eq(categories.userId, userId),
					isNull(categories.deletedAt),
				),
			)
			.returning();
		return updated;
	}

	async softDelete(id: string, userId: string) {
		const [deleted] = await db
			.update(categories)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(categories.id, id),
					eq(categories.userId, userId),
					isNull(categories.deletedAt),
				),
			)
			.returning();
		return deleted;
	}

	async restoreCategory(id: string, userId: string) {
		const [restored] = await db
			.update(categories)
			.set({ deletedAt: null })
			.where(and(eq(categories.id, id), eq(categories.userId, userId)))
			.returning();
		return restored;
	}
}
