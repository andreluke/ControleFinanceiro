import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/config/app";
import { db } from "../src/drizzle/client";
import { users } from "../src/drizzle/schema";
import { AuthModel } from "../src/modules/auth/auth.model";

describe("Auth Module", () => {
	const authModel = new AuthModel();
	let app: any;

	beforeAll(async () => {
		app = await buildApp();
	});

	describe("AuthModel", () => {
		it("should create a new user", async () => {
			const email = `test-${Date.now()}@example.com`;
			const user = await authModel.createUser({
				name: "Test User",
				email,
				password: "password123",
			});

			expect(user).toBeDefined();
			expect(user.email).toBe(email);
			expect(user.name).toBe("Test User");
			expect((user as any).password).toBeUndefined(); // Should not return password
		});

		it("should find user by email", async () => {
			const email = `find-${Date.now()}@example.com`;
			await authModel.createUser({
				name: "Find Me",
				email,
				password: "password123",
			});

			const user = await authModel.findByEmail(email);
			expect(user).toBeDefined();
			expect(user?.email).toBe(email);
		});
	});

	describe("Auth Routes", () => {
		it("should register a new user via API", async () => {
			const email = `api-reg-${Date.now()}@example.com`;
			const response = await app.inject({
				method: "POST",
				url: "/auth/register",
				payload: {
					name: "API User",
					email,
					password: "password123",
				},
			});

			expect(response.statusCode).toBe(201);
			const body = JSON.parse(response.payload);
			expect(body.user.email).toBe(email);
		});

		it("should login successfully", async () => {
			const email = `login-${Date.now()}@example.com`;
			await authModel.createUser({
				name: "Login User",
				email,
				password: "password123",
			});

			const response = await app.inject({
				method: "POST",
				url: "/auth/login",
				payload: {
					email,
					password: "password123",
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.payload);
			expect(body.token).toBeDefined();
			expect(body.user.email).toBe(email);
		});

		it("should not login with wrong password", async () => {
			const email = `wrong-pass-${Date.now()}@example.com`;
			await authModel.createUser({
				name: "Wrong Pass User",
				email,
				password: "password123",
			});

			const response = await app.inject({
				method: "POST",
				url: "/auth/login",
				payload: {
					email,
					password: "wrongpassword",
				},
			});

			expect(response.statusCode).toBe(401);
		});
	});
});
