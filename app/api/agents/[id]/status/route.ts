import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id

    // TODO: Implement agent status query
    // This would query Redis for agent metrics

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        type: 'claude', // Would be queried from registry
        status: 'idle',
        currentTask: null,
        uptime: 3600,
        tasksCompleted: 42,
        averageResponseTime: 2.5,
      },
    })
  } catch (error) {
    console.error('Failed to get agent status')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get agent status',
      },
      { status: 500 },
    )
  }
}
