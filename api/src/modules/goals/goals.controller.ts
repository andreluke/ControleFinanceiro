import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { triggerGoalMilestoneNotification } from "../../utils/notificationTrigger";
import { GoalsModel } from "./goals.model";
import {
	contributeGoalSchema,
	createGoalSchema,
	updateGoalSchema,
	withdrawGoalSchema,
} from "./goals.schema";

export class GoalsController {
	private readonly goalsModel = new GoalsModel();

	list = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;

		const [err, goals] = await catchError(this.goalsModel.findAll(userId));

		if (err) {
			throw new AppError("Erro ao listar metas", 500);
		}

		return reply.send({ goals });
	};

	create = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;
		const data = createGoalSchema.parse(req.body);

		const [err, goal] = await catchError(this.goalsModel.create(userId, data));

		if (err) {
			throw new AppError("Erro ao criar meta", 500);
		}

		return reply.status(201).send({ goal });
	};

	get = async (req: FastifyRequest, reply: FastifyReply) => {
		const { id } = req.params as { id: string };

		const [err, goal] = await catchError(this.goalsModel.findById(id));

		if (err) {
			throw new AppError("Erro ao buscar meta", 500);
		}

		if (!goal) {
			throw new AppError("Meta não encontrada", 404);
		}

		return reply.send({ goal });
	};

	update = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;
		const { id } = req.params as { id: string };
		const data = updateGoalSchema.parse(req.body);

		const [error, existing] = await catchError(this.goalsModel.findById(id));

		if (error) {
			throw new AppError("Erro ao buscar meta", 500);
		}

		if (!existing) {
			throw new AppError("Meta não encontrada", 404);
		}

		if (existing.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		const [err, goal] = await catchError(this.goalsModel.update(id, data));

		if (err) {
			throw new AppError("Erro ao atualizar meta", 500);
		}

		return reply.send({ goal });
	};

	contribute = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;
		const { id } = req.params as { id: string };
		const data = contributeGoalSchema.parse(req.body);

		const [error, existing] = await catchError(this.goalsModel.findById(id));

		if (error) {
			throw new AppError("Erro ao buscar meta", 500);
		}

		if (!existing) {
			throw new AppError("Meta não encontrada", 404);
		}

		if (existing.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		const [err, result] = await catchError(
			this.goalsModel.contribute(userId, id, data.amount),
		);

		if (err) {
			throw new AppError("Erro ao contribuir com meta", 500);
		}

		if (result) {
			triggerGoalMilestoneNotification({
				userId,
				goalId: id,
				goalName: existing.name,
				currentAmount: Number(result.goal.currentAmount),
				targetAmount: Number(result.goal.targetAmount),
			}).catch((e) => console.error("[notification] goal trigger failed:", e));
		}

		return reply.send({ goal: result?.goal, contribution: result?.contribution });
	};

	withdraw = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;
		const { id } = req.params as { id: string };
		const data = withdrawGoalSchema.parse(req.body);

		const [error, existing] = await catchError(this.goalsModel.findById(id));
		if (error) {
			throw new AppError("Erro ao buscar meta", 500);
		}
		if (!existing) {
			throw new AppError("Meta não encontrada", 404);
		}

		if (existing.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		const [err, result] = await catchError(
			this.goalsModel.withdraw(userId, id, data.amount),
		);

		if (err) {
			if (err.message === "Valor maior que o saldo disponível") {
				throw new AppError(err.message, 400);
			}
			throw new AppError("Erro ao sacar da meta", 500);
		}

		return reply.send({ goal: result?.goal });
	};

	delete = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;
		const { id } = req.params as { id: string };

		const [error, existing] = await catchError(this.goalsModel.findById(id));
		if (error) {
			throw new AppError("Erro ao buscar meta", 500);
		}
		if (!existing) {
			throw new AppError("Meta não encontrada", 404);
		}

		if (existing.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		const [err] = await catchError(this.goalsModel.delete(id));

		if (err) {
			throw new AppError("Erro ao excluir meta", 500);
		}

		return reply.status(204).send();
	};

	listContributions = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;
		const { id } = req.params as { id: string };

		const [error, goal] = await catchError(this.goalsModel.findById(id));
		if (error) {
			throw new AppError("Erro ao buscar meta", 500);
		}
		if (!goal) {
			throw new AppError("Meta não encontrada", 404);
		}

		if (goal.userId !== userId) {
			throw new AppError("Não autorizado", 403);
		}

		const [err, contributions] = await catchError(
			this.goalsModel.findContributionsByGoalId(id),
		);

		if (err) {
			throw new AppError("Erro ao listar contribuições", 500);
		}

		return reply.send({ contributions });
	};

	removeContribution = async (req: FastifyRequest, reply: FastifyReply) => {
		const userId = (req.user as { sub: string }).sub;
		const { id } = req.params as { id: string };

		const [err, result] = await catchError(
			this.goalsModel.removeContribution(userId, id),
		);

		if (err) {
			throw new AppError("Erro ao remover contribuição", 500);
		}

		if (!result) {
			throw new AppError("Contribuição não encontrada", 404);
		}

		return reply.send({ goal: result.goal });
	};
}

export default new GoalsController();
