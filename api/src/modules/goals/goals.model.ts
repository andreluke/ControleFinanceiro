import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { goals } from "../../drizzle/schema";
import type { CreateGoalInput, UpdateGoalInput } from "./goals.schema";
import { CategoryModel } from "../categories/categories.model";
import { TransactionModel } from "../transactions/transactions.model";

const categoryModel = new CategoryModel();
const transactionModel = new TransactionModel();

export class GoalsModel {
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
      let category = await categoryModel.findByName("Meta", userId);
      if (!category) {
        category = await categoryModel.createCategory(userId, {
          name: "Meta",
          color: "#6B7280",
        });
      }
      categoryId = category.id;
    }

    await transactionModel.createTransaction(userId, {
      description: `Meta: ${goal.name}`,
      amount: amount,
      type: "income",
      date: new Date().toISOString(),
      categoryId: categoryId,
    });

    const newAmount = Number(goal.currentAmount) + amount;

    const [result] = await db
      .update(goals)
      .set({
        currentAmount: newAmount.toString(),
        categoryId: categoryId,
      })
      .where(eq(goals.id, id))
      .returning();

    return result;
  }

  async delete(id: string) {
    const [result] = await db.delete(goals).where(eq(goals.id, id)).returning();

    return result;
  }
}