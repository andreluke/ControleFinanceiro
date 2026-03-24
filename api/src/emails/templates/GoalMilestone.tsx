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
	goalName: string;
	milestone: 50 | 75 | 100;
	currentAmount: number;
	targetAmount: number;
	appUrl: string;
}

export function GoalMilestone({ userName, goalName, milestone, currentAmount, targetAmount, appUrl }: Props) {
	const isCompleted = milestone === 100;

	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>{isCompleted ? "Meta alcançada!" : `Meta "${goalName}" em ${milestone}%`}</Preview>
			<Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
				<Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
					<Heading style={{ fontSize: "20px", color: "#09090b", marginBottom: "8px" }}>
						{isCompleted ? "Meta alcançada! 🎉" : "Progresso na meta"}
					</Heading>

					<Text style={{ color: "#52525b", lineHeight: "1.6" }}>
						Olá, {userName}. {isCompleted ? "Parabéns! Você alcançou sua meta." : `Sua meta "${goalName}" atingiu ${milestone}% do valor esperado.`}
					</Text>

					<Section style={{ backgroundColor: isCompleted ? "#f0fdf4" : "#fef9c3", borderRadius: "6px", padding: "16px", margin: "24px 0" }}>
						<Text style={{ margin: 0, color: isCompleted ? "#166534" : "#713f12" }}>
							Valor atual: <strong>R$ {currentAmount.toFixed(2)}</strong><br />
							Meta: <strong>R$ {targetAmount.toFixed(2)}</strong><br />
							Progresso: <strong>{milestone}%</strong>
						</Text>
					</Section>

					<Button
						href={`${appUrl}/goals`}
						style={{ backgroundColor: isCompleted ? "#16a34a" : "#3b82f6", color: "#ffffff", borderRadius: "6px", padding: "12px 24px", textDecoration: "none", fontSize: "14px" }}
					>
						Ver metas
					</Button>

					<Hr style={{ borderColor: "#e4e4e7", margin: "32px 0 16px" }} />
					<Text style={{ fontSize: "12px", color: "#a1a1aa" }}>
						Você recebe este email porque ativou alertas de metas no ControleFinanceiro.
						Para desativar, acesseu Configurações → Notificações.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}