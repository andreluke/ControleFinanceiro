import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { SubcategoryModel } from "./subcategories.model";
import {
	type Subcategory,
	createSubcategorySchema,
	updateSubcategorySchema,
} from "./subcategories.schema";

export class SubcategoriesController {
	constructor(private readonly model = new SubcategoryModel()) {}

	list = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const { categoryId } = request.query as { categoryId?: string };

		let subcategories: Subcategory[];
		if (categoryId) {
			subcategories = await this.model.findByCategory(userId, categoryId);
		} else {
			subcategories = await this.model.findAll(userId);
		}

		return reply.send(subcategories);
	};

	create = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const body = createSubcategorySchema.parse(request.body);

		const [err, subcategory] = await catchError(
			this.model.create(userId, body),
		);
		if (err) throw new AppError("Erro ao criar subcategoria", 500);

		return reply.status(201).send(subcategory);
	};

	update = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;
		const body = updateSubcategorySchema.parse(request.body);

		const [err, updated] = await catchError(
			this.model.update(id, userId, body),
		);
		if (err) throw new AppError("Erro ao atualizar subcategoria", 500);

		if (!updated) {
			throw new AppError("Subcategoria não encontrada", 404);
		}

		return reply.send(updated);
	};

	delete = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, deleted] = await catchError(this.model.softDelete(id, userId));
		if (err) throw new AppError("Erro ao deletar subcategoria", 500);

		if (!deleted) {
			throw new AppError("Subcategoria não encontrada", 404);
		}

		return reply.send({ message: "Subcategoria deletada com sucesso" });
	};

	restore = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, restored] = await catchError(this.model.restore(id, userId));
		if (err) throw new AppError("Erro ao restaurar subcategoria", 500);

		if (!restored) {
			throw new AppError("Subcategoria não encontrada", 404);
		}

		return reply.send(restored);
	};
}

export default new SubcategoriesController();
