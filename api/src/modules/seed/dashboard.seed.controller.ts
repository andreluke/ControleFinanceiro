import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../errors/AppError";
import DashboardExportModel from "./dashboard.export.model";
import { exportFilterSchema } from "./dashboard.export.schema";

export class DashboardSeedController {
	async importFromExcel(req: FastifyRequest, reply: FastifyReply) {
		const payload = (req.body as Record<string, unknown>) || {};
		const rows = Array.isArray(payload.rows) ? payload.rows : [];
		console.log("Received rows for import:", rows);
		reply.status(501).send({ ok: false, message: "Not implemented yet" });
	}

	async exportExcel(req: FastifyRequest, reply: FastifyReply) {
		try {
			await req.jwtVerify();
		} catch {
			throw new AppError("Unauthorized", 401);
		}

		const userId = (req.user as { sub: string }).sub;
		const filters = exportFilterSchema.parse(req.query);
		const buffer = await DashboardExportModel.exportToExcel(userId, filters);

		reply.type(
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		);
		reply.header(
			"Content-Disposition",
			'attachment; filename="transacoes.xlsx"',
		);
		return reply.send(buffer);
	}

	async exportPdf(req: FastifyRequest, reply: FastifyReply) {
		try {
			await req.jwtVerify();
		} catch {
			throw new AppError("Unauthorized", 401);
		}

		const userId = (req.user as { sub: string }).sub;
		const filters = exportFilterSchema.parse(req.query);
		const buffer = await DashboardExportModel.exportToPdf(userId, filters);

		reply.type("application/pdf");
		reply.header(
			"Content-Disposition",
			'attachment; filename="transacoes.pdf"',
		);
		return reply.send(buffer);
	}
}

export default new DashboardSeedController();
