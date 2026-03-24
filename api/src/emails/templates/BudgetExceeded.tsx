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
	usedAmount: number;
	budgetAmount: number;
	exceededBy: number;
	appUrl: string;
}

export function BudgetExceeded({ userName, categoryName, usedAmount, budgetAmount, exceededBy, appUrl }: Props) {
	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>Orçamento de {categoryName} ultrapassado — R$ {exceededBy.toFixed(2)} acima do limite</Preview>
			<Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
				<Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
					<Heading style={{ fontSize: "20px", color: "#09090b", marginBottom: "8px" }}>
						Orçamento excedido
					</Heading>

					<Text style={{ color: "#52525b", lineHeight: "1.6" }}>
						Olá, {userName}. O orçamento de <strong>{categoryName}</strong> foi ultrapassado.
					</Text>

					<Section style={{ backgroundColor: "#fef2f2", borderRadius: "6px", padding: "16px", margin: "24px 0" }}>
						<Text style={{ margin: 0, color: "#991b1b" }}>
							Total gasto: <strong>R$ {usedAmount.toFixed(2)}</strong><br />
							Limite do orçamento: <strong>R$ {budgetAmount.toFixed(2)}</strong><br />
							Excedido em: <strong>R$ {exceededBy.toFixed(2)}</strong>
						</Text>
					</Section>

					<Button
						href={`${appUrl}/budgets`}
						style={{ backgroundColor: "#dc2626", color: "#ffffff", borderRadius: "6px", padding: "12px 24px", textDecoration: "none", fontSize: "14px" }}
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