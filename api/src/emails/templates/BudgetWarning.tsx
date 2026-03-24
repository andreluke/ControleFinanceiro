import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Heading,
	Text,
	Button,
	Hr,
	Section,
} from "@react-email/components";

interface Props {
	userName: string;
	categoryName: string;
	usedPct: number;
	usedAmount: number;
	budgetAmount: number;
	appUrl: string;
}

export function BudgetWarning({ userName, categoryName, usedPct, usedAmount, budgetAmount, appUrl }: Props) {
	const remaining = budgetAmount - usedAmount;

	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>Orçamento de {categoryName} em {String(usedPct)}% — R$ {remaining.toFixed(2)} restantes</Preview>
			<Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
				<Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
					<Heading style={{ fontSize: "20px", color: "#09090b", marginBottom: "8px" }}>
						Atenção ao orçamento
					</Heading>

					<Text style={{ color: "#52525b", lineHeight: "1.6" }}>
						Olá, {userName}. O orçamento de <strong>{categoryName}</strong> atingiu <strong>{usedPct}%</strong> do limite definido.
					</Text>

					<Section style={{ backgroundColor: "#fef9c3", borderRadius: "6px", padding: "16px", margin: "24px 0" }}>
						<Text style={{ margin: 0, color: "#713f12" }}>
							Gasto até agora: <strong>R$ {usedAmount.toFixed(2)}</strong><br />
							Limite do orçamento: <strong>R$ {budgetAmount.toFixed(2)}</strong><br />
							Saldo restante: <strong>R$ {remaining.toFixed(2)}</strong>
						</Text>
					</Section>

					<Button
						href={`${appUrl}/budgets`}
						style={{ backgroundColor: "#3b82f6", color: "#ffffff", borderRadius: "6px", padding: "12px 24px", textDecoration: "none", fontSize: "14px" }}
					>
						Ver orçamentos
					</Button>

					<Hr style={{ borderColor: "#e4e4e7", margin: "32px 0 16px" }} />
					<Text style={{ fontSize: "12px", color: "#a1a1aa" }}>
						Você recebe este email porque ativou alertas de orçamento no ControleFinanceiro.
						Para desativar, acesseu Configurações → Notificações.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}