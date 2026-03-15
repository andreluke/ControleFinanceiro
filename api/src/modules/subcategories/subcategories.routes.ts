import type { FastifyInstance } from "fastify";
import { SubcategoriesController } from "./subcategories.controller";

const PUBLIC_ROUTES = ["/health", "/docs"];

export async function registerSubcategoriesRoutes(app: FastifyInstance) {
	const controller = new SubcategoriesController();

	app.addHook("onRequest", async (request, reply) => {
		const path = request.url.split("?")[0];
		const isPublicRoute = PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
		if (isPublicRoute) return;

		// Only apply JWT verification to /subcategories routes
		if (!path.startsWith("/subcategories")) return;

		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get(
		"/subcategories",
		{
			schema: {
				description: "Lista subcategorias do usuário",
				tags: ["Subcategories"],
				security: [{ bearerAuth: [] }],
				querystring: {
					type: "object",
					properties: {
						categoryId: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.list,
	);

	app.post(
		"/subcategories",
		{
			schema: {
				description: "Cria uma nova subcategoria",
				tags: ["Subcategories"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					required: ["name", "categoryId"],
					properties: {
						name: { type: "string" },
						color: { type: "string" },
						icon: { type: "string" },
						categoryId: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.create,
	);

	app.put(
		"/subcategories/:id",
		{
			schema: {
				description: "Atualiza uma subcategoria",
				tags: ["Subcategories"],
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
						categoryId: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.update,
	);

	app.delete(
		"/subcategories/:id",
		{
			schema: {
				description: "Soft delete de uma subcategoria",
				tags: ["Subcategories"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.delete,
	);

	app.patch(
		"/subcategories/:id/restore",
		{
			schema: {
				description: "Restaura uma subcategoria deletada",
				tags: ["Subcategories"],
				security: [{ bearerAuth: [] }],
				params: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
					},
				},
			},
		},
		controller.restore,
	);
}
