import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { goalContributions, goals } from "../../drizzle/schema";
import { CategoryModel } from "../categories/categories.model";
import { PaymentMethodModel } from "../payment-methods/payment-methods.model";
import { TransactionModel } from "../transactions/transactions.model";
import type { CreateGoalInput, UpdateGoalInput } from "./goals.schema";

export class GoalsModel {
	constructor(
		private readonly categoryModel = new CategoryModel(),
		private readonly paymentMethodModel = new PaymentMethodModel(),
		private readonly transactionModel = new TransactionModel(),
	) {}
	async findAll(userId: string) {
		const result = await db
			.select({
				id: goals.id,
				name: goals.name,
				description: goals.description,
				targetAmount: goals.targetAmount,
				currentAmount: goals.currentAmount,
				deadline: goals.deadline,
				icon: goals.icon,
				color: goals.color,
				isActive: goals.isActive,
				createdAt: goals.createdAt,
				updatedAt: goals.updatedAt,
			})
			.from(goals)
			.where(eq(goals.userId, userId))
			.orderBy(goals.createdAt);

		return result;
	}

	async findById(id: string) {
		const [result] = await db
			.select({
				id: goals.id,
				userId: goals.userId,
				name: goals.name,
				description: goals.description,
				targetAmount: goals.targetAmount,
				currentAmount: goals.currentAmount,
				deadline: goals.deadline,
				categoryId: goals.categoryId,
				icon: goals.icon,
				color: goals.color,
				isActive: goals.isActive,
				createdAt: goals.createdAt,
				updatedAt: goals.updatedAt,
			})
			.from(goals)
			.where(eq(goals.id, id))
			.limit(1);

		return result;
	}

	async create(userId: string, data: CreateGoalInput) {
		const [result] = await db
			.insert(goals)
			.values({
				userId,
				name: data.name,
				description: data.description,
				targetAmount: data.targetAmount.toString(),
				currentAmount: "0",
				deadline: data.deadline ? new Date(data.deadline) : undefined,
				icon: data.icon,
				color: data.color || "#3B82F6",
				isActive: data.isActive ?? true,
			})
			.returning();

		return result;
	}

	async update(id: string, data: UpdateGoalInput) {
		const updateData: Record<string, unknown> = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined)
			updateData.description = data.description;
		if (data.targetAmount !== undefined)
			updateData.targetAmount = data.targetAmount.toString();
		if (data.deadline !== undefined)
			updateData.deadline = data.deadline ? new Date(data.deadline) : undefined;
		if (data.icon !== undefined) updateData.icon = data.icon;
		if (data.color !== undefined) updateData.color = data.color;
		if (data.isActive !== undefined) updateData.isActive = data.isActive;

		const [result] = await db
			.update(goals)
			.set(updateData)
			.where(eq(goals.id, id))
			.returning();

		return result;
	}

	async contribute(userId: string, id: string, amount: number) {
		const goal = await this.findById(id);
		if (!goal || goal.userId !== userId) return null;

		let categoryId = goal.categoryId;
		if (!categoryId) {
			let category = await this.categoryModel.findByName("Meta", userId);
			if (!category) {
				category = await this.categoryModel.createCategory(userId, {
					name: "Meta",
					color: "#6B7280",
				});
			}
			categoryId = category.id;
		}

		let paymentMethod = await this.paymentMethodModel.findByName(
			"Interno",
			userId,
		);
		if (!paymentMethod) {
			paymentMethod = await this.paymentMethodModel.createMethod(userId, {
				name: "Interno",
			});
		}

		const transaction = await this.transactionModel.createTransaction(userId, {
			description: `Meta: ${goal.name}`,
			amount: amount,
			type: "expense",
			date: new Date().toISOString(),
			categoryId: categoryId,
			paymentMethodId: paymentMethod.id,
		});

		const newAmount = Number(goal.currentAmount) + amount;

		const [category] = await db
			.update(goals)
			.set({
				currentAmount: newAmount.toString(),
				categoryId: categoryId,
			})
			.where(eq(goals.id, id))
			.returning();

		const [contribution] = await db
			.insert(goalContributions)
			.values({
				goalId: id,
				transactionId: transaction.id,
				type: "deposit",
				amount: amount.toString(),
			})
			.returning();

		return {
			contribution,
			goal: {
				...goal,
				categoryId: category.categoryId,
				currentAmount: newAmount.toString(),
			},
		};
	}

	async withdraw(userId: string, id: string, amount: number) {
		const goal = await this.findById(id);
		if (!goal || goal.userId !== userId) return null;

		const currentAmount = Number(goal.currentAmount);
		if (amount > currentAmount) {
			throw new Error("Valor maior que o saldo disponível");
		}

		let categoryId = goal.categoryId;
		if (!categoryId) {
			let category = await this.categoryModel.findByName("Meta", userId);
			if (!category) {
				category = await this.categoryModel.createCategory(userId, {
					name: "Meta",
					color: "#6B7280",
				});
			}
			categoryId = category.id;
		}

		let paymentMethod = await this.paymentMethodModel.findByName(
			"Interno",
			userId,
		);
		if (!paymentMethod) {
			paymentMethod = await this.paymentMethodModel.createMethod(userId, {
				name: "Interno",
			});
		}

		const transaction = await this.transactionModel.createTransaction(userId, {
			description: `Saque: ${goal.name}`,
			amount: amount,
			type: "income",
			date: new Date().toISOString(),
			categoryId: categoryId,
			paymentMethodId: paymentMethod.id,
		});

		const newAmount = currentAmount - amount;

		await db
			.update(goals)
			.set({
				currentAmount: newAmount.toString(),
			})
			.where(eq(goals.id, id));

		const [withdrawal] = await db
			.insert(goalContributions)
			.values({
				goalId: id,
				transactionId: transaction.id,
				type: "withdrawal",
				amount: amount.toString(),
			})
			.returning();

		return {
			withdrawal,
			goal: { ...goal, currentAmount: newAmount.toString() },
		};
	}

	async findContributionsByGoalId(goalId: string) {
		const result = await db
			.select({
				id: goalContributions.id,
				goalId: goalContributions.goalId,
				transactionId: goalContributions.transactionId,
				type: goalContributions.type,
				amount: goalContributions.amount,
				createdAt: goalContributions.createdAt,
			})
			.from(goalContributions)
			.where(eq(goalContributions.goalId, goalId))
			.orderBy(goalContributions.createdAt);

		return result;
	}

	async removeContribution(userId: string, contributionId: string) {
		const [contribution] = await db
			.select()
			.from(goalContributions)
			.where(eq(goalContributions.id, contributionId))
			.limit(1);

		if (!contribution) return null;

		const goal = await this.findById(contribution.goalId);
		if (!goal || goal.userId !== userId) return null;

		await this.transactionModel.deleteTransaction(
			contribution.transactionId,
			userId,
		);

		const newAmount = Number(goal.currentAmount) - Number(contribution.amount);
		await db
			.update(goals)
			.set({ currentAmount: newAmount.toString() })
			.where(eq(goals.id, goal.id));

		await db
			.delete(goalContributions)
			.where(eq(goalContributions.id, contributionId));

		return {
			removed: contribution,
			goal: { ...goal, currentAmount: newAmount.toString() },
		};
	}

	async delete(id: string) {
		const [result] = await db.delete(goals).where(eq(goals.id, id)).returning();

		return result;
	}
}

export const goalsModel = new GoalsModel();
