import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./AppError.js";

export async function errorHandler(
	error: FastifyError,
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			statusCode: error.statusCode,
			error: "Bad Request",
			message: error.message,
		});
	}

	if (error.validation) {
		return reply.status(400).send({
			statusCode: 400,
			error: "Validation Error",
			message: error.message,
			details: error.validation,
		});
	}

	const statusCode = error.statusCode ?? 500;
	reply.log.error(error);
	return reply.status(statusCode).send({
		statusCode,
		error: statusCode >= 500 ? "Internal Server Error" : "Error",
		message: statusCode >= 500 ? "An unexpected error occurred" : error.message,
	});
}
