import type { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";

export async function registerAuthRoutes(app: FastifyInstance) {
	const authController = new AuthController();

	app.post("/auth/register", authController.register);
	app.post("/auth/login", authController.login);
	app.post("/auth/logout", authController.logout);
	app.get("/auth/me", authController.me);
}
