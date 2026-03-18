import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import BudgetsModel from "./budgets.model";
import {
	createBudgetSchema,
	updateBudgetSchema,
	budgetQuerySchema,
} from "./budgets.schema";

export class BudgetsController {
	async list(req: FastifyRequest, reply: FastifyReply) {
		const userId = (req.user as { sub: string }).sub;
		const query = budgetQuerySchema.parse(req.query || {});

		const now = new Date();
		const month = query.month ?? now.getMonth() + 1;
		const year = query.year ?? now.getFullYear();

		const summary = await BudgetsModel.getSummary(userId, month, year);

		return reply.send(summary);
	}

	async create(req: FastifyRequest, reply: FastifyReply) {
		const userId = (req.user as { sub: string }).sub;
		const data = createBudgetSchema.parse(req.body);

		const existing = await BudgetsModel.findByUserAndPeriod(
			userId,
			data.month,
			data.year,
		);

		if (data.subcategoryId) {
			const hasSubcategoryBudget = existing.find(
				(b) => b.subcategoryId && b.subcategoryId === data.subcategoryId,
			);

			if (hasSubcategoryBudget) {
				throw new AppError(
					"Já existe orçamento para esta subcategoria neste mês",
					409,
				);
			}

			const hasParentBudget = existing.find(
				(b) => b.categoryId === data.categoryId && !b.subcategoryId,
			);

			if (!hasParentBudget) {
				await BudgetsModel.create({
					userId,
					categoryId: data.categoryId,
					subcategoryId: undefined,
					amount: 0,
					month: data.month,
					year: data.year,
				});
			}
		} else {
			const hasCategory = existing.find(
				(b) => b.categoryId === data.categoryId,
			);

			if (hasCategory) {
				throw new AppError(
					"Já existe orçamento para esta categoria neste mês",
					409,
				);
			}
		}

		const [err, budget] = await catchError(
			BudgetsModel.create({
				userId,
				...data,
			}),
		);

		if (err) {
			console.error("Error creating budget:", err);
			throw new AppError("Erro ao criar orçamento", 500);
		}

		return reply.status(201).send({ budget });
	}

	async update(req: FastifyRequest, reply: FastifyReply) {
		const { id } = req.params as { id: string };
		const data = updateBudgetSchema.parse(req.body);

		const existing = await BudgetsModel.findById(id);
		if (!existing) {
			throw new AppError("Orçamento não encontrado", 404);
		}

		const userId = (req.user as { sub: string }).sub;
		if (existing.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		const [err, updated] = await catchError(
			BudgetsModel.update(id, userId, data),
		);

		if (err) {
			throw new AppError("Erro ao atualizar orçamento", 500);
		}

		return reply.send({ budget: updated });
	}

	async toggleActive(req: FastifyRequest, reply: FastifyReply) {
		const { id } = req.params as { id: string };

		const existing = await BudgetsModel.findById(id);
		if (!existing) {
			throw new AppError("Orçamento não encontrado", 404);
		}

		const userId = (req.user as { sub: string }).sub;
		if (existing.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		if (!existing.isRecurring) {
			throw new AppError(
				"Só é possível desativar orçamentos recorrentes",
				400,
			);
		}

		const [err, toggled] = await catchError(
			BudgetsModel.toggleActive(id, userId),
		);

		if (err) {
			throw new AppError("Erro ao desativar orçamento", 500);
		}

		return reply.send({ budget: toggled });
	}

	async delete(req: FastifyRequest, reply: FastifyReply) {
		const { id } = req.params as { id: string };

		const existing = await BudgetsModel.findById(id);
		if (!existing) {
			throw new AppError("Orçamento não encontrado", 404);
		}

		const userId = (req.user as { sub: string }).sub;
		if (existing.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		const deletedSubcategoryId = existing.subcategoryId;
		const deletedCategoryId = existing.categoryId;
		const deletedAmount = Number(existing.amount);

		const [err] = await catchError(BudgetsModel.delete(id));

		if (err) {
			throw new AppError("Erro ao excluir orçamento", 500);
		}

		if (deletedSubcategoryId && deletedAmount === 0) {
			const allBudgets = await BudgetsModel.findByUserAndPeriod(
				userId,
				Number(existing.month),
				Number(existing.year),
			);

			const remainingSubcategoryBudgets = allBudgets.filter(
				(b) => b.categoryId === deletedCategoryId && b.subcategoryId && b.id !== id
			);

			if (remainingSubcategoryBudgets.length === 0) {
				const parentBudget = allBudgets.find(
					(b) => b.categoryId === deletedCategoryId && !b.subcategoryId
				);

				if (parentBudget && Number(parentBudget.amount) === 0) {
					await BudgetsModel.delete(parentBudget.id);
				}
			}
		}

		return reply.status(204).send();
	}
}

export default new BudgetsController();
