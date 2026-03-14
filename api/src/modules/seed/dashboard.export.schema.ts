import { z } from "zod";

export const exportFilterSchema = z.object({
	startDate: z
		.string()
		.datetime({ message: "Data inicial deve ser ISO 8601 válida" })
		.optional(),
	endDate: z
		.string()
		.datetime({ message: "Data final deve ser ISO 8601 válida" })
		.optional(),
	type: z.enum(["income", "expense"]).optional(),
	categoryId: z.string().uuid().optional(),
});

export type ExportFilter = z.infer<typeof exportFilterSchema>;

export interface TransactionExportRow {
	date: string;
	description: string;
	category: string | null;
	paymentMethod: string | null;
	type: "income" | "expense";
	amount: number;
}

export interface ExcelExportRow {
	valor: string;
	descricao: string;
	categoria: string;
	metodoPagamento: string;
	tipo: string;
	data: string;
	total: number;
}

export interface PdfExportRow {
	date: string;
	description: string;
	category: string;
	type: string;
	total: string;
}
