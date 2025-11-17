import { z } from 'zod'

export const messageJsonSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  role: z.enum(['user', 'agent']),
  content: z.string(),
  // createdAt is expected as an ISO datetime string from the server
  createdAt: z.string(),
})

export const messageJsonArraySchema = z.array(messageJsonSchema)

export type MessageJson = z.infer<typeof messageJsonSchema>
export type MessageJsonArray = z.infer<typeof messageJsonArraySchema>
