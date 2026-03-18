import { z } from 'zod'

export const goalCategorySchema = z.enum([
  'financial',
  'career',
  'health',
  'education',
  'personal',
  'travel',
  'relationships',
  'environment',
])

export const goalStatusSchema = z.enum(['not_started', 'in_progress', 'completed', 'on_hold'])

export const goalPrioritySchema = z.enum(['low', 'medium', 'high'])

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: goalCategorySchema,
  priority: goalPrioritySchema.default('medium'),
  target_date: z.string().datetime().optional(),
  is_public: z.boolean().default(false),
  target_amount: z.number().positive().optional(),
  current_amount: z.number().min(0).default(0).optional(),
})

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: goalStatusSchema.optional(),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
