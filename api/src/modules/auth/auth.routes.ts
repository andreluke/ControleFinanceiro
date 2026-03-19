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
						email: {
							type: "string",
							format: "email",
							description: "E-mail do usuário",
						},
						password: {
							type: "string",
							minLength: 6,
							description: "Senha do usuário",
						},
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
						email: {
							type: "string",
							format: "email",
							description: "E-mail do usuário",
						},
						password: { type: "string", description: "Senha do usuário" },
						rememberMe: {
							type: "boolean",
							description: "Manter login por 30 dias",
						},
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

	app.put(
		"/auth/me",
		{
			schema: {
				description: "Atualiza os dados do usuário",
				tags: ["Auth"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					properties: {
						name: { type: "string" },
					},
				},
			},
		},
		authController.updateMe,
	);

	app.put(
		"/auth/me/password",
		{
			schema: {
				description: "Altera a senha do usuário",
				tags: ["Auth"],
				security: [{ bearerAuth: [] }],
				body: {
					type: "object",
					required: ["currentPassword", "newPassword"],
					properties: {
						currentPassword: { type: "string" },
						newPassword: { type: "string", minLength: 6 },
					},
				},
			},
		},
		authController.changePassword,
	);

	app.post(
		"/auth/refresh-token",
		{
			schema: {
				description: "Renova o token JWT do usuário",
				tags: ["Auth"],
				security: [{ bearerAuth: [] }],
			},
		},
		authController.refreshToken,
	);
}
