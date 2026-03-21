import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/config/app";
import { AuthModel } from "../src/modules/auth/auth.model";
import { CategoryModel } from "../src/modules/categories/categories.model";
import { GoalsModel } from "../src/modules/goals/goals.model";
import { PaymentMethodModel } from "../src/modules/payment-methods/payment-methods.model";
import { TransactionModel } from "../src/modules/transactions/transactions.model";

describe("Goals Module", () => {
	const goalsModel = new GoalsModel();
	const categoryModel = new CategoryModel();
	const authModel = new AuthModel();
	const paymentMethodModel = new PaymentMethodModel();
	const transactionModel = new TransactionModel();

	let app: Awaited<ReturnType<typeof buildApp>>;
	let token: string;
	let userId: string;
	let categoryId: string;

	beforeAll(async () => {
		app = await buildApp();

		const email = `goals-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Goals Tester",
			email,
			password: "password123",
		});
		userId = user.id;
		token = (await app).jwt.sign({ sub: user.id, email: user.email });

		const goal = await goalsModel.create(userId, {
			name: "Teste categoria automática",
			targetAmount: 123123,
			color: "#111111",
		});

		const contribuite = await goalsModel.contribute(userId, goal.id, 100);

		categoryId = contribuite?.goal.categoryId || "";

		await categoryModel.updateCategory(categoryId, userId, {
			name: "Meta Categoria",
			icon: "🎯",
			color: "#111111",
		});
	});

	afterAll(async () => {
		await (app as unknown as { close: () => Promise<void> }).close();
	});

	describe("GoalsModel - create", () => {
		it("deve criar uma meta", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Viagem de Férias",
				description: "Para a viagem de dezembro",
				targetAmount: 5000,
				deadline: String(new Date("2024-12-01")),
				color: "#3B82F6",
				icon: "✈️",
			});

			expect(goal).toBeDefined();
			expect(goal.name).toBe("Viagem de Férias");
			expect(goal.targetAmount).toBe("5000.00");
			expect(goal.currentAmount).toBe("0.00");
			expect(goal.isActive).toBe(true);
		});

		it("deve criar categoria Meta automaticamente se não existir", async () => {
			const newUser = await authModel.createUser({
				name: "Goals Auto Category Test",
				email: `goals-auto-${Date.now()}@example.com`,
				password: "password123",
			});

			const goal = await goalsModel.create(newUser.id, {
				name: "Reserva de Emergência",
				targetAmount: 10000,
				color: "#F59E0B",
			});

			expect(goal).toBeDefined();
			expect(goal.categoryId).toBeDefined();
		});
	});

	describe("GoalsModel - update", () => {
		it("deve editar meta", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Editar",
				targetAmount: 1000,
				color: "#EF4444",
			});

			const updated = await goalsModel.update(goal.id, {
				name: "Meta Editada",
				targetAmount: 2000,
			});

			expect(updated).toBeDefined();
			expect(updated?.name).toBe("Meta Editada");
			expect(updated?.targetAmount).toBe("2000.00");
		});

		it("deve editar descrição e deadline", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Atualizar",
				targetAmount: 3000,
				color: "#8B5CF6",
			});

			const newDeadline = new Date("2027-06-30");
			const updated = await goalsModel.update(goal.id, {
				name: goal.name,
				targetAmount: Number(goal.targetAmount),
				description: "Nova descrição",
				deadline: String(newDeadline),
			});

			expect(updated?.description).toBe("Nova descrição");
		});

		it("deve retornar undefined para meta inexistente", async () => {
			const result = await goalsModel.update(
				"9f3c7a2e-6d1b-4f8a-9c52-3e7d1b8a6f0c",
				{
					name: "Test",
					targetAmount: 100,
				},
			);
			expect(result).toBeUndefined();
		});
	});

	describe("GoalsModel - contribute", () => {
		it("deve depositar valor na meta", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Depositar",
				targetAmount: 5000,
				color: "#22C55E",
			});

			const result = await goalsModel.contribute(userId, goal.id, 500);

			expect(result).toBeDefined();
			expect(result?.goal.id).toBe(goal.id);
			expect(result?.contribution.type).toBe("deposit");
			expect(result?.contribution.amount).toBe("500.00");

			const updatedGoal = await goalsModel.findById(goal.id);
			expect(Number(updatedGoal?.currentAmount)).toBe(500);
		});

		it("deve criar transação expense ao depositar", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Transação",
				targetAmount: 3000,
				color: "#06B6D4",
			});

			await goalsModel.contribute(userId, goal.id, 200);

			const transactions = await transactionModel.findAll(userId, {
				limit: 10,
				page: 1,
			});
			const goalTransaction = transactions.data.find((t) =>
				t.description.includes(goal.name),
			);

			expect(goalTransaction).toBeDefined();
			expect(goalTransaction?.type).toBe("expense");
			expect(goalTransaction?.amount).toBe("200.00");
		});

		it("deve criar paymentMethod Interno automaticamente se não existir", async () => {
			const newUser = await authModel.createUser({
				name: "Goals Payment Method Test",
				email: `goals-pm-${Date.now()}@example.com`,
				password: "password123",
			});

			const goal = await goalsModel.create(newUser.id, {
				name: "Meta Payment Method",
				targetAmount: 1000,
				color: "#F97316",
			});

			await goalsModel.contribute(newUser.id, goal.id, 100);

			const paymentMethod = await paymentMethodModel.findByName(
				"Interno",
				newUser.id,
			);
			expect(paymentMethod).toBeDefined();
			expect(paymentMethod?.name).toBe("Interno");
		});

		it("deve registrar em goal_contributions", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Contributions",
				targetAmount: 4000,
				color: "#A855F7",
			});

			const result = await goalsModel.contribute(userId, goal.id, 300);

			expect(result?.contribution).toBeDefined();
			expect(result?.contribution.transactionId).toBeDefined();
		});

		it("deve completar meta quando atinge targetAmount", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Completar",
				targetAmount: 1000,
				color: "#84CC16",
			});

			await goalsModel.contribute(userId, goal.id, 500);
			await goalsModel.contribute(userId, goal.id, 500);

			const updatedGoal = await goalsModel.findById(goal.id);
			expect(Number(updatedGoal?.currentAmount)).toBe(1000);
		});
	});

	describe("GoalsModel - withdraw", () => {
		it("deve sacar valor válido da meta", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Sacar",
				targetAmount: 5000,
				color: "#14B8A6",
			});

			await goalsModel.contribute(userId, goal.id, 1000);
			const result = await goalsModel.withdraw(userId, goal.id, 300);

			expect(result).toBeDefined();
			expect(result?.withdrawal.goalId).toBe(goal.id);
			expect(result?.withdrawal.type).toBe("withdrawal");
			expect(result?.withdrawal.amount).toBe("300.00");

			const updatedGoal = await goalsModel.findById(goal.id);
			expect(Number(updatedGoal?.currentAmount)).toBe(700);
		});

		it("deve criar transação income ao sacar", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Saque Income",
				targetAmount: 3000,
				color: "#0EA5E9",
			});

			await goalsModel.contribute(userId, goal.id, 500);
			await goalsModel.withdraw(userId, goal.id, 200);

			const transactions = await transactionModel.findAll(userId, {
				limit: 10,
				page: 1,
			});
			const withdrawalTransaction = transactions.data.find((t) =>
				t.description.includes("Saque"),
			);

			expect(withdrawalTransaction).toBeDefined();
			expect(withdrawalTransaction?.type).toBe("income");
		});

		it("deve retornar erro quando saque é maior que saldo", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta Saque Grande",
				targetAmount: 1000,
				color: "#D946EF",
			});

			await goalsModel.contribute(userId, goal.id, 200);

			await expect(goalsModel.withdraw(userId, goal.id, 500)).rejects.toThrow(
				"Valor maior que o saldo disponível",
			);
		});
	});

	describe("GoalsModel - findContributionsByGoalId", () => {
		it("deve listar depósitos", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Histórico",
				targetAmount: 5000,
				color: "#F43F5E",
			});

			await goalsModel.contribute(userId, goal.id, 100);
			await goalsModel.contribute(userId, goal.id, 200);

			const contributions = await goalsModel.findContributionsByGoalId(goal.id);

			expect(contributions).toBeInstanceOf(Array);
			expect(contributions.length).toBeGreaterThanOrEqual(2);
			for (const c of contributions) {
				expect(c.goalId).toBe(goal.id);
			}
		});

		it("deve listar saques", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta Histórico Saques",
				targetAmount: 5000,
				color: "#64748B",
			});

			await goalsModel.contribute(userId, goal.id, 1000);
			await goalsModel.withdraw(userId, goal.id, 300);

			const contributions = await goalsModel.findContributionsByGoalId(goal.id);
			const withdrawals = contributions.filter((c) => c.type === "withdrawal");

			expect(withdrawals.length).toBeGreaterThanOrEqual(1);
		});

		it("deve ordenar por data", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta Ordenação",
				targetAmount: 3000,
				color: "#06B6D4",
			});

			await goalsModel.contribute(userId, goal.id, 100);
			await goalsModel.contribute(userId, goal.id, 200);

			const contributions = await goalsModel.findContributionsByGoalId(goal.id);

			expect(contributions[0].amount).toBe("100.00");
			expect(contributions[1].amount).toBe("200.00");
		});
	});

	describe("GoalsModel - delete", () => {
		it("deve deletar meta (hard delete)", async () => {
			const goal = await goalsModel.create(userId, {
				name: "Meta para Deletar",
				targetAmount: 1000,
				color: "#78716C",
			});

			const deleted = await goalsModel.delete(goal.id);
			expect(deleted).toBeDefined();
			expect(deleted.id).toBe(goal.id);

			const foundGoal = await goalsModel.findById(goal.id);
			expect(foundGoal).toBeUndefined();
		});
	});

	describe("GoalsModel - findByUser", () => {
		it("deve listar todas as metas do usuário", async () => {
			const goals = await goalsModel.findAll(userId);

			expect(goals.length).toBeGreaterThan(0);
		});
	});
});

describe("Goals API Routes", () => {
	const goalsModel = new GoalsModel();
	const authModel = new AuthModel();
	const categoryModel = new CategoryModel();

	let app: Awaited<ReturnType<typeof buildApp>>;
	let token: string;
	let userId: string;
	let goalId: string;
	let inject: (options: {
		method: string;
		url: string;
		headers?: Record<string, string>;
		payload?: Record<string, unknown>;
	}) => Promise<{ statusCode: number; body: string }>;

	beforeAll(async () => {
		app = await buildApp();

		inject = (app as unknown as { inject: typeof inject }).inject.bind(app);

		const email = `goals-api-test-${Date.now()}@example.com`;
		const user = await authModel.createUser({
			name: "Goals API Tester",
			email,
			password: "password123",
		});
		userId = user.id;
		token = (await app).jwt.sign({ sub: user.id, email: user.email });

		const goal = await goalsModel.create(userId, {
			name: "API Test Goal",
			targetAmount: 5000,
			color: "#222222",
		});
		goalId = goal.id;
	});

	afterAll(async () => {
		await (app as unknown as { close: () => Promise<void> }).close();
	});

	it("GET /goals - deve listar metas do usuário", async () => {
		const response = await inject({
			method: "GET",
			url: "/goals",
			headers: { authorization: `Bearer ${token}` },
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body.goals).toBeInstanceOf(Array);
	});

	it("GET /goals/:id - deve buscar meta por ID", async () => {
		const response = await inject({
			method: "GET",
			url: `/goals/${goalId}`,
			headers: { authorization: `Bearer ${token}` },
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body.goal.id).toBe(goalId);
	});

	it("POST /goals - deve criar meta via API", async () => {
		const response = await inject({
			method: "POST",
			url: "/goals",
			headers: { authorization: `Bearer ${token}` },
			payload: {
				name: "Nova Meta API",
				targetAmount: 3000,
				color: "#444444",
			},
		});

		expect(response.statusCode).toBe(201);
		const body = JSON.parse(response.body);
		expect(body.goal).toBeDefined();
	});

	it("PUT /goals/:id - deve atualizar meta", async () => {
		const goal = await goalsModel.create(userId, {
			name: "Meta para Atualizar API",
			targetAmount: 1000,
			color: "#555555",
		});

		const response = await inject({
			method: "PUT",
			url: `/goals/${goal.id}`,
			headers: { authorization: `Bearer ${token}` },
			payload: { name: "Meta Atualizada API", targetAmount: 1000 },
		});

		expect(response.statusCode).toBe(200);
	});

	it("POST /goals/:id/contribute - deve contribuir com meta", async () => {
		const response = await inject({
			method: "POST",
			url: `/goals/${goalId}/contribute`,
			headers: { authorization: `Bearer ${token}` },
			payload: { amount: 500 },
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body.goal).toBeDefined();
		expect(body.contribution).toBeDefined();
		expect(body.contribution.amount).toBe("500.00");
		expect(Number(body.goal.currentAmount)).toBeGreaterThan(0);
	});

	it("POST /goals/:id/withdraw - deve sacar de meta", async () => {
		await inject({
			method: "POST",
			url: `/goals/${goalId}/contribute`,
			headers: { authorization: `Bearer ${token}` },
			payload: { amount: 500 },
		});

		const response = await inject({
			method: "POST",
			url: `/goals/${goalId}/withdraw`,
			headers: { authorization: `Bearer ${token}` },
			payload: { amount: 100 },
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body.goal).toBeDefined();
	});

	it("GET /goals/:id/contributions - deve buscar contribuições", async () => {
		const response = await inject({
			method: "GET",
			url: `/goals/${goalId}/contributions`,
			headers: { authorization: `Bearer ${token}` },
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body.contributions).toBeInstanceOf(Array);
	});

	it("DELETE /goals/:id - deve deletar meta", async () => {
		const goal = await goalsModel.create(userId, {
			name: "Meta para Deletar API",
			targetAmount: 500,
			color: "#666666",
		});

		const response = await inject({
			method: "DELETE",
			url: `/goals/${goal.id}`,
			headers: { authorization: `Bearer ${token}` },
		});

		expect(response.statusCode).toBe(204);
	});

	it("deve retornar 401 sem token", async () => {
		const response = await inject({
			method: "GET",
			url: "/goals",
		});

		expect(response.statusCode).toBe(401);
	});
});
