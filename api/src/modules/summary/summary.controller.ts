import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import { catchError } from "../../utils/catchError";
import { SummaryModel } from "./summary.model";
import { forecastQuerySchema, summaryQuerySchema } from "./summary.schema";

export class SummaryController {
	constructor(private readonly summaryModel = new SummaryModel()) {}

	getSummary = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const { month, period } = summaryQuerySchema.parse(request.query);

		const [err, summary] = await catchError(
			this.summaryModel.getSummary(userId, { month, period }),
		);
		if (err) throw new AppError("Erro ao obter resumo", 500);

		return reply.send(summary);
	};

	getMonthlySummary = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };

		const [err, monthly] = await catchError(
			this.summaryModel.getMonthlySummary(userId),
		);
		if (err) throw new AppError("Erro ao obter resumo mensal", 500);

		return reply.send(monthly);
	};

	getByCategorySummary = async (
		request: FastifyRequest,
		reply: FastifyReply,
	) => {
		const { sub: userId } = request.user as { sub: string };
		const { month, period, type } = summaryQuerySchema.parse(request.query);

		const [err, byCategory] = await catchError(
			this.summaryModel.getByCategorySummary(userId, { month, period, type }),
		);
		if (err) throw new AppError("Erro ao obter resumo por categoria", 500);

		return reply.send(byCategory);
	};

	getForecast = async (request: FastifyRequest, reply: FastifyReply) => {
		const { sub: userId } = request.user as { sub: string };
		const { month, year } = forecastQuerySchema.parse(request.query);

		const [err, forecast] = await catchError(
			this.summaryModel.getForecast(userId, month, year),
		);
		if (err) throw new AppError("Erro ao obter previsão", 500);

		return reply.send(forecast);
	};
}
