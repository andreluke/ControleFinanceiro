import { z } from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').min(2, 'Descrição deve ter no mínimo 2 caracteres'),
  amount: z.string().min(1, 'Valor é obrigatório').refine((val) => {
    const num = parseFloat(val.replace(',', '.'))
    return !isNaN(num) && num > 0
  }, { message: 'Valor deve ser um número positivo' }),
  type: z.enum(['income', 'expense'], { message: 'Tipo é obrigatório' }),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
})

export type TransactionInput = z.infer<typeof transactionSchema>
