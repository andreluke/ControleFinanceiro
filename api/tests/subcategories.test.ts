import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/config/app";
import { AuthModel } from "../src/modules/auth/auth.model";
import { CategoryModel } from "../src/modules/categories/categories.model";
import { SubcategoryModel } from "../src/modules/subcategories/subcategories.model";

describe("Subcategories Module", () => {
	const categoryModel = new CategoryModel();
	const authModel = new AuthModel();
	const subCategoryModel = new SubcategoryModel();

	let app: Awaited<ReturnType<typeof buildApp>>;
	let token: string;
	let userId: string;
	let categoryId: string;

	beforeAll(async () => {
		app = await buildApp();

		const email = `subcategories-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Subcategories Tester",
			email,
			password: "password123",
		});
		userId = user.id;
		token = (await app).jwt.sign({ sub: user.id, email: user.email });

		const category = await categoryModel.createCategory(userId, {
			name: "Test Category",
			color: "#3B82F6",
		});
		categoryId = category.id;
	});

	afterAll(async () => {
		await (app as unknown as { close: () => Promise<void> }).close();
	});

	describe("SubcategoryModel - create", () => {
		it("deve criar uma subcategoria", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Supermercado",
				color: "#10B981",
				categoryId: categoryId,
			});

			expect(subcategory).toBeDefined();
			expect(subcategory.name).toBe("Supermercado");
			expect(subcategory.categoryId).toBe(categoryId);
			expect(subcategory.color).toBe("#10B981");
		});

		it("deve criar subcategoria com ícone", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Restaurante",
				color: "#F59E0B",
				icon: "restaurant",
				categoryId: categoryId,
			});

			expect(subcategory).toBeDefined();
			expect(subcategory.icon).toBe("restaurant");
		});

		it("deve lançar erro para nome duplicado na mesma categoria", async () => {
			await expect(
				subCategoryModel.create(userId, {
					name: "Supermercado",
					color: "#000000",
					categoryId: categoryId,
				}),
			).rejects.toThrow();
		});
	});

	describe("SubcategoryModel - update", () => {
		it("deve editar subcategoria", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Antigo Nome",
				color: "#EF4444",
				categoryId: categoryId,
			});

			const updated = await subCategoryModel.update(subcategory.id, userId, {
				name: "Nome Atualizado",
				color: "#22C55E",
			});

			expect(updated).toBeDefined();
			expect(updated?.name).toBe("Nome Atualizado");
			expect(updated?.color).toBe("#22C55E");
		});

		it("deve editar apenas cor", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Apenas Cor",
				color: "#000000",
				categoryId: categoryId,
			});

			const updated = await subCategoryModel.update(subcategory.id, userId, {
				color: "#FFFFFF",
			});

			expect(updated?.color).toBe("#FFFFFF");
		});

		it("deve editar apenas nome", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Apenas Nome",
				color: "#000000",
				categoryId: categoryId,
			});

			const updated = await subCategoryModel.update(subcategory.id, userId, {
				name: "Novo Nome",
			});

			expect(updated?.name).toBe("Novo Nome");
		});
	});

	describe("SubcategoryModel - deleteSubcategory", () => {
		it("deve deletar subcategoria (soft delete)", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Para Deletar",
				color: "#78716C",
				categoryId: categoryId,
			});
			const deleted = await subCategoryModel.softDelete(subcategory.id, userId);
			expect(deleted).toBeDefined();

			const subcategories = await subCategoryModel.findByCategory(
				userId,
				categoryId,
			);

			const found = subcategories.find((s) => s.id === subcategory.id);
			expect(found).toBeUndefined();
		});
	});

	describe("SubcategoryModel - findByCategory", () => {
		it("deve listar subcategorias por categoria", async () => {
			await subCategoryModel.create(userId, {
				name: "Sub 1",
				color: "#111111",
				categoryId: categoryId,
			});

			await subCategoryModel.create(userId, {
				name: "Sub 2",
				color: "#222222",
				categoryId: categoryId,
			});

			const subcategories = await subCategoryModel.findByCategory(
				userId,
				categoryId,
			);

			expect(subcategories.length).toBeGreaterThanOrEqual(2);
			for (const sub of subcategories) {
				expect(sub.categoryId).toBe(categoryId);
			}
		});

		it("não deve incluir subcategorias deletadas", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Sub Deletada",
				color: "#333333",
				categoryId: categoryId,
			});

			await subCategoryModel.softDelete(subcategory.id, userId);

			const subcategories = await subCategoryModel.findByCategory(
				userId,
				categoryId,
			);
			const found = subcategories.find((s) => s.id === subcategory.id);
			expect(found).toBeUndefined();
		});
	});

	describe("SubcategoryModel - restoreSubcategory", () => {
		it("deve restaurar subcategoria deletada", async () => {
			const subcategory = await subCategoryModel.create(userId, {
				name: "Para Restaurar",
				color: "#444444",
				categoryId: categoryId,
			});

			await subCategoryModel.softDelete(subcategory.id, userId);

			const restored = await subCategoryModel.restore(subcategory.id, userId);

			expect(restored).toBeDefined();
			expect(restored?.deletedAt).toBeNull();
		});
	});
});

describe("Subcategories API Routes", () => {
	const categoryModel = new CategoryModel();
	const authModel = new AuthModel();
	const subCategoryModel = new SubcategoryModel();
	let app: Awaited<ReturnType<typeof buildApp>>;
	let token: string;
	let userId: string;
	let categoryId: string;
	let inject: (options: {
		method: string;
		url: string;
		headers?: Record<string, string>;
		payload?: Record<string, unknown>;
	}) => Promise<{ statusCode: number; body: string }>;

	beforeAll(async () => {
		app = await buildApp();

		inject = (app as unknown as { inject: typeof inject }).inject.bind(app);

		const email = `subcategories-api-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Subcategories API Tester",
			email,
			password: "password123",
		});
		userId = user.id;
		token = (await app).jwt.sign({ sub: user.id, email: user.email });
		const category = await categoryModel.createCategory(userId, {
			name: "API Test Category",
			color: "#5B21B6",
		});
		categoryId = category.id;
	});

	afterAll(async () => {
		await (app as unknown as { close: () => Promise<void> }).close();
	});

	it("POST /subcategories - deve criar subcategoria via API", async () => {
		const response = await inject({
			method: "POST",
			url: "/subcategories",
			headers: { authorization: `Bearer ${token}` },
			payload: { name: "Nova Subcategoria API", color: "#8B5CF6", categoryId },
		});
		expect(response.statusCode).toBe(201);
		const body = JSON.parse(response.body);
		expect(body.id).toBeDefined();
	});

	it("GET /subcategories - deve listar subcategorias", async () => {
		const response = await inject({
			method: "GET",
			url: "/subcategories",
			headers: { authorization: `Bearer ${token}` },
		});
		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body).toBeInstanceOf(Array);
	});

	it("PUT /subcategories/:id - deve atualizar subcategoria", async () => {
		const subcategory = await subCategoryModel.create(userId, {
			name: "Para Atualizar API",
			color: "#6B7280",
			categoryId,
		});
		const response = await inject({
			method: "PUT",
			url: `/subcategories/${subcategory.id}`,
			headers: { authorization: `Bearer ${token}` },
			payload: { name: "Atualizada API" },
		});
		expect(response.statusCode).toBe(200);
	});

	it("DELETE /subcategories/:id - deve deletar subcategoria", async () => {
		const subcategory = await subCategoryModel.create(userId, {
			name: "Para Deletar API",
			color: "#9CA3AF",
			categoryId,
		});
		const response = await inject({
			method: "DELETE",
			url: `/subcategories/${subcategory.id}`,
			headers: { authorization: `Bearer ${token}` },
		});
		expect(response.statusCode).toBe(200);
	});

	it("deve retornar 401 sem token", async () => {
		const response = await inject({
			method: "GET",
			url: "/subcategories",
		});
		expect(response.statusCode).toBe(401);
	});
});
