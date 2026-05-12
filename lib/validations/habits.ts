import { z } from 'zod'

export const habitFrequencySchema = z.enum(['daily', 'weekly'])

export const createHabitSchema = z.object({
  goal_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  frequency: habitFrequencySchema.default('daily'),
  target_days: z.array(z.number().int().min(0).max(6)).optional(),
})

export const updateHabitSchema = createHabitSchema.partial().omit({ goal_id: true })

export const logHabitSchema = z.object({
  habit_id: z.string().uuid(),
  completed_date: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type LogHabitInput = z.infer<typeof logHabitSchema>
