import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { CategoryModel } from "../categories/categories.model";
import { PaymentMethodModel } from "../payment-methods/payment-methods.model";
import { TransactionModel } from "../transactions/transactions.model";
import { RecurringTransactionModel } from "./recurring.model";
import {
	createRecurringTransactionSchema,
	updateRecurringTransactionSchema,
	listRecurringTransactionsSchema,
} from "./recurring.schema";

export class RecurringTransactionController {
	constructor(
		private readonly recurringModel = new RecurringTransactionModel(),
		private readonly categoryModel = new CategoryModel(),
		private readonly paymentMethodModel = new PaymentMethodModel(),
		private readonly transactionModel = new TransactionModel(),
	) {}

	listRecurringTransactions = async (
		request: FastifyRequest,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const filters = listRecurringTransactionsSchema.parse(request.query);

		const [err, result] = await catchError(
			this.recurringModel.findAll(userId, filters),
		);
		if (err) throw new AppError(`Erro ao listar transações recorrentes, ${err.message}`, 500);

		return reply.send(result);
	};

	getRecurringTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, recurring] = await catchError(
			this.recurringModel.findById(id, userId),
		);
		if (err) throw new AppError("Erro ao buscar transação recorrente", 500);

		if (!recurring) {
			throw new AppError("Transação recorrente não encontrada", 404);
		}

		return reply.send(recurring);
	};

	createRecurringTransaction = async (
		request: FastifyRequest,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const body = createRecurringTransactionSchema.parse(request.body);

		if (body.categoryId) {
			const [errCat, category] = await catchError(
				this.categoryModel.findById(body.categoryId, userId),
			);
			if (errCat) throw new AppError("Erro ao validar categoria", 500);
			if (!category) throw new AppError("Categoria não encontrada", 404);
		}

		if (body.paymentMethodId) {
			const [errPm, method] = await catchError(
				this.paymentMethodModel.findById(body.paymentMethodId, userId),
			);
			if (errPm) throw new AppError("Erro ao validar método de pagamento", 500);
			if (!method)
				throw new AppError("Método de pagamento não encontrado", 404);
		}

		const [errCreate, recurring] = await catchError(
			this.recurringModel.createRecurringTransaction(userId, body),
		);
		if (errCreate)
			throw new AppError("Erro ao criar transação recorrente", 500);

		return reply.status(201).send(recurring);
	};

	updateRecurringTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;
		const body = updateRecurringTransactionSchema.parse(request.body);

		if (body.categoryId) {
			const [errCat, category] = await catchError(
				this.categoryModel.findById(body.categoryId, userId),
			);
			if (errCat) throw new AppError("Erro ao validar categoria", 500);
			if (!category) throw new AppError("Categoria não encontrada", 404);
		}

		if (body.paymentMethodId) {
			const [errPm, method] = await catchError(
				this.paymentMethodModel.findById(body.paymentMethodId, userId),
			);
			if (errPm) throw new AppError("Erro ao validar método de pagamento", 500);
			if (!method)
				throw new AppError("Método de pagamento não encontrado", 404);
		}

		const [errUpdate, updated] = await catchError(
			this.recurringModel.updateRecurringTransaction(id, userId, body),
		);
		if (errUpdate)
			throw new AppError("Erro ao atualizar transação recorrente", 500);

		if (!updated) {
			throw new AppError("Transação recorrente não encontrada", 404);
		}

		const [errReload, reloaded] = await catchError(
			this.recurringModel.findById(id, userId),
		);
		if (errReload)
			throw new AppError(
				"Erro ao carregar transação recorrente atualizada",
				500,
			);

		return reply.send(reloaded);
	};

	toggleRecurringTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, toggled] = await catchError(
			this.recurringModel.toggleActive(id, userId),
		);
		if (err) throw new AppError("Erro ao alternar transação recorrente", 500);

		if (!toggled) {
			throw new AppError("Transação recorrente não encontrada", 404);
		}

		return reply.send(toggled);
	};

	deleteRecurringTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [errDelete, deleted] = await catchError(
			this.recurringModel.softDelete(id, userId),
		);
		if (errDelete)
			throw new AppError("Erro ao deletar transação recorrente", 500);

		if (!deleted) {
			throw new AppError("Transação recorrente não encontrada", 404);
		}

		return reply.send({
			message: "Transação recorrente desativada com sucesso",
		});
	};

	processRecurringTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [errFind, recurring] = await catchError(
			this.recurringModel.findById(id, userId),
		);
		if (errFind) throw new AppError("Erro ao buscar transação recorrente", 500);
		if (!recurring)
			throw new AppError("Transação recorrente não encontrada", 404);

		if (!recurring.isActive) {
			throw new AppError("Transação recorrente está inativa", 400);
		}

		const now = new Date();
		const nextDate = this.calculateNextDate(recurring);

		if (!nextDate) {
			throw new AppError("Não há próxima data para gerar transação", 400);
		}

		const [errCreate, transaction] = await catchError(
			this.transactionModel.createTransaction(userId, {
				description: recurring.description,
				subDescription: recurring.subDescription ?? undefined,
				amount: Number(recurring.amount),
				type: recurring.type as "income" | "expense",
				date: nextDate.toISOString(),
				categoryId: recurring.categoryId ?? undefined,
				paymentMethodId: recurring.paymentMethodId ?? undefined,
			}),
		);
		if (errCreate) throw new AppError("Erro ao gerar transação", 500);

		await this.recurringModel.updateRecurringTransaction(id, userId, {
			lastGeneratedAt: now.toISOString() as unknown as undefined,
		} as never);

		return reply.status(201).send(transaction);
	};

	private calculateNextDate(recurring: {
		frequency: string;
		customIntervalDays: string | null;
		dayOfMonth: string;
		dayOfWeek: string | null;
		startDate: Date;
		endDate: Date | null;
		lastGeneratedAt: Date | null;
	}): Date | null {
		const now = new Date();
		const startDate = new Date(recurring.startDate);
		let nextDate = new Date(now);

		if (now < startDate) {
			nextDate = startDate;
		} else if (recurring.lastGeneratedAt) {
			const lastGen = new Date(recurring.lastGeneratedAt);

			switch (recurring.frequency) {
				case "daily":
					nextDate = new Date(lastGen);
					nextDate.setDate(nextDate.getDate() + 1);
					break;
				case "weekly":
					nextDate = new Date(lastGen);
					nextDate.setDate(nextDate.getDate() + 7);
					break;
				case "monthly":
					nextDate = new Date(lastGen);
					nextDate.setMonth(nextDate.getMonth() + 1);
					break;
				case "yearly":
					nextDate = new Date(lastGen);
					nextDate.setFullYear(nextDate.getFullYear() + 1);
					break;
				case "custom": {
					const interval = Number.parseInt(recurring.customIntervalDays || "0", 10);
					if (interval > 0) {
						nextDate = new Date(lastGen);
						nextDate.setDate(nextDate.getDate() + interval);
					}
					break;
				}
			}
		} else {
			nextDate = startDate;
		}

		if (recurring.endDate && nextDate > new Date(recurring.endDate)) {
			return null;
		}

		return nextDate;
	}
}
