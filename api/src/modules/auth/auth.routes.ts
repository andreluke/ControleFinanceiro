import type { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";

export async function registerAuthRoutes(app: FastifyInstance) {
	const authController = new AuthController();

	app.post(
		"/auth/register",
		{
			schema: {
				description: "Registra um novo usuário",
				tags: ["Auth"],
				body: {
					type: "object",
					required: ["name", "email", "password"],
					properties: {
						name: { type: "string", description: "Nome do usuário" },
						email: { type: "string", format: "email", description: "E-mail do usuário" },
						password: { type: "string", minLength: 6, description: "Senha do usuário" },
					},
				},
			},
		},
		authController.register,
	);

	app.post(
		"/auth/login",
		{
			schema: {
				description: "Autentica um usuário e retorna o token JWT",
				tags: ["Auth"],
				body: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email", description: "E-mail do usuário" },
						password: { type: "string", description: "Senha do usuário" },
						rememberMe: { type: "boolean", description: "Manter login por 30 dias" },
					},
				},
			},
		},
		authController.login,
	);

	app.post(
		"/auth/logout",
		{
			schema: {
				description: "Realiza logout do usuário",
				tags: ["Auth"],
			},
		},
		authController.logout,
	);

	app.get(
		"/auth/me",
		{
			schema: {
				description: "Retorna os dados do usuário autenticado",
				tags: ["Auth"],
				security: [{ bearerAuth: [] }],
			},
		},
		authController.me,
	);
}
