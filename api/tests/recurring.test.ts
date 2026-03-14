import { beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/config/app";
import { AuthModel } from "../src/modules/auth/auth.model";
import { CategoryModel } from "../src/modules/categories/categories.model";
import { PaymentMethodModel } from "../src/modules/payment-methods/payment-methods.model";
import { RecurringTransactionModel } from "../src/modules/recurring/recurring.model";

describe("Recurring Transactions Module", () => {
	const recurringModel = new RecurringTransactionModel();
	const categoryModel = new CategoryModel();
	const methodModel = new PaymentMethodModel();
	const authModel = new AuthModel();

	let app: ReturnType<typeof buildApp>;
	let token: string;
	let userId: string;
	let categoryId: string;
	let paymentMethodId: string;

	beforeAll(async () => {
		app = buildApp();

		const email = `recurring-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Recurring Tester",
			email,
			password: "password123",
		});
		userId = user.id;
		token = (await app).jwt.sign({ sub: user.id, email: user.email });

		const category = await categoryModel.createCategory(userId, {
			name: "Subscriptions",
		});
		categoryId = category.id;

		const method = await methodModel.createMethod(userId, {
			name: "Credit Card",
		});
		paymentMethodId = method.id;
	});

	describe("RecurringTransactionModel", () => {
		it("should create a recurring transaction", async () => {
			const recurring = await recurringModel.createRecurringTransaction(
				userId,
				{
					description: "Netflix Subscription",
					amount: 55.9,
					type: "expense",
					frequency: "monthly",
					dayOfMonth: 15,
					startDate: new Date().toISOString(),
					categoryId,
					paymentMethodId,
				},
			);

			expect(recurring).toBeDefined();
			expect(recurring.description).toBe("Netflix Subscription");
			expect(recurring.amount).toBe("55.90");
			expect(recurring.frequency).toBe("monthly");
			expect(recurring.isActive).toBe(true);
		});

		it("should list all recurring transactions", async () => {
			await recurringModel.createRecurringTransaction(userId, {
				description: "Spotify",
				amount: 21.9,
				type: "expense",
				frequency: "monthly",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			const result = await recurringModel.findAll(userId);
			expect(result.length).toBeGreaterThanOrEqual(1);
		});

		it("should find recurring transaction by id", async () => {
			const created = await recurringModel.createRecurringTransaction(userId, {
				description: "Gym Membership",
				amount: 100,
				type: "expense",
				frequency: "monthly",
				dayOfMonth: 5,
				startDate: new Date().toISOString(),
			});

			const found = await recurringModel.findById(created.id, userId);
			expect(found).toBeDefined();
			expect(found?.description).toBe("Gym Membership");
		});

		it("should update a recurring transaction", async () => {
			const created = await recurringModel.createRecurringTransaction(userId, {
				description: "Internet Bill",
				amount: 100,
				type: "expense",
				frequency: "monthly",
				dayOfMonth: 10,
				startDate: new Date().toISOString(),
			});

			const updated = await recurringModel.updateRecurringTransaction(
				created.id,
				userId,
				{
					amount: 120,
					description: "Internet Bill Updated",
				},
			);

			expect(updated).toBeDefined();
			expect(updated?.description).toBe("Internet Bill Updated");
			expect(updated?.amount).toBe("120.00");
		});

		it("should toggle active status", async () => {
			const created = await recurringModel.createRecurringTransaction(userId, {
				description: "Temp Subscription",
				amount: 10,
				type: "expense",
				frequency: "daily",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			expect(created.isActive).toBe(true);

			const toggled = await recurringModel.toggleActive(created.id, userId);
			expect(toggled).toBeDefined();
			expect(toggled?.isActive).toBe(false);

			const toggledBack = await recurringModel.toggleActive(created.id, userId);
			expect(toggledBack?.isActive).toBe(true);
		});

		it("should soft delete (deactivate) a recurring transaction", async () => {
			const created = await recurringModel.createRecurringTransaction(userId, {
				description: "To Delete",
				amount: 50,
				type: "expense",
				frequency: "weekly",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			const deleted = await recurringModel.softDelete(created.id, userId);
			expect(deleted).toBeDefined();
			expect(deleted?.isActive).toBe(false);
		});

		it("should filter by isActive", async () => {
			const active = await recurringModel.createRecurringTransaction(userId, {
				description: "Active Recurring",
				amount: 30,
				type: "income",
				frequency: "yearly",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			await recurringModel.toggleActive(active.id, userId);

			const activeOnly = await recurringModel.findAll(userId, {
				isActive: true,
			});
			const inactiveOnly = await recurringModel.findAll(userId, {
				isActive: false,
			});

			expect(activeOnly.every((r) => r.isActive)).toBe(true);
			expect(inactiveOnly.every((r) => !r.isActive)).toBe(true);
		});

		it("should filter by type", async () => {
			await recurringModel.createRecurringTransaction(userId, {
				description: "Expense Recurring",
				amount: 20,
				type: "expense",
				frequency: "monthly",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			await recurringModel.createRecurringTransaction(userId, {
				description: "Income Recurring",
				amount: 5000,
				type: "income",
				frequency: "monthly",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			const expenses = await recurringModel.findAll(userId, {
				type: "expense",
			});
			const incomes = await recurringModel.findAll(userId, { type: "income" });

			expect(expenses.every((r) => r.type === "expense")).toBe(true);
			expect(incomes.every((r) => r.type === "income")).toBe(true);
		});
	});

	describe("Recurring Transactions Routes", () => {
		it("should list recurring transactions via API", async () => {
			const response = await (await app).inject({
				method: "GET",
				url: "/recurring",
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.payload);
			expect(Array.isArray(body)).toBe(true);
		});

		it("should create recurring transaction via API", async () => {
			const response = await (await app).inject({
				method: "POST",
				url: "/recurring",
				headers: {
					authorization: `Bearer ${token}`,
				},
				payload: {
					description: "Amazon Prime",
					amount: 14.9,
					type: "expense",
					frequency: "monthly",
					dayOfMonth: 20,
					startDate: new Date().toISOString(),
					categoryId,
					paymentMethodId,
				},
			});

			expect(response.statusCode).toBe(201);
			const body = JSON.parse(response.payload);
			expect(body.description).toBe("Amazon Prime");
			expect(body.frequency).toBe("monthly");
		});

		it("should update recurring transaction via API", async () => {
			const created = await recurringModel.createRecurringTransaction(userId, {
				description: "To Update API",
				amount: 50,
				type: "expense",
				frequency: "weekly",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			const response = await (await app).inject({
				method: "PUT",
				url: `/recurring/${created.id}`,
				headers: {
					authorization: `Bearer ${token}`,
				},
				payload: {
					description: "Updated via API",
					amount: 75,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.payload);
			expect(body.description).toBe("Updated via API");
		});

		it("should toggle recurring transaction via API", async () => {
			const created = await recurringModel.createRecurringTransaction(userId, {
				description: "To Toggle API",
				amount: 10,
				type: "expense",
				frequency: "daily",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			const response = await (await app).inject({
				method: "PATCH",
				url: `/recurring/${created.id}/toggle`,
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.payload);
			expect(body.isActive).toBe(false);
		});

		it("should delete recurring transaction via API", async () => {
			const created = await recurringModel.createRecurringTransaction(userId, {
				description: "To Delete API",
				amount: 100,
				type: "expense",
				frequency: "yearly",
				dayOfMonth: 1,
				startDate: new Date().toISOString(),
			});

			const response = await (await app).inject({
				method: "DELETE",
				url: `/recurring/${created.id}`,
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			expect(response.statusCode).toBe(200);
		});

		it("should return 401 without auth", async () => {
			const response = await (await app).inject({
				method: "GET",
				url: "/recurring",
			});

			expect(response.statusCode).toBe(401);
		});

		it("should return 404 for non-existent recurring", async () => {
			const fakeId = "00000000-0000-0000-0000-000000000000";

			const response = await (await app).inject({
				method: "GET",
				url: `/recurring/${fakeId}`,
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			expect(response.statusCode).toBe(404);
		});

		it("should validate frequency enum", async () => {
			const response = await (await app).inject({
				method: "POST",
				url: "/recurring",
				headers: {
					authorization: `Bearer ${token}`,
				},
				payload: {
					description: "Invalid Frequency",
					amount: 10,
					type: "expense",
					frequency: "invalid_frequency",
					dayOfMonth: 1,
					startDate: new Date().toISOString(),
				},
			});

			expect(response.statusCode).toBe(500);
		});

		it("should require dayOfMonth", async () => {
			const response = await (await app).inject({
				method: "POST",
				url: "/recurring",
				headers: {
					authorization: `Bearer ${token}`,
				},
				payload: {
					description: "Missing day",
					amount: 10,
					type: "expense",
					frequency: "monthly",
					startDate: new Date().toISOString(),
				},
			});

			expect(response.statusCode).toBe(500);
		});
	});
});
