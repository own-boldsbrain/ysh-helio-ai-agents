import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // TODO: Query Redis/DB for list of agents
    // For now, return mock data

    const agents = [
      { id: 'agent-claude-1', type: 'claude', status: 'idle' },
      { id: 'agent-claude-2', type: 'claude', status: 'busy' },
      { id: 'agent-gpt-1', type: 'gpt-4', status: 'idle' },
      { id: 'agent-gemini-1', type: 'gemini', status: 'idle' },
      { id: 'agent-ollama-qwen-1', type: 'ollama-qwen', status: 'idle' },
    ]

    return NextResponse.json({
      success: true,
      count: agents.length,
      agents,
    })
  } catch (error) {
    console.error('Failed to list agents')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list agents',
      },
      { status: 500 },
    )
  }
}
