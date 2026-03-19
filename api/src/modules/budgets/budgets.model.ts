import { and, desc, eq, gte, lte, or, sql, sum } from "drizzle-orm";
import { db } from "../../drizzle/client";
import {
  budgets,
  categories,
  subcategories,
  transactions,
} from "../../drizzle/schema";
import type {
  Budget,
  BudgetWithCategory,
  BudgetSummary,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "./budgets.types";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value === null || value === undefined) return 0;
  return 0;
}

export class BudgetsModel {
  private async recalculateParentBudget(
    userId: string,
    categoryId: string,
    month: number,
    year: number,
  ): Promise<void> {
    const categoryBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.categoryId, categoryId),
          eq(budgets.month, String(month)),
          eq(budgets.year, String(year)),
        ),
      );

    const parentBudget = categoryBudgets.find((b) => !b.subcategoryId);
    const subcategoryBudgets = categoryBudgets.filter((b) => b.subcategoryId);

    if (parentBudget) {
      const subcategoriesTotal = subcategoryBudgets.reduce(
        (sum, b) => sum + toNumber(b.amount),
        0,
      );
      const baseAmount = toNumber(parentBudget.baseAmount);
      const newTotal = baseAmount + subcategoriesTotal;

      await db
        .update(budgets)
        .set({ amount: String(newTotal), updatedAt: new Date() })
        .where(eq(budgets.id, parentBudget.id));
    }
  }

  async create(data: CreateBudgetInput & { userId: string }): Promise<Budget> {
    const isSubcategory = !!data.subcategoryId;
    const baseAmount = isSubcategory ? 0 : (data.baseAmount ?? data.amount);
    let amount = isSubcategory ? data.amount : data.amount;

    let existingSubcategoriesTotal = 0;
    if (!isSubcategory) {
      const existingBudgets = await db
        .select({
          amount: budgets.amount,
          subcategoryId: budgets.subcategoryId,
        })
        .from(budgets)
        .where(
          and(
            eq(budgets.userId, data.userId),
            eq(budgets.categoryId, data.categoryId),
            eq(budgets.month, String(data.month)),
            eq(budgets.year, String(data.year)),
          ),
        );
      const existingSubs = existingBudgets.filter((b) => b.subcategoryId);
      existingSubcategoriesTotal = existingSubs.reduce(
        (sum, b) => sum + toNumber(b.amount),
        0,
      );
      amount = baseAmount + existingSubcategoriesTotal;
    }

    let recurringGroupId: string | null = null;

    const [created] = await db
      .insert(budgets)
      .values({
        userId: data.userId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        amount: String(amount),
        baseAmount: isSubcategory ? null : String(baseAmount),
        month: String(data.month),
        year: String(data.year),
        isRecurring: data.isRecurring ?? false,
        isActive: true,
      })
      .returning();

    if (data.isRecurring) {
      recurringGroupId = created.id;
      await db
        .update(budgets)
        .set({ recurringGroupId })
        .where(eq(budgets.id, created.id));
    }

    if (isSubcategory) {
      await this.recalculateParentBudget(
        data.userId,
        data.categoryId,
        data.month,
        data.year,
      );
    }

    return { ...created, recurringGroupId };
  }

  async findById(id: string): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }

  async findByUserAndPeriod(
    userId: string,
    month: number,
    year: number,
  ): Promise<Budget[]> {
    return db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, String(month)),
          eq(budgets.year, String(year)),
        ),
      )
      .orderBy(desc(budgets.createdAt));
  }

  async findByUser(userId: string): Promise<Budget[]> {
    return db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.year), desc(budgets.month));
  }

  async findRecurringByUser(userId: string): Promise<Budget[]> {
    return db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.isRecurring, true)));
  }

  async ensureRecurringBudgetsExist(
    userId: string,
    month: number,
    year: number,
  ): Promise<void> {
    const recurringBudgets = await this.findRecurringByUser(userId);

    if (recurringBudgets.length === 0) return;

    const existingBudgets = await this.findByUserAndPeriod(userId, month, year);
    const existingGroupIds = existingBudgets
      .map((b) => b.recurringGroupId)
      .filter((id): id is string => id !== null);

    const recurringGroupIds = recurringBudgets
      .map((b) => b.recurringGroupId)
      .filter((id): id is string => id !== null);

    const missingGroupIds = recurringGroupIds.filter(
      (id) => !existingGroupIds.includes(id),
    );

    for (const groupId of missingGroupIds) {
      const templateBudget = recurringBudgets.find(
        (b) => b.recurringGroupId === groupId,
      );
      if (!templateBudget) continue;

      const [isActive] = await db
        .select({ isActive: budgets.isActive })
        .from(budgets)
        .where(eq(budgets.id, groupId))
        .limit(1);

      await db.insert(budgets).values({
        userId,
        categoryId: templateBudget.categoryId,
        subcategoryId: templateBudget.subcategoryId,
        amount: templateBudget.amount,
        baseAmount: templateBudget.baseAmount,
        month: String(month),
        year: String(year),
        isRecurring: true,
        isActive: isActive?.isActive ?? true,
        recurringGroupId: groupId,
      });
    }
  }

  async getWithCategory(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetWithCategory[]> {
    await this.ensureRecurringBudgetsExist(userId, month, year);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const userBudgets = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        baseAmount: budgets.baseAmount,
        month: budgets.month,
        year: budgets.year,
        categoryId: budgets.categoryId,
        subcategoryId: budgets.subcategoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        subcategoryName: subcategories.name,
        subcategoryColor: subcategories.color,
        isRecurring: budgets.isRecurring,
        isActive: budgets.isActive,
        recurringGroupId: budgets.recurringGroupId,
        createdAt: budgets.createdAt,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .leftJoin(subcategories, eq(budgets.subcategoryId, subcategories.id))
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, String(month)),
          eq(budgets.year, String(year)),
        ),
      );

    const subcategoryBudgets = userBudgets.filter((b) => b.subcategoryId);

    const subcategoriesTotalByCategory = new Map<string, number>();
    for (const sub of subcategoryBudgets) {
      const current = subcategoriesTotalByCategory.get(sub.categoryId) || 0;
      subcategoriesTotalByCategory.set(
        sub.categoryId,
        current + toNumber(sub.amount),
      );
    }

    const budgetsWithSpent: BudgetWithCategory[] = await Promise.all(
      userBudgets.map(async (budget) => {
        const amountNum = toNumber(budget.amount);
        const baseAmountNum = toNumber(budget.baseAmount);

        const conditions = [
          eq(transactions.userId, userId),
          eq(transactions.categoryId, budget.categoryId),
          eq(transactions.type, "expense" as const),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
        ];

        if (budget.subcategoryId) {
          conditions.push(eq(transactions.subcategoryId, budget.subcategoryId));
        }

        const [result] = await db
          .select({ total: sum(transactions.amount) })
          .from(transactions)
          .where(and(...conditions));

        const spent = toNumber(result?.total);
        const percentage = amountNum > 0 ? (spent / amountNum) * 100 : 0;
        const subcategoriesTotal = !budget.subcategoryId
          ? subcategoriesTotalByCategory.get(budget.categoryId) || 0
          : undefined;

        return {
          id: budget.id,
          amount: amountNum,
          baseAmount: budget.subcategoryId ? undefined : baseAmountNum,
          month: toNumber(budget.month),
          year: toNumber(budget.year),
          categoryId: budget.categoryId,
          subcategoryId: budget.subcategoryId,
          categoryName: budget.categoryName || "Sem categoria",
          categoryColor: budget.categoryColor || "#6B7280",
          subcategoryName: budget.subcategoryName || null,
          subcategoryColor: budget.subcategoryColor || null,
          spent,
          percentage,
          remaining: amountNum - spent,
          isOverBudget: spent > amountNum,
          isRecurring: budget.isRecurring,
          isActive: budget.isActive,
          recurringGroupId: budget.recurringGroupId,
          createdAt: budget.createdAt || new Date(),
          subcategoriesTotal,
        };
      }),
    );

    return budgetsWithSpent;
  }

  async getSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetSummary> {
    const budgetsWithCategory = await this.getWithCategory(userId, month, year);

    const parentBudgets = budgetsWithCategory.filter((b) => !b.subcategoryId);

    const totalBudgeted = parentBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = parentBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const overBudgetCount = parentBudgets.filter((b) => b.isOverBudget).length;
    const nearLimitCount = parentBudgets.filter(
      (b) => b.percentage >= 80 && b.percentage <= 100,
    ).length;

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      nearLimitCount,
      budgets: budgetsWithCategory,
    };
  }

  async update(
    id: string,
    userId: string,
    data: UpdateBudgetInput,
  ): Promise<Budget | undefined> {
    const budget = await this.findById(id);
    if (!budget || budget.userId !== userId) return undefined;

    const updateData: {
      amount?: string;
      baseAmount?: string;
      isActive?: boolean;
      isRecurring?: boolean;
      recurringGroupId?: string;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (data.baseAmount !== undefined) {
      updateData.baseAmount = String(data.baseAmount);
      const subcategoriesTotal = await this.getSubcategoriesTotal(
        userId,
        budget.categoryId,
        toNumber(budget.month),
        toNumber(budget.year),
        id,
      );
      updateData.amount = String(data.baseAmount + subcategoriesTotal);
    }

    if (data.amount !== undefined && data.baseAmount === undefined) {
      if (budget.subcategoryId) {
        updateData.amount = String(data.amount);
      } else {
        updateData.baseAmount = String(data.amount);
        updateData.amount = String(data.amount);
      }
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.isRecurring !== undefined) {
      if (data.isRecurring && !budget.isRecurring) {
        updateData.isRecurring = true;
        updateData.isActive = true;
        const newGroupId = crypto.randomUUID();
        updateData.recurringGroupId = newGroupId;

        const [updated] = await db
          .update(budgets)
          .set(updateData)
          .where(eq(budgets.id, id))
          .returning();

        if (updated) {
          await db
            .update(budgets)
            .set({ recurringGroupId: newGroupId })
            .where(eq(budgets.id, id));
        }

        if (budget.subcategoryId) {
          await this.recalculateParentBudget(
            userId,
            budget.categoryId,
            toNumber(budget.month),
            toNumber(budget.year),
          );
        }

        return { ...updated, recurringGroupId: newGroupId };
      }
      updateData.isRecurring = data.isRecurring;

      if (!data.isRecurring) {
        updateData.recurringGroupId = null as unknown as string;
      }
    }

    const [updated] = await db
      .update(budgets)
      .set(updateData)
      .where(eq(budgets.id, id))
      .returning();

    if (
      data.isActive !== undefined &&
      budget.recurringGroupId &&
      data.isActive === false
    ) {
      await db
        .update(budgets)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(budgets.recurringGroupId, budget.recurringGroupId),
            or(
              eq(budgets.isRecurring, true),
              sql`${budgets.id} != ${budget.id}`,
            ),
          ),
        );
    }

    if (budget.subcategoryId && data.amount !== undefined) {
      await this.recalculateParentBudget(
        userId,
        budget.categoryId,
        toNumber(budget.month),
        toNumber(budget.year),
      );
    }

    return updated;
  }

  private async getSubcategoriesTotal(
    userId: string,
    categoryId: string,
    month: number,
    year: number,
    excludeBudgetId?: string,
  ): Promise<number> {
    const categoryBudgets = await db
      .select({ amount: budgets.amount, id: budgets.id })
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.categoryId, categoryId),
          eq(budgets.month, String(month)),
          eq(budgets.year, String(year)),
          sql`${budgets.subcategoryId} IS NOT NULL`,
        ),
      );

    return categoryBudgets
      .filter((b) => b.id !== excludeBudgetId)
      .reduce((sum, b) => sum + toNumber(b.amount), 0);
  }

  async toggleActive(id: string, userId: string): Promise<Budget | undefined> {
    const budget = await this.findById(id);
    if (!budget || budget.userId !== userId) return undefined;

    const newIsActive = !budget.isActive;

    await db
      .update(budgets)
      .set({ isActive: newIsActive, updatedAt: new Date() })
      .where(eq(budgets.id, id));

    return { ...budget, isActive: newIsActive };
  }

  async delete(id: string): Promise<boolean> {
    const budget = await this.findById(id);

    const result = await db.delete(budgets).where(eq(budgets.id, id));
    const rowCount = (result as { rowCount?: number }).rowCount;

    if (rowCount !== undefined && rowCount > 0 && budget?.subcategoryId) {
      await this.recalculateParentBudget(
        budget.userId,
        budget.categoryId,
        toNumber(budget.month),
        toNumber(budget.year),
      );
    }

    return rowCount !== undefined && rowCount > 0;
  }
}

export default new BudgetsModel();
