export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

export function getBudgetNotificationText(
  type: "budget_exceeded" | "budget_warning",
  categoryName: string,
  usedAmount: number,
  budgetAmount: number,
  percentage: number,
): { title: string; body: string } {
  const used = formatCurrency(usedAmount);
  const budget = formatCurrency(budgetAmount);
  const remaining = formatCurrency(budgetAmount - usedAmount);

  if (type === "budget_exceeded") {
    return {
      title: `Orçamento de ${categoryName} excedido`,
      body: `Você usou ${used} de ${budget}`,
    };
  }

  return {
    title: `Orçamento de ${categoryName} em ${percentage.toFixed(0)}%`,
    body: `Restam ${remaining} do orçamento`,
  };
}

export function getGoalNotificationText(
  goalName: string,
  milestone: 50 | 75 | 100,
  currentAmount: number,
  targetAmount: number,
): { title: string; body: string } {
  const current = formatCurrency(currentAmount);
  const target = formatCurrency(targetAmount);

  if (milestone === 100) {
    return {
      title: `Meta "${goalName}" atingida!`,
      body: `Parabéns! Você alcançou ${current}`,
    };
  }

  return {
    title: `Meta "${goalName}" em ${milestone}%`,
    body: `Você já juntou ${current} de ${target}`,
  };
}
