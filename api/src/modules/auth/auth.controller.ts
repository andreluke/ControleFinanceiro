import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { AuthModel } from "./auth.model";
import { loginSchema, registerSchema } from "./auth.schema";

export class AuthController {
	constructor(private readonly authModel = new AuthModel()) {}

	register = async (request: FastifyRequest, reply: FastifyReply) => {
		const body = registerSchema.parse(request.body);

		const [errExisting, existing] = await catchError(
			this.authModel.findByEmail(body.email),
		);
		if (errExisting) throw new AppError("Erro ao verificar email", 500);

		if (existing) {
			throw new AppError("E-mail já cadastrado", 409);
		}

		const [errCreate, user] = await catchError(this.authModel.createUser(body));
		if (errCreate || !user) throw new AppError("Erro ao criar usuário", 500);

		const expiresIn = "7d";

		const [errToken, token] = await catchError(
			reply.jwtSign(
				{
					sub: user.id,
					email: user.email,
				},
				{ expiresIn },
			),
		);
		if (errToken) throw new AppError("Erro ao gerar token", 500);

		reply.setCookie("token", token, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60,
		});

		return reply.status(201).send({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	};

	login = async (request: FastifyRequest, reply: FastifyReply) => {
		const body = loginSchema.parse(request.body);

		const [errUser, user] = await catchError(
			this.authModel.findByEmail(body.email),
		);
		if (errUser) throw new AppError("Erro ao buscar usuário", 500);
		if (!user) {
			throw new AppError("Credenciais inválidas", 401);
		}

		const [errValid, isValid] = await catchError(
			this.authModel.verifyPassword(body.password, user.password),
		);
		if (errValid) throw new AppError("Erro ao verificar senha", 500);
		if (!isValid) {
			throw new AppError("Credenciais inválidas", 401);
		}

		const expiresIn = body.rememberMe ? "30d" : "24h";

		const [errToken, token] = await catchError(
			reply.jwtSign(
				{
					sub: user.id,
					email: user.email,
				},
				{ expiresIn },
			),
		);
		if (errToken) throw new AppError("Erro ao gerar token", 500);

		reply.setCookie("token", token, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: body.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
		});

		return reply.send({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	};

	me = async (request: FastifyRequest, reply: FastifyReply) => {
		await catchError(request.jwtVerify());

		const { sub } = request.user as { sub: string };
		const [errUser, user] = await catchError(this.authModel.findById(sub));
		if (errUser) throw new AppError("Erro ao buscar dados do usuário", 500);

		if (!user) {
			throw new AppError("Usuário não encontrado", 404);
		}

		return reply.send({ user });
	};

	logout = async (_request: FastifyRequest, reply: FastifyReply) => {
		reply.clearCookie("token", { path: "/" });
		return reply.send({ message: "Logout realizado" });
	};

	updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
		await catchError(request.jwtVerify());

		const { sub } = request.user as { sub: string };
		const body = request.body as { name?: string };

		if (!body.name) {
			throw new AppError("Nome é obrigatório", 400);
		}

		const [err, user] = await catchError(
			this.authModel.updateName(sub, body.name),
		);
		if (err) throw new AppError("Erro ao atualizar perfil", 500);

		return reply.send({ user });
	};

	changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
		await catchError(request.jwtVerify());

		const { sub } = request.user as { sub: string };
		const body = request.body as {
			currentPassword: string;
			newPassword: string;
		};

		const [errUser, user] = await catchError(
			this.authModel.findByIdWithPassword(sub),
		);
		if (errUser || !user) throw new AppError("Usuário não encontrado", 404);

		const [errVerify, isValid] = await catchError(
			this.authModel.verifyPassword(body.currentPassword, user.password),
		);
		if (errVerify) throw new AppError("Erro ao verificar senha", 500);
		if (!isValid) {
			throw new AppError("Senha atual incorreta", 401);
		}

		const [errUpdate] = await catchError(
			this.authModel.updatePassword(sub, body.newPassword),
		);
		if (errUpdate) throw new AppError("Erro ao alterar senha", 500);

		return reply.send({ message: "Senha alterada com sucesso" });
	};

	refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
		await catchError(request.jwtVerify());

		const { sub, email } = request.user as { sub: string; email: string };

		const [errToken, token] = await catchError(
			reply.jwtSign({ sub, email }, { expiresIn: "7d" }),
		);
		if (errToken) throw new AppError("Erro ao gerar token", 500);

		reply.setCookie("token", token, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60,
		});

		return reply.send({ token });
	};
}
