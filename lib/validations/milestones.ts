import { z } from 'zod'

export const createMilestoneSchema = z.object({
  goal_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  due_date: z.string().datetime().optional(),
  order_index: z.number().int().min(0).default(0),
})

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  due_date: z.string().datetime().optional(),
  is_completed: z.boolean().optional(),
  order_index: z.number().int().min(0).optional(),
})

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>
