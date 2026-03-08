export function toMonthParam(date: Date): string {
	return date.toISOString().slice(0, 7);
}

export function formatDate(date: Date, locale = "pt-BR"): string {
	return new Intl.DateTimeFormat(locale).format(date);
}
