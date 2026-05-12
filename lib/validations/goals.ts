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

export const goalStatusSchema = z.enum(['active', 'completed', 'paused', 'archived'])

export const goalPrioritySchema = z.enum(['low', 'medium', 'high'])

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: goalCategorySchema,
  priority: goalPrioritySchema.default('medium'),
  target_date: z.string().optional(),
  is_public: z.boolean().default(false),
  estimated_cost: z.number().positive().optional(),
})

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: goalStatusSchema.optional(),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
