import { eq, and, asc, isNull } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db/client'
import { taskMessages, tasks, selectTaskMessageSchema } from '@/lib/db/schema'
import { getServerSession } from '@/lib/session/get-server-session'

export async function GET(req: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await context.params

    // First, verify that the task belongs to the user
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
      .limit(1)

    if (!task.length) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Fetch all messages for this task, ordered by creation time
    const messages = await db
      .select()
      .from(taskMessages)
      .where(eq(taskMessages.taskId, taskId))
      .orderBy(asc(taskMessages.createdAt))
    // Validate messages from the DB with Zod
    const verified = messages.map((m) => selectTaskMessageSchema.parse(m))

    // Convert createdAt to ISO strings for JSON output
    const responseMessages = verified.map((m) => ({ ...m, createdAt: new Date(m.createdAt).toISOString() }))

    return NextResponse.json({ success: true, messages: responseMessages })
  } catch (error) {
    // Avoid logging dynamic error values
    console.error('Error fetching task messages')
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
