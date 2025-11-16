import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const cancelTaskSchema = z.object({
  taskId: z.string(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { taskId } = cancelTaskSchema.parse(body)
    const agentId = params.id

    // TODO: Implement task cancellation
    // This would send cancellation signal via RabbitMQ

    return NextResponse.json({
      success: true,
      message: 'Task cancelled successfully',
      taskId,
      agentId,
      status: 'cancelled',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 },
      )
    }

    console.error('Failed to cancel task')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel task',
      },
      { status: 500 },
    )
  }
}
