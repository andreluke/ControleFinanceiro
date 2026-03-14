import { and, desc, eq, gte, lte } from "drizzle-orm";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { db } from "../../drizzle/client";
import { categories, paymentMethods, transactions } from "../../drizzle/schema";
import type {
	CategorySummary,
	DashboardSummary,
	ExportFilter,
	MonthlySummary,
	TransactionRow,
} from "./dashboard.export.schema";

const DEFAULT_COLOR = "FF607D8B";
export class DashboardExportModel {
	private getDateRange(filters: ExportFilter) {
		const startDate = filters.startDate
			? new Date(`${filters.startDate}T00:00:00`)
			: undefined;
		const endDate = filters.endDate
			? new Date(`${filters.endDate}T23:59:59`)
			: undefined;
		return { startDate, endDate };
	}

	private async getCategoryColors(
		userId: string,
	): Promise<Map<string, string>> {
		const userCategories = await db
			.select({
				name: categories.name,
				color: categories.color,
			})
			.from(categories)
			.where(eq(categories.userId, userId));

		const colorMap = new Map<string, string>();
		for (const cat of userCategories) {
			const hexColor = cat.color.replace("#", "");
			colorMap.set(cat.name, `FF${hexColor.toUpperCase()}`);
		}
		return colorMap;
	}

	async getTransactions(userId: string, filters: ExportFilter) {
		const { startDate, endDate } = this.getDateRange(filters);

		const rows = await db
			.select({
				date: transactions.date,
				description: transactions.description,
				category: categories.name,
				categoryId: transactions.categoryId,
				categoryColor: categories.color,
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

		return rows;
	}

	async getSummary(
		userId: string,
		filters: ExportFilter,
	): Promise<DashboardSummary> {
		const rawTransactions = await this.getTransactions(userId, filters);
		const categoryColors = await this.getCategoryColors(userId);

		const transactionsData: TransactionRow[] = rawTransactions.map((row) => {
			const categoryName = row.category || "Sem Categoria";
			const categoryColor = row.categoryColor
				? `FF${row.categoryColor.replace("#", "").toUpperCase()}`
				: categoryColors.get(categoryName) || DEFAULT_COLOR;

			return {
				date: row.date.toISOString(),
				description: row.description,
				category: categoryName,
				categoryColor,
				paymentMethod: row.paymentMethod || "-",
				type: row.type,
				amount: Number(row.amount),
			};
		});

		const totalIncome = transactionsData
			.filter((t) => t.type === "income")
			.reduce((sum, t) => sum + t.amount, 0);

		const totalExpense = transactionsData
			.filter((t) => t.type === "expense")
			.reduce((sum, t) => sum + t.amount, 0);

		const categoryMap = new Map<string, { total: number; color: string }>();
		for (const t of transactionsData) {
			if (t.type === "expense") {
				const current = categoryMap.get(t.category) || {
					total: 0,
					color: DEFAULT_COLOR,
				};
				categoryMap.set(t.category, {
					total: current.total + t.amount,
					color: t.categoryColor || current.color,
				});
			}
		}

		const byCategory: CategorySummary[] = Array.from(categoryMap.entries())
			.map(([category, data]) => ({
				category,
				categoryColor: data.color,
				total: data.total,
				percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
			}))
			.sort((a, b) => b.total - a.total);

		const monthlyMap = new Map<string, { income: number; expense: number }>();
		for (const t of transactionsData) {
			const monthKey = t.date.slice(0, 7);
			const current = monthlyMap.get(monthKey) || { income: 0, expense: 0 };
			if (t.type === "income") {
				current.income += t.amount;
			} else {
				current.expense += t.amount;
			}
			monthlyMap.set(monthKey, current);
		}

		const byMonth: MonthlySummary[] = Array.from(monthlyMap.entries())
			.map(([month, data]) => ({
				month,
				income: data.income,
				expense: data.expense,
				balance: data.income - data.expense,
			}))
			.sort((a, b) => a.month.localeCompare(b.month));

		return {
			totalIncome,
			totalExpense,
			balance: totalIncome - totalExpense,
			byCategory,
			byMonth,
			transactionCount: transactionsData.length,
		};
	}

	formatCurrency(value: number): string {
		return value.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("pt-BR");
	}

	private escapeCsvField(field: string): string {
		if (field.includes(";") || field.includes('"') || field.includes("\n")) {
			return `"${field.replace(/"/g, '""')}"`;
		}
		return field;
	}

	async exportToCsv(userId: string, filters: ExportFilter): Promise<string> {
		const rawTransactions = await this.getTransactions(userId, filters);
		const summary = await this.getSummary(userId, filters);

		const lines: string[] = [];

		lines.push("RELATÓRIO FINANCEIRO");
		lines.push("");
		lines.push("RESUMO GERAL");
		lines.push(`Total de Receitas;${this.formatCurrency(summary.totalIncome)}`);
		lines.push(
			`Total de Despesas;${this.formatCurrency(summary.totalExpense)}`,
		);
		lines.push(`Saldo;${this.formatCurrency(summary.balance)}`);
		lines.push(`Total de Transações;${summary.transactionCount}`);
		lines.push("");
		lines.push("");

		lines.push("GASTOS POR CATEGORIA");
		lines.push("Categoria;Valor;Percentual");
		for (const cat of summary.byCategory) {
			lines.push(
				`${cat.category};${this.formatCurrency(cat.total)};${cat.percentage.toFixed(1)}%`,
			);
		}
		lines.push("");
		lines.push("");

		lines.push("RESUMO MENSAL");
		lines.push("Mês;Receitas;Despesas;Saldo");
		for (const m of summary.byMonth) {
			lines.push(
				`${m.month};${this.formatCurrency(m.income)};${this.formatCurrency(m.expense)};${this.formatCurrency(m.balance)}`,
			);
		}
		lines.push("");
		lines.push("");

		lines.push("TRANSAÇÕES");
		lines.push("Data;Descrição;Categoria;Método de Pagamento;Tipo;Valor");
		for (const row of rawTransactions) {
			lines.push(
				`${this.formatDate(row.date.toISOString())};${this.escapeCsvField(row.description)};${row.category || "-"};${row.paymentMethod || "-"};${row.type === "income" ? "Receita" : "Despesa"};${this.formatCurrency(Number(row.amount))}`,
			);
		}

		const bom = "\uFEFF";
		return bom + lines.join("\r\n");
	}

	async exportToExcel(userId: string, filters: ExportFilter): Promise<Buffer> {
		const rawTransactions = await this.getTransactions(userId, filters);
		const summary = await this.getSummary(userId, filters);

		const transactionsData: TransactionRow[] = rawTransactions.map((row) => {
			const categoryName = row.category || "Sem Categoria";
			const categoryColor = row.categoryColor
				? `FF${row.categoryColor.replace("#", "").toUpperCase()}`
				: DEFAULT_COLOR;

			return {
				date: row.date.toISOString(),
				description: row.description,
				category: categoryName,
				categoryColor,
				paymentMethod: row.paymentMethod || "-",
				type: row.type,
				amount: Number(row.amount),
			};
		});

		const wb = new ExcelJS.Workbook();
		wb.creator = "FinanceApp";
		wb.created = new Date();

		this.createDashboardSheet(wb, summary);
		this.createTransactionsSheet(wb, transactionsData);
		this.createCategorySheet(wb, summary.byCategory);
		this.createMonthlySheet(wb, summary.byMonth);

		const buffer = await wb.xlsx.writeBuffer();
		return Buffer.from(buffer);
	}

	private createDashboardSheet(
		wb: ExcelJS.Workbook,
		summary: DashboardSummary,
	) {
		const ws = wb.addWorksheet("Dashboard", {
			properties: { tabColor: { argb: "FF2D5FF3" } },
		});

		ws.mergeCells("A1:F1");
		ws.getCell("A1").value = "RELATÓRIO FINANCEIRO";
		ws.getCell("A1").font = {
			bold: true,
			size: 16,
			color: { argb: "FFFFFFFF" },
		};
		ws.getCell("A1").fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF2D5FF3" },
		};
		ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
		ws.getRow(1).height = 30;

		ws.mergeCells("A3:B3");
		ws.getCell("A3").value = "RESUMO GERAL";
		ws.getCell("A3").font = {
			bold: true,
			size: 14,
			color: { argb: "FF1A2035" },
		};

		const summaryBoxes = [
			{
				label: "Receitas",
				value: summary.totalIncome,
				row: 4,
				col: "A",
				color: "FF4CAF50",
			},
			{
				label: "Despesas",
				value: summary.totalExpense,
				row: 4,
				col: "C",
				color: "FFF44336",
			},
			{
				label: "Saldo",
				value: summary.balance,
				row: 4,
				col: "E",
				color: summary.balance >= 0 ? "FF4CAF50" : "FFF44336",
			},
		];

		for (const box of summaryBoxes) {
			const cellRef = `${box.col}${box.row}`;
			ws.getCell(cellRef).value = box.label;
			ws.getCell(cellRef).font = { bold: true, size: 11 };
			ws.getCell(cellRef).alignment = { horizontal: "center" };
			ws.getCell(cellRef).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: box.color },
			};

			const valueRef = `${box.col}${box.row + 1}`;
			ws.getCell(valueRef).value = this.formatCurrency(box.value);
			ws.getCell(valueRef).font = { bold: true, size: 14 };
			ws.getCell(valueRef).alignment = { horizontal: "center" };
			ws.getCell(valueRef).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFF5F5F5" },
			};

			ws.getCell(cellRef).border = {
				top: { style: "thin", color: { argb: "FFDDDDDD" } },
				left: { style: "thin", color: { argb: "FFDDDDDD" } },
				bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
				right: { style: "thin", color: { argb: "FFDDDDDD" } },
			};
			ws.getCell(valueRef).border = {
				top: { style: "thin", color: { argb: "FFDDDDDD" } },
				left: { style: "thin", color: { argb: "FFDDDDDD" } },
				bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
				right: { style: "thin", color: { argb: "FFDDDDDD" } },
			};
		}

		ws.getColumn("A").width = 18;
		ws.getColumn("B").width = 10;
		ws.getColumn("C").width = 18;
		ws.getColumn("D").width = 10;
		ws.getColumn("E").width = 18;
		ws.getColumn("F").width = 10;

		const catStartRow = 8;
		ws.mergeCells(`A${catStartRow}:C${catStartRow}`);
		ws.getCell(`A${catStartRow}`).value = "GASTOS POR CATEGORIA";
		ws.getCell(`A${catStartRow}`).font = {
			bold: true,
			size: 12,
			color: { argb: "FF1A2035" },
		};

		const catHeaders = ["Categoria", "Valor", "%"];
		catHeaders.forEach((header, idx) => {
			const cell = ws.getCell(
				`${String.fromCharCode(65 + idx)}${catStartRow + 1}`,
			);
			cell.value = header;
			cell.font = { bold: true };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFE0E0E0" },
			};
			cell.alignment = { horizontal: "center" };
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		});

		summary.byCategory.forEach((cat, idx) => {
			const rowNum = catStartRow + 2 + idx;

			const catCell = ws.getCell(`A${rowNum}`);
			catCell.value = cat.category;
			catCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: cat.categoryColor },
			};
			catCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};

			const valueCell = ws.getCell(`B${rowNum}`);
			valueCell.value = cat.total;
			valueCell.numFmt = "R$ #,##0.00";
			valueCell.alignment = { horizontal: "right" };
			valueCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};

			const pctCell = ws.getCell(`C${rowNum}`);
			pctCell.value = cat.percentage / 100;
			pctCell.numFmt = "0.0%";
			pctCell.alignment = { horizontal: "center" };
			pctCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		});

		const monthStartRow = catStartRow + summary.byCategory.length + 4;
		ws.mergeCells(`A${monthStartRow}:D${monthStartRow}`);
		ws.getCell(`A${monthStartRow}`).value = "RESUMO MENSAL";
		ws.getCell(`A${monthStartRow}`).font = {
			bold: true,
			size: 12,
			color: { argb: "FF1A2035" },
		};

		const monthHeaders = ["Mês", "Receitas", "Despesas", "Saldo"];
		monthHeaders.forEach((header, idx) => {
			const cell = ws.getCell(
				`${String.fromCharCode(65 + idx)}${monthStartRow + 1}`,
			);
			cell.value = header;
			cell.font = { bold: true };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFE0E0E0" },
			};
			cell.alignment = { horizontal: "center" };
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		});

		summary.byMonth.forEach((m, idx) => {
			const rowNum = monthStartRow + 2 + idx;

			const monthCell = ws.getCell(`A${rowNum}`);
			monthCell.value = m.month;
			monthCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};

			const incomeCell = ws.getCell(`B${rowNum}`);
			incomeCell.value = m.income;
			incomeCell.numFmt = "R$ #,##0.00";
			incomeCell.font = { color: { argb: "FF4CAF50" } };
			incomeCell.alignment = { horizontal: "right" };
			incomeCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};

			const expenseCell = ws.getCell(`C${rowNum}`);
			expenseCell.value = m.expense;
			expenseCell.numFmt = "R$ #,##0.00";
			expenseCell.font = { color: { argb: "FFF44336" } };
			expenseCell.alignment = { horizontal: "right" };
			expenseCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};

			const balanceCell = ws.getCell(`D${rowNum}`);
			balanceCell.value = m.balance;
			balanceCell.numFmt = "R$ #,##0.00";
			balanceCell.font = {
				color: { argb: m.balance >= 0 ? "FF4CAF50" : "FFF44336" },
				bold: true,
			};
			balanceCell.alignment = { horizontal: "right" };
			balanceCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		});
	}

	private createTransactionsSheet(
		wb: ExcelJS.Workbook,
		transactions: TransactionRow[],
	) {
		const ws = wb.addWorksheet("Transações", {
			properties: { tabColor: { argb: "FF4CAF50" } },
		});

		ws.columns = [
			{ header: "Data", key: "data", width: 12 },
			{ header: "Descrição", key: "descricao", width: 35 },
			{ header: "Categoria", key: "categoria", width: 18 },
			{ header: "Método", key: "metodo", width: 15 },
			{ header: "Tipo", key: "tipo", width: 10 },
			{ header: "Valor", key: "valor", width: 14 },
		];

		const headerRow = ws.getRow(1);
		headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
		headerRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF1A2035" },
		};
		headerRow.alignment = { horizontal: "center", vertical: "middle" };
		headerRow.height = 25;

		transactions.forEach((t, idx) => {
			const rowNum = idx + 2;
			ws.addRow({
				data: this.formatDate(t.date),
				descricao: t.description,
				categoria: t.category,
				metodo: t.paymentMethod,
				tipo: t.type === "income" ? "Receita" : "Despesa",
				valor: t.amount,
			});

			const row = ws.getRow(rowNum);
			row.height = 20;

			const catCell = ws.getCell(`C${rowNum}`);
			catCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: t.categoryColor },
			};

			const valueCell = ws.getCell(`F${rowNum}`);
			valueCell.numFmt = "R$ #,##0.00";
			valueCell.font = {
				color: { argb: t.type === "income" ? "FF4CAF50" : "FFF44336" },
				bold: true,
			};
			valueCell.alignment = { horizontal: "right" };

			const tipoCell = ws.getCell(`E${rowNum}`);
			tipoCell.font = {
				color: { argb: t.type === "income" ? "FF4CAF50" : "FFF44336" },
			};
			tipoCell.alignment = { horizontal: "center" };

			row.eachCell((cell) => {
				cell.border = {
					top: { style: "thin", color: { argb: "FFDDDDDD" } },
					left: { style: "thin", color: { argb: "FFDDDDDD" } },
					bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
					right: { style: "thin", color: { argb: "FFDDDDDD" } },
				};
			});

			if (idx % 2 === 1) {
				row.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFFAFAFA" },
				};
			}
		});
	}

	private createCategorySheet(
		wb: ExcelJS.Workbook,
		byCategory: CategorySummary[],
	) {
		const ws = wb.addWorksheet("Por Categoria", {
			properties: { tabColor: { argb: "FFFF9800" } },
		});

		ws.columns = [
			{ header: "Categoria", key: "categoria", width: 25 },
			{ header: "Cor", key: "cor", width: 10 },
			{ header: "Valor", key: "total", width: 15 },
			{ header: "Percentual", key: "percentual", width: 15 },
		];

		const headerRow = ws.getRow(1);
		headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
		headerRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFF9800" },
		};
		headerRow.alignment = { horizontal: "center" };

		for (const cat of byCategory) {
			const row = ws.addRow({
				categoria: cat.category,
				cor: "",
				total: cat.total,
				percentual: cat.percentage / 100,
			});

			const colorCell = row.getCell(2);
			colorCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: cat.categoryColor },
			};

			row.getCell(3).numFmt = "R$ #,##0.00";
			row.getCell(4).numFmt = "0.0%";
		}
	}

	private createMonthlySheet(wb: ExcelJS.Workbook, byMonth: MonthlySummary[]) {
		const ws = wb.addWorksheet("Por Mês", {
			properties: { tabColor: { argb: "FF00BCD4" } },
		});

		ws.columns = [
			{ header: "Mês", key: "mes", width: 12 },
			{ header: "Receitas", key: "receitas", width: 15 },
			{ header: "Despesas", key: "despesas", width: 15 },
			{ header: "Saldo", key: "saldo", width: 15 },
		];

		const headerRow = ws.getRow(1);
		headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
		headerRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF00BCD4" },
		};
		headerRow.alignment = { horizontal: "center" };

		for (const m of byMonth) {
			const row = ws.addRow({
				mes: m.month,
				receitas: m.income,
				despesas: m.expense,
				saldo: m.balance,
			});

			row.getCell(2).numFmt = "R$ #,##0.00";
			row.getCell(3).numFmt = "R$ #,##0.00";
			row.getCell(4).numFmt = "R$ #,##0.00";
		}
	}

	async exportToPdf(userId: string, filters: ExportFilter): Promise<Buffer> {
		const rawTransactions = await this.getTransactions(userId, filters);
		const summary = await this.getSummary(userId, filters);

		const transactionsData: TransactionRow[] = rawTransactions.map((row) => {
			const categoryName = row.category || "Sem Categoria";
			const categoryColor = row.categoryColor
				? `FF${row.categoryColor.replace("#", "").toUpperCase()}`
				: DEFAULT_COLOR;

			return {
				date: row.date.toISOString(),
				description: row.description,
				category: categoryName,
				categoryColor,
				paymentMethod: row.paymentMethod || "-",
				type: row.type,
				amount: Number(row.amount),
			};
		});

		return new Promise<Buffer>((resolve, reject) => {
			try {
				const doc = new PDFDocument({ size: "A4", margin: 40 });
				const chunks: Buffer[] = [];
				doc.on("data", (chunk: Buffer) => chunks.push(chunk));
				doc.on("end", () => resolve(Buffer.concat(chunks)));

				this.renderPdfHeader(doc, "Relatório Financeiro");
				this.renderPdfSummary(doc, summary);
				this.renderPdfCategoryChart(doc, summary.byCategory);

				doc.addPage();
				this.renderPdfHeader(doc, "Transações");
				this.renderPdfTransactions(doc, transactionsData.slice(0, 20));

				doc.end();
			} catch (e) {
				reject(e);
			}
		});
	}

	private renderPdfHeader(doc: PDFKit.PDFDocument, title: string) {
		doc.fontSize(20).fillColor("#1A2035").text(title, { align: "center" });
		doc.moveDown(0.5);
		doc
			.fontSize(10)
			.fillColor("#666666")
			.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, {
				align: "center",
			});
		doc.moveDown(2);
	}

	private renderPdfSummary(doc: PDFKit.PDFDocument, summary: DashboardSummary) {
		doc
			.fontSize(14)
			.fillColor("#1A2035")
			.text("Resumo Geral", { underline: true });
		doc.moveDown(1);

		const boxWidth = 160;
		const boxHeight = 60;
		const startX = 40;
		const gap = 10;

		const boxes = [
			{
				label: "Receitas",
				value: this.formatCurrency(summary.totalIncome),
				color: "#4CAF50",
			},
			{
				label: "Despesas",
				value: this.formatCurrency(summary.totalExpense),
				color: "#F44336",
			},
			{
				label: "Saldo",
				value: this.formatCurrency(summary.balance),
				color: summary.balance >= 0 ? "#4CAF50" : "#F44336",
			},
		];

		boxes.forEach((box, idx) => {
			const x = startX + idx * (boxWidth + gap);
			doc.rect(x, doc.y, boxWidth, boxHeight).fill("#F5F5F5");
			doc
				.fontSize(10)
				.fillColor("#666666")
				.text(box.label, x + 10, doc.y + 10, { width: boxWidth - 20 });
			doc
				.fontSize(16)
				.fillColor(box.color)
				.text(box.value, x + 10, doc.y + 5, { width: boxWidth - 20 });
		});

		doc.moveDown(4);
		doc
			.fontSize(10)
			.fillColor("#666666")
			.text(`Total de transações: ${summary.transactionCount}`);
		doc.moveDown(2);
	}

	private renderPdfCategoryChart(
		doc: PDFKit.PDFDocument,
		categories: CategorySummary[],
	) {
		doc
			.fontSize(14)
			.fillColor("#1A2035")
			.text("Gastos por Categoria", { underline: true });
		doc.moveDown(1);

		const chartWidth = 200;
		const chartHeight = 150;
		const legendX = 260;
		const startY = doc.y;

		doc.rect(40, startY, chartWidth, chartHeight).fill("#F5F5F5");

		let currentAngle = 0;
		const centerX = 40 + chartWidth / 2;
		const centerY = startY + chartHeight / 2;
		const radius = 50;

		const total = categories.reduce((sum, c) => sum + c.total, 0);

		for (const cat of categories) {
			if (cat.total > 0) {
				const sliceAngle = (cat.total / total) * 2 * Math.PI;

				doc.fillColor(`#${cat.categoryColor}`);
				doc.circle(centerX, centerY, radius).fill();

				doc.fillColor("#FFFFFF");
				doc
					.fontSize(8)
					.text(
						`${cat.category}\n${cat.percentage.toFixed(1)}%`,
						centerX - 30,
						centerY - 10,
						{ width: 60, align: "center" },
					);

				currentAngle += sliceAngle;
			}
		}

		doc.y = startY;
		for (let idx = 0; idx < Math.min(categories.length, 6); idx++) {
			const cat = categories[idx];
			const legendY = startY + 10 + idx * 20;
			doc
				.fillColor(`#${cat.categoryColor}`)
				.rect(legendX, legendY, 12, 12)
				.fill();
			doc
				.fontSize(9)
				.fillColor("#333333")
				.text(
					`${cat.category}: ${this.formatCurrency(cat.total)}`,
					legendX + 18,
					legendY,
				);
		}

		doc.moveDown(10);
	}

	private renderPdfTransactions(
		doc: PDFKit.PDFDocument,
		transactions: TransactionRow[],
	) {
		const tableTop = doc.y;
		const colWidths = [70, 180, 80, 80];
		const rowHeight = 20;

		doc.rect(40, tableTop - 5, 510, rowHeight).fill("#1A2035");
		doc.fillColor("#FFFFFF").fontSize(9);
		doc.text("Data", 45, tableTop, { width: colWidths[0] });
		doc.text("Descrição", 45 + colWidths[0], tableTop, { width: colWidths[1] });
		doc.text("Categoria", 45 + colWidths[0] + colWidths[1], tableTop, {
			width: colWidths[2],
		});
		doc.text(
			"Valor",
			45 + colWidths[0] + colWidths[1] + colWidths[2],
			tableTop,
			{
				width: colWidths[3],
				align: "right",
			},
		);

		let y = tableTop + rowHeight;
		for (let idx = 0; idx < transactions.length; idx++) {
			const t = transactions[idx];
			if (idx % 2 === 0) {
				doc.rect(40, y - 3, 510, rowHeight).fill("#FAFAFA");
			}

			doc.fillColor("#333333").fontSize(8);
			doc.text(this.formatDate(t.date), 45, y, { width: colWidths[0] });
			doc.text(t.description.substring(0, 35), 45 + colWidths[0], y, {
				width: colWidths[1],
			});
			doc.text(t.category ?? "-", 45 + colWidths[0] + colWidths[1], y, {
				width: colWidths[2],
			});

			const color = t.type === "income" ? "#4CAF50" : "#F44336";
			doc.fillColor(color);
			doc.text(
				this.formatCurrency(t.amount),
				45 + colWidths[0] + colWidths[1] + colWidths[2],
				y,
				{ width: colWidths[3], align: "right" },
			);

			y += rowHeight;
		}
	}
}

export default new DashboardExportModel();
