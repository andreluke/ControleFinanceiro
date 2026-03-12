import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { CategoryModel } from "./categories.model";
import {
	createCategorySchema,
	updateCategorySchema,
} from "./categories.schema";

export class CategoriesController {
	constructor(private readonly categoryModel = new CategoryModel()) {}

	listCategories = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const [err, categories] = await catchError(
			this.categoryModel.findAll(userId),
		);
		if (err) throw new AppError("Erro ao listar categorias", 500);

		return reply.send(categories);
	};

	createCategory = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const body = createCategorySchema.parse(request.body);

		const [err, category] = await catchError(
			this.categoryModel.createCategory(userId, body),
		);
		if (err) throw new AppError("Erro ao criar categoria", 500);

		return reply.status(201).send(category);
	};

	updateCategory = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;
		const body = updateCategorySchema.parse(request.body);

		const [err, updated] = await catchError(
			this.categoryModel.updateCategory(id, userId, body),
		);
		if (err) throw new AppError("Erro ao atualizar categoria", 500);

		if (!updated) {
			throw new AppError("Categoria não encontrada ou já deletada", 404);
		}

		return reply.send(updated);
	};

	deleteCategory = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, deleted] = await catchError(
			this.categoryModel.softDelete(id, userId),
		);
		if (err) throw new AppError("Erro ao deletar categoria", 500);

		if (!deleted) {
			throw new AppError("Categoria não encontrada ou já deletada", 404);
		}

		return reply.send({ message: "Categoria deletada com sucesso" });
	};

	restoreCategory = async (
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { id } = request.params;

		const [err, restored] = await catchError(
			this.categoryModel.restoreCategory(id, userId),
		);
		if (err) throw new AppError("Erro ao restaurar categoria", 500);

		if (!restored) {
			throw new AppError("Categoria não encontrada", 404);
		}

		return reply.send(restored);
	};
}
