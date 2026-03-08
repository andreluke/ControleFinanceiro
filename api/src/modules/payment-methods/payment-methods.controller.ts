import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { PaymentMethodModel } from "./payment-methods.model";
import {
	createPaymentMethodSchema,
	updatePaymentMethodSchema,
} from "./payment-methods.schema";

export class PaymentMethodsController {
	constructor(private readonly paymentMethodModel = new PaymentMethodModel()) {}

	listPaymentMethods = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const [err, methods] = await catchError(this.paymentMethodModel.findAll(userId));
		if (err) throw new AppError("Erro ao listar métodos de pagamento", 500);

		return reply.send(methods);
	};

	createPaymentMethod = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const body = createPaymentMethodSchema.parse(request.body);

		const [err, method] = await catchError(
			this.paymentMethodModel.createMethod(userId, body),
		);
		if (err) throw new AppError("Erro ao criar método de pagamento", 500);

		return reply.status(201).send(method);
	};

	updatePaymentMethod = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;
		const body = updatePaymentMethodSchema.parse(request.body);

		const [err, updated] = await catchError(
			this.paymentMethodModel.updateMethod(id, userId, body),
		);
		if (err) throw new AppError("Erro ao atualizar método de pagamento", 500);

		if (!updated) {
			throw new AppError(
				"Método de pagamento não encontrado ou já deletado",
				404,
			);
		}

		return reply.send(updated);
	};

	deletePaymentMethod = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, deleted] = await catchError(
			this.paymentMethodModel.softDelete(id, userId),
		);
		if (err) throw new AppError("Erro ao deletar método de pagamento", 500);

		if (!deleted) {
			throw new AppError(
				"Método de pagamento não encontrado ou já deletado",
				404,
			);
		}

		return reply.send({ message: "Método de pagamento deletado com sucesso" });
	};

	restorePaymentMethod = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, restored] = await catchError(
			this.paymentMethodModel.restoreMethod(id, userId),
		);
		if (err) throw new AppError("Erro ao restaurar método de pagamento", 500);

		if (!restored) {
			throw new AppError("Método de pagamento não encontrado", 404);
		}

		return reply.send(restored);
	};
}
