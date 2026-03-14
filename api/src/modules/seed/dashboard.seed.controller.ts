import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import DashboardExportModel from "./dashboard.export.model";

export class DashboardSeedController {
	/**
	 * Importa transações a partir de um arquivo Excel
	 */
	async importFromExcel(req: FastifyRequest, reply: FastifyReply) {
		const payload = (req.body as Record<string, unknown>) || {};
		console.log("Received import request with payload:", payload);
		reply.status(501).send({ ok: false, message: "Not implemented yet" });
	}

	private parseFilters(query: unknown): {
		startDate?: string;
		endDate?: string;
	} {
		const q = query as Record<string, string>;
		return {
			startDate: q.startDate,
			endDate: q.endDate,
		};
	}

	/**
	 * Exporta relatório financeiro em formato Excel (.xlsx)
	 *
	 * O relatório inclui:
	 * - Resumo geral (receitas, despesas, saldo)
	 * - Gastos por categoria
	 * - Resumo mensal
	 * - Lista de transações
	 */
	async exportExcel(req: FastifyRequest, reply: FastifyReply) {
		try {
			await req.jwtVerify();
		} catch {
			throw new AppError("Unauthorized", 401);
		}

		const userId = (req.user as { sub: string }).sub;
		const filters = this.parseFilters(req.query);
		const buffer = await DashboardExportModel.exportToExcel(userId, filters);

		reply.type(
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		);
		reply.header(
			"Content-Disposition",
			'attachment; filename="relatorio_financeiro.xlsx"',
		);
		return reply.send(buffer);
	}

	/**
	 * Exporta relatório financeiro em formato PDF
	 *
	 * O relatório inclui:
	 * - Resumo geral (receitas, despesas, saldo)
	 * - Gráfico de pizza por categoria
	 * - Lista de transações
	 */
	async exportPdf(req: FastifyRequest, reply: FastifyReply) {
		try {
			await req.jwtVerify();
		} catch {
			throw new AppError("Unauthorized", 401);
		}

		const userId = (req.user as { sub: string }).sub;
		const filters = this.parseFilters(req.query);
		const buffer = await DashboardExportModel.exportToPdf(userId, filters);

		reply.type("application/pdf");
		reply.header(
			"Content-Disposition",
			'attachment; filename="relatorio_financeiro.pdf"',
		);
		return reply.send(buffer);
	}

	/**
	 * Exporta transações em formato CSV
	 *
	 * O arquivo CSV inclui:
	 * - Resumo geral
	 * - Gastos por categoria
	 * - Resumo mensal
	 * - Lista de transações
	 */
	async exportCsv(req: FastifyRequest, reply: FastifyReply) {
		try {
			await req.jwtVerify();
		} catch {
			throw new AppError("Unauthorized", 401);
		}

		const userId = (req.user as { sub: string }).sub;
		const filters = this.parseFilters(req.query);
		const csvContent = await DashboardExportModel.exportToCsv(userId, filters);

		reply.type("text/csv; charset=utf-8");
		reply.header(
			"Content-Disposition",
			'attachment; filename="transacoes.csv"',
		);
		return reply.send(csvContent);
	}
}

export default new DashboardSeedController();
