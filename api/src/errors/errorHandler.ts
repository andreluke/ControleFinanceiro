import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { type ZodError, ZodError as ZodErrorType } from "zod";
import { AppError } from "./AppError.js";

// ─── Config ────────────────────────────────────────────────────────────────

const isDevelopment =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

// ─── Error Messages ─────────────────────────────────────────────────────────

const ERROR_MESSAGES = {
  DEFAULT: "Algo deu errado. Tente novamente mais tarde.",
  DB_CONNECTION: "Erro de conexão com o banco de dados.",
  DB_QUERY: "Erro ao processar sua solicitação.",
  AUTH_INVALID: "E-mail ou senha incorretos.",
  AUTH_EMAIL_EXISTS: "Este e-mail já está cadastrado.",
  AUTH_UNAUTHORIZED:
    "Você precisa estar autenticado para acessar este recurso.",
  NOT_FOUND: "Registro não encontrado.",
  VALIDATION: "Dados inválidos. Verifique os campos obrigatórios.",
} as const;

type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveAppErrorMessage(message: string): string {
  const key = message.toUpperCase().replace(/ /g, "_") as ErrorMessageKey;
  return ERROR_MESSAGES[key] ?? message;
}

function resolveHttpErrorLabel(statusCode: number): string {
  if (statusCode === 401) return "Unauthorized";
  if (statusCode >= 500) return "Internal Server Error";
  if (statusCode >= 400) return "Bad Request";
  return "Error";
}

function buildZodMessage(error: ZodError): string {
  const first = error.errors[0];
  if (!first) return "Dados inválidos.";

  const field =
    first.path.length > 0
      ? (first.path[first.path.length - 1]?.toString() ?? "campo")
      : "campo";

  switch (first.code) {
    case "invalid_type":
      return `O campo "${field}" é obrigatório.`;
    case "invalid_enum_value":
      return `Valor inválido para "${field}". Use: ${first.options?.join(", ") ?? "valores válidos"}`;
    default:
      return first.message || "Dados inválidos.";
  }
}

// ─── Response Builders ───────────────────────────────────────────────────────

function sendZodError(reply: FastifyReply, error: ZodError) {
  return reply.status(400).send({
    statusCode: 400,
    error: "Validation Error",
    message: buildZodMessage(error),
    ...(isDevelopment && { details: error.errors }),
  });
}

function sendAppError(reply: FastifyReply, error: AppError) {
  return reply.status(error.statusCode).send({
    statusCode: error.statusCode,
    error: resolveHttpErrorLabel(error.statusCode),
    message: resolveAppErrorMessage(error.message),
  });
}

function sendFastifyValidationError(reply: FastifyReply, error: FastifyError) {
  return reply.status(400).send({
    statusCode: 400,
    error: "Validation Error",
    message: ERROR_MESSAGES.VALIDATION,
    ...(isDevelopment && { details: error.validation }),
  });
}

function sendGenericError(reply: FastifyReply, error: FastifyError) {
  const statusCode = error.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  if (isDevelopment) reply.log.error(error);

  return reply.status(statusCode).send({
    statusCode,
    error: resolveHttpErrorLabel(statusCode),
    message: isServerError ? ERROR_MESSAGES.DEFAULT : error.message,
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodErrorType || error.name === "ZodError") {
    return sendZodError(reply, error as ZodError);
  }

  if (error instanceof AppError) {
    return sendAppError(reply, error);
  }

  const fastifyError = error as FastifyError;

  if (fastifyError.validation) {
    return sendFastifyValidationError(reply, fastifyError);
  }

  return sendGenericError(reply, fastifyError);
}
