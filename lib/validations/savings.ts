import { z } from 'zod'

export const createSavingsTransactionSchema = z.object({
  goal_id: z.string().uuid(),
  amount: z.number().positive(),
  transaction_type: z.enum(['deposit', 'withdrawal']).default('deposit'),
  description: z.string().max(500).optional().nullable(),
  transaction_date: z.string().optional(),
})

export type CreateSavingsTransactionInput = z.infer<typeof createSavingsTransactionSchema>
