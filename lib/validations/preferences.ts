import { z } from 'zod'

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  timezone: z.string().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  weekly_digest: z.boolean().optional(),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
