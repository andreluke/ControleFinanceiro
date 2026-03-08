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

    return reply.status(201).send({ user });
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

    const [errToken, token] = await catchError(
      reply.jwtSign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: "7d" },
      ),
    );
    if (errToken) throw new AppError("Erro ao gerar token", 500);

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
}
