import { z } from 'zod'

export const createSavingsTransactionSchema = z.object({
  goal_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
  transaction_date: z.string().datetime().optional(),
})

export type CreateSavingsTransactionInput = z.infer<typeof createSavingsTransactionSchema>
