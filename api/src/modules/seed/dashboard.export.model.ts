import { and, desc, eq, gte, lte } from "drizzle-orm";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { db } from "../../drizzle/client";
import { categories, paymentMethods, transactions } from "../../drizzle/schema";
import type {
	ExcelExportRow,
	ExportFilter,
	PdfExportRow,
} from "./dashboard.export.schema";

export class DashboardExportModel {
	async getTransactionsForExport(
		userId: string,
		filters: ExportFilter,
	): Promise<PdfExportRow[]> {
		const startDate = filters.startDate
			? new Date(filters.startDate)
			: undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

		const rows = await db
			.select({
				date: transactions.date,
				description: transactions.description,
				category: categories.name,
				paymentMethod: paymentMethods.name,
				type: transactions.type,
				amount: transactions.amount,
			})
			.from(transactions)
			.leftJoin(categories, eq(transactions.categoryId, categories.id))
			.leftJoin(
				paymentMethods,
				eq(transactions.paymentMethodId, paymentMethods.id),
			)
			.where(
				and(
					eq(transactions.userId, userId),
					filters.type ? eq(transactions.type, filters.type) : undefined,
					filters.categoryId
						? eq(transactions.categoryId, filters.categoryId)
						: undefined,
					startDate ? gte(transactions.date, startDate) : undefined,
					endDate ? lte(transactions.date, endDate) : undefined,
				),
			)
			.orderBy(desc(transactions.date));

		return rows.map((row) => ({
			date: row.date.toLocaleDateString("pt-BR"),
			description: row.description,
			category: row.category || "-",
			type: row.type === "income" ? "Receita" : "Despesa",
			total: Number(row.amount).toLocaleString("pt-BR", {
				style: "currency",
				currency: "BRL",
			}),
		}));
	}

	async exportToExcel(userId: string, filters: ExportFilter): Promise<Buffer> {
		const startDate = filters.startDate
			? new Date(filters.startDate)
			: undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

		const rows = await db
			.select({
				date: transactions.date,
				description: transactions.description,
				category: categories.name,
				paymentMethod: paymentMethods.name,
				type: transactions.type,
				amount: transactions.amount,
			})
			.from(transactions)
			.leftJoin(categories, eq(transactions.categoryId, categories.id))
			.leftJoin(
				paymentMethods,
				eq(transactions.paymentMethodId, paymentMethods.id),
			)
			.where(
				and(
					eq(transactions.userId, userId),
					filters.type ? eq(transactions.type, filters.type) : undefined,
					filters.categoryId
						? eq(transactions.categoryId, filters.categoryId)
						: undefined,
					startDate ? gte(transactions.date, startDate) : undefined,
					endDate ? lte(transactions.date, endDate) : undefined,
				),
			)
			.orderBy(desc(transactions.date));

		const data: ExcelExportRow[] = rows.map((row) => ({
			valor: Number(row.amount).toLocaleString("pt-BR", {
				style: "currency",
				currency: "BRL",
			}),
			descricao: row.description,
			categoria: row.category || "-",
			metodoPagamento: row.paymentMethod || "-",
			tipo: row.type === "income" ? "Receita" : "Despesa",
			data: row.date.toLocaleDateString("pt-BR"),
			total: Number(row.amount),
		}));

		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Transações");

		ws.columns = [
			{ header: "Data", key: "data", width: 12 },
			{ header: "Descrição", key: "descricao", width: 35 },
			{ header: "Categoria", key: "categoria", width: 15 },
			{ header: "Método", key: "metodoPagamento", width: 15 },
			{ header: "Tipo", key: "tipo", width: 10 },
			{ header: "Valor (R$)", key: "valor", width: 14 },
		];

		const headerRow = ws.getRow(1);
		headerRow.font = { bold: true };
		headerRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF2D5FF3" },
		};
		headerRow.alignment = { horizontal: "center" };

		data.forEach((row, idx) => {
			const rowIndex = idx + 2;
			ws.addRow(row);
			const addedRow = ws.getRow(rowIndex);
			addedRow.alignment = { vertical: "middle", horizontal: "left" };
		});

		ws.eachRow((row) => {
			row.eachCell((cell) => {
				cell.border = {
					top: { style: "thin" },
					left: { style: "thin" },
					bottom: { style: "thin" },
					right: { style: "thin" },
				};
			});
		});

		const buffer = await wb.xlsx.writeBuffer();
		return Buffer.from(buffer);
	}

	async exportToPdf(userId: string, filters: ExportFilter): Promise<Buffer> {
		const rows = await this.getTransactionsForExport(userId, filters);

		return new Promise<Buffer>((resolve, reject) => {
			try {
				const doc = new PDFDocument({ size: "A4", margin: 50 });
				const chunks: Buffer[] = [];
				doc.on("data", (chunk: Buffer) => chunks.push(chunk));
				doc.on("end", () => resolve(Buffer.concat(chunks)));

				doc.fontSize(18).text("Relatório de Transações", { align: "center" });
				doc.moveDown(2);

				const startX = 50;
				const rowY = 120;
				const colWidths = [70, 180, 80, 80];

				doc.rect(startX, rowY - 10, 520, 22).fill("#1A2035");
				doc.fillColor("#FFFFFF").fontSize(10);
				doc.text("Data", startX + 5, rowY - 6, { width: colWidths[0] });
				doc.text("Descrição", startX + colWidths[0] + 5, rowY - 6, {
					width: colWidths[1],
				});
				doc.text(
					"Categoria",
					startX + colWidths[0] + colWidths[1] + 10,
					rowY - 6,
					{
						width: colWidths[2],
					},
				);
				doc.text(
					"Valor",
					startX + colWidths[0] + colWidths[1] + colWidths[2] + 15,
					rowY - 6,
					{
						width: colWidths[3],
						align: "right",
					},
				);

				let y = rowY + 20;
				for (const r of rows.slice(0, 25)) {
					doc.fillColor("#000000").fontSize(9);
					doc.text(r.date, startX, y, { width: colWidths[0] });
					doc.text(r.description, startX + colWidths[0] + 5, y, {
						width: colWidths[1],
					});
					doc.text(r.category, startX + colWidths[0] + colWidths[1] + 10, y, {
						width: colWidths[2],
					});
					doc.text(
						r.total,
						startX + colWidths[0] + colWidths[1] + colWidths[2] + 15,
						y,
						{
							width: colWidths[3],
							align: "right",
						},
					);
					y += 16;
				}

				doc.end();
			} catch (e) {
				reject(e);
			}
		});
	}
}

export default new DashboardExportModel();
