import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { triggerBudgetNotification } from "../../utils/notificationTrigger";
import { CategoryModel } from "../categories/categories.model";
import { PaymentMethodModel } from "../payment-methods/payment-methods.model";
import budgetsModel from "../budgets/budgets.model";
import type { BudgetWithCategory } from "../budgets/budgets.types";
import { TransactionModel } from "./transactions.model";
import {
	createTransactionSchema,
	listTransactionsSchema,
	updateTransactionSchema,
} from "./transactions.schema";

export class TransactionsController {
	constructor(
		private readonly transactionModel = new TransactionModel(),
		private readonly categoryModel = new CategoryModel(),
		private readonly paymentMethodModel = new PaymentMethodModel(),
	) {}

	private async checkBudgetNotifications(
		userId: string,
		categoryId: string,
		subcategoryId: string | null,
	) {
		const transactionDate = new Date();
		const month = transactionDate.getMonth() + 1;
		const year = transactionDate.getFullYear();

		const budgetsWithCategory = await budgetsModel.getWithCategory(userId, month, year);

		const relevantBudget = budgetsWithCategory.find(
			(b: BudgetWithCategory) =>
				b.categoryId === categoryId &&
				(subcategoryId ? b.subcategoryId === subcategoryId : !b.subcategoryId),
		);

		if (relevantBudget) {
			const displayName = relevantBudget.subcategoryName ?? relevantBudget.categoryName;
			triggerBudgetNotification({
				userId,
				budgetId: relevantBudget.id,
				categoryName: displayName,
				usedAmount: relevantBudget.spent,
				budgetAmount: relevantBudget.amount,
			}).catch((err) => console.error("[notification] budget trigger failed:", err));
		}
	}

	listTransactions = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const filters = listTransactionsSchema.parse(request.query);

		const [err, result] = await catchError(
			this.transactionModel.findAll(userId, filters),
		);
		if (err) throw new AppError("Erro ao listar transações", 500);

		return reply.send(result);
	};

	getTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, transaction] = await catchError(
			this.transactionModel.findById(id, userId),
		);
		if (err) throw new AppError("Erro ao buscar transação", 500);

		if (!transaction) {
			throw new AppError("Transação não encontrada", 404);
		}

		return reply.send(transaction);
	};

	createTransaction = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const body = createTransactionSchema.parse(request.body);

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

		const [errCreate, transaction] = await catchError(
			this.transactionModel.createTransaction(userId, body),
		);
		if (errCreate) throw new AppError("Erro ao criar transação", 500);

		if (body.type === "expense" && body.categoryId) {
			this.checkBudgetNotifications(userId, body.categoryId, body.subcategoryId || null);
		}

		return reply.status(201).send(transaction);
	};

	updateTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;
		const body = updateTransactionSchema.parse(request.body);

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
			this.transactionModel.updateTransaction(id, userId, body),
		);
		if (errUpdate) throw new AppError("Erro ao atualizar transação", 500);

		if (!updated) {
			throw new AppError("Transação não encontrada", 404);
		}

		// Reload with relations
		const [errReload, reloaded] = await catchError(
			this.transactionModel.findById(id, userId),
		);
		if (errReload)
			throw new AppError("Erro ao carregar transação atualizada", 500);

		if (reloaded && reloaded.type === "expense" && reloaded.categoryId) {
			this.checkBudgetNotifications(userId, reloaded.categoryId, reloaded.subcategoryId);
		}

		return reply.send(reloaded);
	};

	deleteTransaction = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [errDelete, deleted] = await catchError(
			this.transactionModel.deleteTransaction(id, userId),
		);
		if (errDelete) throw new AppError("Erro ao deletar transação", 500);

		if (!deleted) {
			throw new AppError("Transação não encontrada", 404);
		}

		return reply.send({ message: "Transação deletada com sucesso" });
	};
}
