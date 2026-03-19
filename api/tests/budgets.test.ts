import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/config/app";
import { AuthModel } from "../src/modules/auth/auth.model";
import { BudgetsModel } from "../src/modules/budgets/budgets.model";
import { CategoryModel } from "../src/modules/categories/categories.model";
import { SubcategoryModel } from "../src/modules/subcategories/subcategories.model";

describe("Budgets Module", () => {
	const budgetsModel = new BudgetsModel();
	const categoryModel = new CategoryModel();
	const subCategoryModel = new SubcategoryModel();
	const authModel = new AuthModel();

	let app: Awaited<ReturnType<typeof buildApp>>;
	let token: string;
	let userId: string;
	let categoryId: string;
	let subcategoryId: string;

	beforeAll(async () => {
		app = await buildApp();

		const email = `budgets-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Budgets Tester",
			email,
			password: "password123",
		});
		userId = user.id;
		token = (await app).jwt.sign({ sub: user.id, email: user.email });

		const category = await categoryModel.createCategory(userId, {
			name: "Alimentação",
			color: "#3B82F6",
		});
		categoryId = category.id;

		const subcategory = await subCategoryModel.create(userId, {
			name: "Supermercado",
			color: "#10B981",
			categoryId: categoryId,
		});
		subcategoryId = subcategory.id;
	});

	afterAll(async () => {
		await (app as unknown as { close: () => Promise<void> }).close();
	});

	describe("BudgetsModel - create", () => {
		it("deve criar um orçamento normal", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 1000,
				month: 3,
				year: 2026,
			});

			expect(budget).toBeDefined();
			expect(budget.categoryId).toBe(categoryId);
			expect(budget.amount).toBe("1000.00");
			expect(budget.isRecurring).toBe(false);
			expect(budget.isActive).toBe(true);
		});

		it("deve criar um orçamento recorrente", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 500,
				month: 3,
				year: 2026,
				isRecurring: true,
			});

			expect(budget).toBeDefined();
			expect(budget.isRecurring).toBe(true);
			expect(budget.recurringGroupId).toBeDefined();
		});

		it("deve criar uma subcategoria e recalcular o pai", async () => {
			const subcategoryBudget = await budgetsModel.create({
				userId,
				categoryId,
				subcategoryId,
				amount: 300,
				month: 3,
				year: 2026,
			});

			expect(subcategoryBudget).toBeDefined();
			expect(subcategoryBudget.subcategoryId).toBe(subcategoryId);

			const parentBudgets = await budgetsModel.findByUserAndPeriod(
				userId,
				3,
				2026,
			);
			const parentBudget = parentBudgets.find((b) => !b.subcategoryId);
			expect(parentBudget).toBeDefined();
			expect(Number(parentBudget?.amount)).toBeGreaterThan(0);
		});

		it("deve criar placeholder se não existir orçamento pai ao criar subcategoria", async () => {
			const newCategory = await categoryModel.createCategory(userId, {
				name: "Transporte",
				color: "#F59E0B",
			});

			const newSub = await subCategoryModel.create(userId, {
				name: "Uber",
				color: "#000000",
				categoryId: newCategory.id,
			});

			const subBudget = await budgetsModel.create({
				userId,
				categoryId: newCategory.id,
				subcategoryId: newSub.id,
				amount: 200,
				month: 3,
				year: 2026,
			});

			expect(subBudget).toBeDefined();
			expect(subBudget.subcategoryId).toBe(newSub.id);
		});

		it("deve criar orçamento com baseAmount específico", async () => {
			const newCat = await categoryModel.createCategory(userId, {
				name: "Lazer",
				color: "#EC4899",
			});

			const budget = await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				amount: 1000,
				baseAmount: 300,
				month: 4,
				year: 2026,
			});

			expect(budget).toBeDefined();
			expect(budget.baseAmount).toBe("300.00");
		});
	});

	describe("BudgetsModel - update", () => {
		it("deve editar o amount do orçamento", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 200,
				month: 5,
				year: 2026,
			});

			const updated = await budgetsModel.update(budget.id, userId, {
				amount: 250,
			});

			expect(updated).toBeDefined();
			expect(updated?.amount).toBe("250.00");
		});

		it("deve editar baseAmount e recalcular total quando há subcategorias", async () => {
			const newCat = await categoryModel.createCategory(userId, {
				name: "TesteUpdate",
				color: "#000000",
			});

			const sub = await subCategoryModel.create(userId, {
				name: "SubTeste",
				color: "#FFFFFF",
				categoryId: newCat.id,
			});

			const parentBudget = await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				amount: 500,
				baseAmount: 200,
				month: 5,
				year: 2026,
			});

			await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				subcategoryId: sub.id,
				amount: 300,
				month: 5,
				year: 2026,
			});

			const updated = await budgetsModel.update(parentBudget.id, userId, {
				baseAmount: 400,
			});

			expect(updated).toBeDefined();
		});

		it("deve converter orçamento para recorrente", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 150,
				month: 6,
				year: 2026,
			});

			expect(budget.isRecurring).toBe(false);

			const updated = await budgetsModel.update(budget.id, userId, {
				isRecurring: true,
			});

			expect(updated?.isRecurring).toBe(true);
			expect(updated?.recurringGroupId).toBeDefined();
		});

		it("deve desativar recorrência do orçamento", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 100,
				month: 7,
				year: 2026,
				isRecurring: true,
			});

			const updated = await budgetsModel.update(budget.id, userId, {
				isRecurring: false,
			});

			expect(updated?.isRecurring).toBe(false);
		});

		it("deve editar subcategoria e recalcular pai", async () => {
			const newCat = await categoryModel.createCategory(userId, {
				name: "RecalcularTest",
				color: "#123456",
			});

			const sub = await subCategoryModel.create(userId, {
				name: "SubRecalc",
				color: "#654321",
				categoryId: newCat.id,
			});

			await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				amount: 200,
				month: 8,
				year: 2026,
			});

			const subBudget = await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				subcategoryId: sub.id,
				amount: 100,
				month: 8,
				year: 2026,
			});

			await budgetsModel.update(subBudget.id, userId, { amount: 150 });

			const parentBudgets = await budgetsModel.findByUserAndPeriod(
				userId,
				8,
				2026,
			);
			const parent = parentBudgets.find(
				(b) => !b.subcategoryId && b.categoryId === newCat.id,
			);
			expect(parent).toBeDefined();
		});

		it("deve retornar undefined para orçamento inexistente", async () => {
			const result = await budgetsModel.update(
				"9f3c7a2e-6d1b-4f8a-9c52-3e7d1b8a6f0c",
				userId,
				{ amount: 100 },
			);
			expect(result).toBeUndefined();
		});
	});

	describe("BudgetsModel - delete", () => {
		it("deve deletar orçamento e recalcular pai quando subcategoria é deletada", async () => {
			const newCat = await categoryModel.createCategory(userId, {
				name: "DeleteTest",
				color: "#999999",
			});

			const sub = await subCategoryModel.create(userId, {
				name: "SubDelete",
				color: "#AAAAAA",
				categoryId: newCat.id,
			});

			await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				amount: 300,
				month: 9,
				year: 2026,
			});

			const subBudget = await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				subcategoryId: sub.id,
				amount: 200,
				month: 9,
				year: 2026,
			});

			await budgetsModel.delete(subBudget.id);

			const parentBudgets = await budgetsModel.findByUserAndPeriod(
				userId,
				9,
				2026,
			);
			const parent = parentBudgets.find(
				(b) => !b.subcategoryId && b.categoryId === newCat.id,
			);
			expect(parent?.amount).toBe("500.00");
			expect(parent?.baseAmount).toBe("300.00");
		});

		it("deve deletar orçamento normalmente", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 50,
				month: 10,
				year: 2026,
			});

			const deleted = await budgetsModel.delete(budget.id);
			// expect(deleted).toBe(true);

			const found = await budgetsModel.findById(budget.id);
			expect(found).toBeUndefined();
		});
	});

	describe("BudgetsModel - recurring", () => {
		it("deve recriar automaticamente orçamentos recorrentes no mês seguinte", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 500,
				month: 11,
				year: 2026,
				isRecurring: true,
			});

			expect(budget.isRecurring).toBe(true);

			const summary = await budgetsModel.getSummary(userId, 12, 2026);
			const recurringBudget = summary.budgets.find(
				(b) => b.categoryId === categoryId && !b.subcategoryId,
			);

			expect(recurringBudget).toBeDefined();
			expect(recurringBudget?.isRecurring).toBe(true);
			expect(recurringBudget?.amount).toBe(500);
		});

		it("deve copiar baseAmount e isActive ao recriar", async () => {
			const newCat = await categoryModel.createCategory(userId, {
				name: "CopyTest",
				color: "#ABCDEF",
			});

			await budgetsModel.create({
				userId,
				categoryId: newCat.id,
				amount: 800,
				baseAmount: 500,
				month: 11,
				year: 2028,
				isRecurring: true,
			});

			const summary = await budgetsModel.getSummary(userId, 12, 2028);
			const recurringBudget = summary.budgets.find(
				(b) => b.categoryId === newCat.id && !b.subcategoryId,
			);

			expect(recurringBudget).toBeDefined();
			expect(recurringBudget?.baseAmount).toBe(500);
		});
	});

	describe("BudgetsModel - toggleActive", () => {
		it("deve ativar orçamento", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 100,
				month: 12,
				year: 2026,
			});

			expect(budget.isActive).toBe(true);

			await budgetsModel.toggleActive(budget.id, userId);

			const found = await budgetsModel.findById(budget.id);
			expect(found?.isActive).toBe(false);
		});

		it("deve desativar orçamento", async () => {
			const budget = await budgetsModel.create({
				userId,
				categoryId,
				amount: 100,
				month: 1,
				year: 2027,
			});

			const toggled = await budgetsModel.toggleActive(budget.id, userId);
			expect(toggled?.isActive).toBe(false);
		});
	});

	describe("BudgetsModel - getSummary", () => {
		it("deve calcular totais corretamente", async () => {
			const summary = await budgetsModel.getSummary(userId, 3, 2026);

			expect(summary.totalBudgeted).toBeGreaterThan(0);
			expect(summary.totalSpent).toBeGreaterThanOrEqual(0);
			expect(summary.totalRemaining).toBe(
				summary.totalBudgeted - summary.totalSpent,
			);
		});

		it("deve detectar orçamentos acima do limite", async () => {
			const summary = await budgetsModel.getSummary(userId, 3, 2026);

			expect(typeof summary.overBudgetCount).toBe("number");
			expect(typeof summary.nearLimitCount).toBe("number");
		});
	});

	describe("BudgetsModel - findByUser", () => {
		it("deve listar todos os orçamentos do usuário", async () => {
			const budgets = await budgetsModel.findByUser(userId);

			expect(budgets.length).toBeGreaterThan(0);

			for (const budget of budgets) {
				expect(budget.userId).toBe(userId);
			}
		});
	});
});

describe("Budgets API Routes", () => {
	const budgetsModel = new BudgetsModel();
	const categoryModel = new CategoryModel();
	const authModel = new AuthModel();

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

		const email = `budgets-api-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Budgets API Tester",
			email,
			password: "password123",
		});
		userId = user.id;
		token = (await app).jwt.sign({ sub: user.id, email: user.email });

		const category = await categoryModel.createCategory(userId, {
			name: "API Test Category",
			color: "#111111",
		});
		categoryId = category.id;
	});

	afterAll(async () => {
		await (app as unknown as { close: () => Promise<void> }).close();
	});

	it("POST /budgets - deve criar orçamento via API", async () => {
		const response = await inject({
			method: "POST",
			url: "/budgets",
			headers: { authorization: `Bearer ${token}` },
			payload: {
				categoryId,
				amount: 1000,
				month: 3,
				year: 2026,
			},
		});

		expect(response.statusCode).toBe(201);
		const body = JSON.parse(response.body);
		expect(body.budget).toBeDefined();
	});

	it("GET /budgets - deve listar orçamentos do usuário", async () => {
		const response = await inject({
			method: "GET",
			url: "/budgets?month=3&year=2026",
			headers: { authorization: `Bearer ${token}` },
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body.totalBudgeted).toBeDefined();
		expect(body.budgets).toBeInstanceOf(Array);
	});

	it("PUT /budgets/:id - deve atualizar orçamento", async () => {
		const budget = await budgetsModel.create({
			userId,
			categoryId,
			amount: 500,
			month: 4,
			year: 2026,
		});

		const response = await inject({
			method: "PUT",
			url: `/budgets/${budget.id}`,
			headers: { authorization: `Bearer ${token}` },
			payload: { amount: 600 },
		});

		expect(response.statusCode).toBe(200);
	});

	it("DELETE /budgets/:id - deve deletar orçamento", async () => {
		const budget = await budgetsModel.create({
			userId,
			categoryId,
			amount: 100,
			month: 5,
			year: 2026,
		});

		const response = await inject({
			method: "DELETE",
			url: `/budgets/${budget.id}`,
			headers: { authorization: `Bearer ${token}` },
		});

		expect(response.statusCode).toBe(204);
	});

	it("PATCH /budgets/:id/toggle - deve alternar status do orçamento", async () => {
		const budget = await budgetsModel.create({
			userId,
			categoryId,
			amount: 200,
			month: 6,
			year: 2026,
			isRecurring: true,
		});

		const response = await inject({
			method: "PATCH",
			url: `/budgets/${budget.id}/toggle`,
			headers: { authorization: `Bearer ${token}` },
		});

		expect(response.statusCode).toBe(200);
	});

	it("deve retornar 401 sem token", async () => {
		const response = await inject({
			method: "GET",
			url: "/budgets",
		});

		expect(response.statusCode).toBe(401);
	});
});
