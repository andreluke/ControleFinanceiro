import type { FastifyInstance } from "fastify";
import { CategoriesController } from "./categories.controller";

export async function registerCategoriesRoutes(app: FastifyInstance) {
	const categoriesController = new CategoriesController();

	app.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.get("/categories", categoriesController.listCategories);
	app.post("/categories", categoriesController.createCategory);
	app.put("/categories/:id", categoriesController.updateCategory);
	app.delete("/categories/:id", categoriesController.deleteCategory);
	app.patch("/categories/:id/restore", categoriesController.restoreCategory);
}
