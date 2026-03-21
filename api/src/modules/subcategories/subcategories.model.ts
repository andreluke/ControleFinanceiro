import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { categories, subcategories } from "../../drizzle/schema";
import type {
	CreateSubcategoryInput,
	Subcategory,
	UpdateSubcategoryInput,
} from "./subcategories.schema";

export class SubcategoryModel {
	async findAll(userId: string): Promise<Subcategory[]> {
		return db
			.select({
				id: subcategories.id,
				name: subcategories.name,
				color: subcategories.color,
				icon: subcategories.icon,
				categoryId: subcategories.categoryId,
				categoryName: categories.name,
			})
			.from(subcategories)
			.leftJoin(categories, eq(subcategories.categoryId, categories.id))
			.where(
				and(eq(subcategories.userId, userId), isNull(subcategories.deletedAt)),
			)
			.orderBy(asc(subcategories.name));
	}

	async findByCategory(
		userId: string,
		categoryId: string,
	): Promise<Subcategory[]> {
		return db
			.select({
				id: subcategories.id,
				name: subcategories.name,
				color: subcategories.color,
				icon: subcategories.icon,
				categoryId: subcategories.categoryId,
			})
			.from(subcategories)
			.where(
				and(
					eq(subcategories.userId, userId),
					eq(subcategories.categoryId, categoryId),
					isNull(subcategories.deletedAt),
				),
			)
			.orderBy(asc(subcategories.name));
	}

	async findById(id: string, userId: string) {
		const [subcategory] = await db
			.select()
			.from(subcategories)
			.where(and(eq(subcategories.id, id), eq(subcategories.userId, userId)))
			.limit(1);
		return subcategory;
	}

	async create(userId: string, data: CreateSubcategoryInput) {
		const subcategoryExists = await db
			.select()
			.from(subcategories)
			.where(
				and(
					eq(subcategories.userId, userId),
					eq(subcategories.categoryId, data.categoryId),
					eq(subcategories.name, data.name),
					isNull(subcategories.deletedAt),
				),
			)
			.limit(1);

		if (subcategoryExists.length > 0) {
			throw new Error("Subcategoria com esse nome já existe nessa categoria");
		}

		const [subcategory] = await db
			.insert(subcategories)
			.values({
				userId,
				categoryId: data.categoryId,
				name: data.name,
				color: data.color || "#3B82F6",
				icon: data.icon,
			})
			.returning();
		return subcategory;
	}

	async update(id: string, userId: string, data: UpdateSubcategoryInput) {
		const [updated] = await db
			.update(subcategories)
			.set(data)
			.where(
				and(
					eq(subcategories.id, id),
					eq(subcategories.userId, userId),
					isNull(subcategories.deletedAt),
				),
			)
			.returning();
		return updated;
	}

	async softDelete(id: string, userId: string) {
		const [deleted] = await db
			.update(subcategories)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(subcategories.id, id),
					eq(subcategories.userId, userId),
					isNull(subcategories.deletedAt),
				),
			)
			.returning();
		return deleted;
	}

	async restore(id: string, userId: string) {
		const [restored] = await db
			.update(subcategories)
			.set({ deletedAt: null })
			.where(and(eq(subcategories.id, id), eq(subcategories.userId, userId)))
			.returning();
		return restored;
	}
}

export default new SubcategoryModel();
