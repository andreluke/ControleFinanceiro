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

		const hasCategory = existing.find(
			(b) => b.categoryId === data.categoryId,
		);

		if (hasCategory) {
			throw new AppError(
				"Já existe orçamento para esta categoria neste mês",
				409,
			);
		}

		const [err, budget] = await catchError(
			BudgetsModel.create({
				userId,
				...data,
			}),
		);

		if (err) {
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

		const [err, updated] = await catchError(BudgetsModel.update(id, data));

		if (err) {
			throw new AppError("Erro ao atualizar orçamento", 500);
		}

		return reply.send({ budget: updated });
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

		const [err] = await catchError(BudgetsModel.delete(id));

		if (err) {
			throw new AppError("Erro ao excluir orçamento", 500);
		}

		return reply.status(204).send();
	}
}

export default new BudgetsController();
