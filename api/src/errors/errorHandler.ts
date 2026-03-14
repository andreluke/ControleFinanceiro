import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { type ZodError, ZodError as ZodErrorType } from "zod";
import { AppError } from "./AppError.js";

const isDevelopment =
	process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const errorMessages: Record<string, string> = {
	DEFAULT: "Algo deu errado. Tente novamente mais tarde.",
	DB_CONNECTION: "Erro de conexão com o banco de dados.",
	DB_QUERY: "Erro ao processar sua solicitação.",
	AUTH_INVALID: "E-mail ou senha incorretos.",
	AUTH_EMAIL_EXISTS: "Este e-mail já está cadastrado.",
	AUTH_UNAUTHORIZED:
		"Você precisa estar autenticado para acessar este recurso.",
	NOT_FOUND: "Registro não encontrado.",
	VALIDATION: "Dados inválidos. Verifique os campos obrigatórios.",
};

function getFriendlyMessage(error: Error): string {
	const message = error.message?.toLowerCase() || "";

	if (message.includes("connection") || message.includes("connect")) {
		return errorMessages.DB_CONNECTION;
	}
	if (message.includes("duplicate") || message.includes("unique")) {
		return errorMessages.AUTH_EMAIL_EXISTS;
	}
	if (message.includes("invalid") && message.includes("credentials")) {
		return errorMessages.AUTH_INVALID;
	}
	if (message.includes("not found")) {
		return errorMessages.NOT_FOUND;
	}

	return errorMessages.DEFAULT;
}

export async function errorHandler(
	error: FastifyError | Error,
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	const err = error as Error;

	if (err.name === "ZodError" || err instanceof ZodErrorType) {
		const zodErr = err as ZodError;
		const firstError = zodErr.errors[0];
		let message = "Dados inválidos.";

		if (firstError) {
			const field = firstError.path.join(".");
			const fieldName = field ? field.replace(/.*\./, "") : "campo";

			if (firstError.code === "invalid_type") {
				message = `O campo "${fieldName}" é obrigatório.`;
			} else if (firstError.code === "invalid_enum_value") {
				const validOptions =
					firstError.options?.join(", ") || "valores válidos";
				message = `Valor inválido para "${fieldName}". Use: ${validOptions}`;
			} else {
				message = firstError.message || "Dados inválidos.";
			}
		}

		return reply.status(400).send({
			statusCode: 400,
			error: "Validation Error",
			message,
			details: isDevelopment ? zodErr.errors : undefined,
		});
	}

	if (error instanceof AppError) {
		const friendlyMessage =
			errorMessages[error.message.toUpperCase().replace(/ /g, "_")] ||
			error.message;
		return reply.status(error.statusCode).send({
			statusCode: error.statusCode,
			error: error.statusCode === 401 ? "Unauthorized" : "Bad Request",
			message: friendlyMessage,
		});
	}

	if (error.validation) {
		return reply.status(400).send({
			statusCode: 400,
			error: "Validation Error",
			message: errorMessages.VALIDATION,
			details: isDevelopment ? error.validation : undefined,
		});
	}

	const statusCode = error.statusCode ?? 500;
	const message = statusCode >= 500 ? errorMessages.DEFAULT : error.message;

	if (isDevelopment) {
		reply.log.error(error);
	}

	return reply.status(statusCode).send({
		statusCode,
		error: statusCode >= 500 ? "Internal Server Error" : "Error",
		message,
	});
}
