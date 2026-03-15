import type { FastifyInstance } from "fastify";
import { CategoriesController } from "./categories.controller";

const PUBLIC_ROUTES = ["/health", "/docs"];

export async function registerCategoriesRoutes(app: FastifyInstance) {
	const categoriesController = new CategoriesController();

	app.addHook("onRequest", async (request, reply) => {
		const path = request.url.split("?")[0];
		const isPublicRoute = PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
		if (isPublicRoute) return;

		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get(
		"/categories",
		{
			schema: {
				description: "Lista todas as categorias do usuário",
				tags: ["Categories"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						type: { type: "string", enum: ["income", "expense"] },
						includeDeleted: { type: "boolean" },
					},
				},
			},
		},
		categoriesController.listCategories,
	);

	app.post(
		"/categories",
		{
			schema: {
				description: "Cria uma nova categoria",
				tags: ["Categories"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					required: ["name"],
					properties: {
						name: { type: "string" },
						color: { type: "string" },
						icon: { type: "string" },
					},
				},
			},
		},
		categoriesController.createCategory,
	);

	app.put(
		"/categories/:id",
		{
			schema: {
				description: "Atualiza uma categoria",
				tags: ["Categories"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
				body: {
					type: "object",
					properties: {
						name: { type: "string" },
						color: { type: "string" },
						icon: { type: "string" },
					},
				},
			},
		},
		categoriesController.updateCategory,
	);

	app.delete(
		"/categories/:id",
		{
			schema: {
				description: "Soft delete de uma categoria",
				tags: ["Categories"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		categoriesController.deleteCategory,
	);

	app.patch(
		"/categories/:id/restore",
		{
			schema: {
				description: "Restaura uma categoria deletada",
				tags: ["Categories"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		categoriesController.restoreCategory,
	);
}
