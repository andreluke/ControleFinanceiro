import { beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/config/app";
import { AuthModel } from "../src/modules/auth/auth.model";
import { CategoryModel } from "../src/modules/categories/categories.model";

describe("Categories Module", () => {
	const categoryModel = new CategoryModel();
	const authModel = new AuthModel();
	let app: any;
	let token: string;
	let userId: string;

	beforeAll(async () => {
		app = await buildApp();

		// Create a test user and get token
		const email = `cat-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Category Tester",
			email,
			password: "password123",
		});
		userId = user.id;

		token = await app.jwt.sign({ sub: user.id, email: user.email });
	});

	describe("CategoryModel", () => {
		it("should create a category", async () => {
			const category = await categoryModel.createCategory(userId, {
				name: "Food",
				color: "#FF0000",
				icon: "utensils",
			});

			expect(category).toBeDefined();
			expect(category.name).toBe("Food");
			expect(category.userId).toBe(userId);
		});

		it("should list categories for a user", async () => {
			await categoryModel.createCategory(userId, { name: "Travel" });
			const list = await categoryModel.findAll(userId);
			expect(list.length).toBeGreaterThanOrEqual(1);
			expect(list.some((c) => c.name === "Travel")).toBe(true);
		});
	});

	describe("Category Routes", () => {
		it("should list categories via API", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/categories",
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.payload);
			expect(Array.isArray(body)).toBe(true);
		});

		it("should create category via API", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/categories",
				headers: {
					authorization: `Bearer ${token}`,
				},
				payload: {
					name: "Health",
					color: "#00FF00",
				},
			});

			expect(response.statusCode).toBe(201);
			const body = JSON.parse(response.payload);
			expect(body.name).toBe("Health");
		});
	});
});
